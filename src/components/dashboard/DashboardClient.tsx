"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import {
  addCategory,
  attachReceipt,
  createLedger,
  createTransaction,
  deleteTransaction,
  renameLedger,
  softDeleteLedger,
  updateTransactionCategory,
} from "@/app/app/actions";
import { createClient } from "@/lib/supabase/client";
import { compressImageToJpeg } from "@/lib/image-compress";
import {
  CATEGORY_MAX_PER_LEDGER,
  currenciesOrderedForMarket,
  defaultCurrencyForMarket,
  LEDGER_MAX,
  RECEIPT_MAX_BYTES,
  RECEIPT_ZIP_MAX_BYTES_UNCOMPRESSED,
  RECEIPT_ZIP_MAX_FILES,
  type CurrencyCode,
} from "@/lib/constants";
import { categoriesForMarketSelect } from "@/lib/categories-ui";
import { currentTaxYearStart, defaultExportYearKey } from "@/lib/reports";
import { useAppSnap } from "@/components/app/AppSnapContext";
import { isLikelyReceiptImageFile } from "@/lib/receipt-file";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { LedgerFxRatesForm } from "@/components/dashboard/LedgerFxRatesForm";
import { TwEinvoiceQrScanModal } from "@/components/dashboard/TwEinvoiceQrScanModal";
import type { TxForChart } from "@/lib/dashboard-chart-data";
import { categoryLabel } from "@/lib/category-label";
import type { QuickAddIncomePrefill } from "@/lib/app-prefill";
import { taiwanEInvoiceNoteFromParsed } from "@/lib/tw-einvoice-qr";

function appTrialDaysRemaining(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.ceil(ms / 86400000));
}

type Tx = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  note: string | null;
  tx_date: string;
  category_id: string | null;
  category_name: string | null;
  receipt_path: string | null;
};

export function DashboardClient({
  userId,
  canWrite,
  readOnly,
  trialEndsAt,
  subscriptionStatus,
  hasStripeCustomer,
  ledgers,
  activeLedgerId,
  categories,
  transactions,
  sums,
  chartTxs,
  chartCurrency,
  fxChartsUnified = false,
  fxFormCurrencies = [],
  fxMergedRates = {},
  reportYear,
  reportMonth,
  quickAddIncomePrefill,
}: {
  userId: string;
  canWrite: boolean;
  readOnly: boolean;
  trialEndsAt: string | null;
  subscriptionStatus: string;
  hasStripeCustomer: boolean;
  ledgers: { id: string; name: string }[];
  activeLedgerId: string | null;
  categories: { id: string; name: string; color: string; slug: string | null }[];
  transactions: Tx[];
  sums: { currency: string; income: number; expense: number }[];
  chartTxs: TxForChart[];
  chartCurrency: string;
  fxChartsUnified?: boolean;
  fxFormCurrencies?: string[];
  fxMergedRates?: Record<string, number>;
  reportYear: number;
  reportMonth: number;
  quickAddIncomePrefill: QuickAddIncomePrefill;
}) {
  const { locale, t } = useI18n();
  const market = useMarket();
  const currencyOptions = currenciesOrderedForMarket(market);
  const { receiptQueue, dequeueReceipt, snapEnabled } = useAppSnap();
  const receiptQueueBacklog = receiptQueue.length;
  const colon = locale === "zh" ? "：" : ": ";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [twScanOpen, setTwScanOpen] = useState(false);
  const [twScanErr, setTwScanErr] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(() =>
    defaultCurrencyForMarket(market)
  );
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState<string>("");
  const quickAddCategories = useMemo(
    () =>
      categoriesForMarketSelect(categories, market, categoryId || undefined),
    [categories, market, categoryId]
  );
  const [note, setNote] = useState("");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const quickAddRef = useRef<HTMLFormElement | null>(null);
  const prefillIncomeAppliedRef = useRef(false);
  const [newLedgerName, setNewLedgerName] = useState("");
  const [showLedgerForm, setShowLedgerForm] = useState(() => ledgers.length === 0);
  const [ledgerDiscardDialogOpen, setLedgerDiscardDialogOpen] = useState(false);
  const [ledgerDeleteTarget, setLedgerDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [ledgerRenameTarget, setLedgerRenameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameLedgerDraft, setRenameLedgerDraft] = useState("");
  const renameLedgerInputRef = useRef<HTMLInputElement>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366f1");

  const [receiptPreview, setReceiptPreview] = useState<{
    url: string;
    path: string;
  } | null>(null);
  const [receiptLoadingPath, setReceiptLoadingPath] = useState<string | null>(null);
  const [receiptDownloadingPath, setReceiptDownloadingPath] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!twScanErr) return;
    const id = window.setTimeout(() => setTwScanErr(null), 5200);
    return () => window.clearTimeout(id);
  }, [twScanErr]);

  useEffect(() => {
    if (!receiptPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReceiptPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [receiptPreview]);

  useEffect(() => {
    if (!ledgerDiscardDialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLedgerDiscardDialogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ledgerDiscardDialogOpen]);

  useEffect(() => {
    if (!ledgerDeleteTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLedgerDeleteTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ledgerDeleteTarget]);

  useEffect(() => {
    if (!activeLedgerId || file !== null) return;
    const next = dequeueReceipt();
    if (!next) return;
    setFile(next);
    requestAnimationFrame(() => {
      quickAddRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.setTimeout(() => amountInputRef.current?.focus(), 400);
    });
  }, [activeLedgerId, file, receiptQueueBacklog, dequeueReceipt]);

  useEffect(() => {
    if (!quickAddIncomePrefill) {
      prefillIncomeAppliedRef.current = false;
      return;
    }
    if (prefillIncomeAppliedRef.current) return;
    prefillIncomeAppliedRef.current = true;

    setAmount(quickAddIncomePrefill.amount);
    setCurrency(quickAddIncomePrefill.currency);
    setType("income");
    setNote(quickAddIncomePrefill.note);
    setTxDate(quickAddIncomePrefill.txDate);

    requestAnimationFrame(() => {
      quickAddRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    const q = new URLSearchParams();
    if (activeLedgerId) q.set("ledger", activeLedgerId);
    const next = q.toString() ? `/app?${q}` : "/app";
    router.replace(next, { scroll: false });
  }, [quickAddIncomePrefill, activeLedgerId, router]);

  async function openReceiptPreview(storagePath: string) {
    setErr(null);
    setReceiptLoadingPath(storagePath);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("receipts")
        .createSignedUrl(storagePath, 3600);
      if (error || !data?.signedUrl) {
        setErr(t("dashboard.receiptOpenErr"));
        return;
      }
      setReceiptPreview({ url: data.signedUrl, path: storagePath });
    } catch {
      setErr(t("dashboard.receiptOpenErr"));
    } finally {
      setReceiptLoadingPath(null);
    }
  }

  async function downloadReceiptFile(storagePath: string, existingSignedUrl?: string) {
    setErr(null);
    setReceiptDownloadingPath(storagePath);
    try {
      let url = existingSignedUrl;
      if (!url) {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("receipts")
          .createSignedUrl(storagePath, 3600);
        if (error || !data?.signedUrl) {
          setErr(t("dashboard.receiptOpenErr"));
          return;
        }
        url = data.signedUrl;
      }
      const res = await fetch(url);
      if (!res.ok) {
        setErr(t("dashboard.receiptOpenErr"));
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = storagePath.split("/").pop() ?? "receipt.jpg";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setErr(t("dashboard.receiptOpenErr"));
    } finally {
      setReceiptDownloadingPath(null);
    }
  }

  async function startCheckout(price: "monthly" | "yearly") {
    setErr(null);
    try {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
        credentials: "same-origin",
      });
      let j: { error?: string; url?: string } = {};
      try {
        j = (await r.json()) as typeof j;
      } catch {
        setErr(t("dashboard.errBadResponse"));
        return;
      }
      if (!r.ok) {
        setErr(j.error ?? t("dashboard.errCheckout"));
        return;
      }
      if (j.url) window.location.href = j.url;
      else setErr(t("dashboard.errCheckout"));
    } catch (e) {
      setErr(
        e instanceof TypeError && e.message === "Failed to fetch"
          ? t("dashboard.errNetwork")
          : e instanceof Error
            ? e.message
            : t("dashboard.errNetwork")
      );
    }
  }

  async function openPortal() {
    setErr(null);
    try {
      const r = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "same-origin",
      });
      let j: { error?: string; url?: string } = {};
      try {
        j = (await r.json()) as typeof j;
      } catch {
        setErr(t("dashboard.errBadResponse"));
        return;
      }
      if (!r.ok) {
        setErr(j.error ?? t("dashboard.errPortal"));
        return;
      }
      if (j.url) window.location.href = j.url;
      else setErr(t("dashboard.errPortal"));
    } catch (e) {
      setErr(
        e instanceof TypeError && e.message === "Failed to fetch"
          ? t("dashboard.errNetwork")
          : e instanceof Error
            ? e.message
            : t("dashboard.errNetwork")
      );
    }
  }

  function switchLedger(id: string) {
    router.push(`/app?ledger=${id}`);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeLedgerId || !canWrite) return;
    setErr(null);
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) {
      setErr(t("dashboard.errAmount"));
      return;
    }
    const cat = categoryId || null;

    startTransition(async () => {
      try {
        const id = await createTransaction({
          ledgerId: activeLedgerId,
          type,
          amount: amt,
          currency,
          categoryId: cat,
          note,
          txDate,
        });

        if (file && isLikelyReceiptImageFile(file)) {
          const blob = await compressImageToJpeg(
            file,
            undefined,
            market === "tw"
              ? "tw"
              : market === "sg"
                ? locale === "zh"
                  ? "sgZh"
                  : "sg"
                : "hk"
          );
          if (blob.size > RECEIPT_MAX_BYTES) {
            setErr(t("dashboard.errReceiptBig"));
            return;
          }
          const path = `${userId}/${id}.jpg`;
          const supabase = createClient();
          const { error: upErr } = await supabase.storage
            .from("receipts")
            .upload(path, blob, { contentType: "image/jpeg", upsert: true });
          if (upErr) {
            setErr(upErr.message);
            return;
          }
          await attachReceipt(id, path);
        }

        setAmount("");
        setNote("");
        setFile(null);
        if (receiptInputRef.current) receiptInputRef.current.value = "";
        router.refresh();
      } catch (x) {
        setErr(x instanceof Error ? x.message : t("dashboard.errFail"));
      }
    });
  }

  async function onDeleteTx(id: string) {
    if (!canWrite) return;
    if (!confirm(t("dashboard.confirmDelete"))) return;
    startTransition(async () => {
      try {
        await deleteTransaction(id);
        router.refresh();
      } catch (x) {
        setErr(x instanceof Error ? x.message : t("dashboard.errDelete"));
      }
    });
  }

  function onChangeTxCategory(txId: string, raw: string) {
    if (!canWrite) return;
    const nextId = raw === "" ? null : raw;
    setErr(null);
    startTransition(async () => {
      try {
        await updateTransactionCategory(txId, nextId);
        router.refresh();
      } catch (x) {
        setErr(x instanceof Error ? x.message : t("dashboard.errFail"));
      }
    });
  }

  async function onCreateLedger(template?: "freelance" | "shop") {
    if (!canWrite) return;
    setErr(null);
    startTransition(async () => {
      try {
        await createLedger(newLedgerName, template, locale);
        setNewLedgerName("");
        setShowLedgerForm(false);
        router.refresh();
      } catch (x) {
        setErr(x instanceof Error ? x.message : t("dashboard.errCreate"));
      }
    });
  }

  function cancelLedgerForm() {
    setNewLedgerName("");
    setShowLedgerForm(false);
    setLedgerDiscardDialogOpen(false);
  }

  function transactionCategoryLabel(tx: Tx): string | null {
    if (!tx.category_id) return null;
    const c = categories.find((x) => x.id === tx.category_id);
    if (c) return categoryLabel(t, c);
    return tx.category_name;
  }

  async function confirmDeleteLedger() {
    if (!ledgerDeleteTarget || !canWrite) return;
    setErr(null);
    const target = ledgerDeleteTarget;
    startTransition(async () => {
      try {
        await softDeleteLedger(target.id);
        setLedgerDeleteTarget(null);
        if (target.id === activeLedgerId) router.push("/app");
        else router.refresh();
      } catch (x) {
        setErr(x instanceof Error ? x.message : t("dashboard.errDelete"));
      }
    });
  }

  async function confirmRenameLedger() {
    if (!ledgerRenameTarget || !canWrite) return;
    const name = renameLedgerDraft.trim();
    if (!name) {
      setErr(t("dashboard.errLedgerName"));
      return;
    }
    setErr(null);
    const target = ledgerRenameTarget;
    startTransition(async () => {
      try {
        await renameLedger(target.id, name);
        setLedgerRenameTarget(null);
        router.refresh();
      } catch (x) {
        setErr(x instanceof Error ? x.message : t("dashboard.errRenameLedger"));
      }
    });
  }

  async function onAddCategory() {
    if (!activeLedgerId || !canWrite) return;
    setErr(null);
    const name = newCategoryName.trim();
    if (!name) {
      setErr(t("dashboard.errCategoryName"));
      return;
    }
    if (categories.length >= CATEGORY_MAX_PER_LEDGER) {
      setErr(t("dashboard.categoryLimitReached"));
      return;
    }
    startTransition(async () => {
      try {
        const id = await addCategory(activeLedgerId, name, newCategoryColor);
        setNewCategoryName("");
        setCategoryId(id);
        router.refresh();
      } catch (x) {
        setErr(x instanceof Error ? x.message : t("dashboard.errFail"));
      }
    });
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const reportQs = activeLedgerId
    ? `ledgerId=${activeLedgerId}&year=${y}&month=${m}`
    : "";

  const nowCal = new Date();
  const calYear = nowCal.getFullYear();
  const taxYearOptions =
    market === "hk"
      ? (() => {
          const base = currentTaxYearStart(nowCal);
          return [base, base - 1, base - 2];
        })()
      : [calYear, calYear - 1, calYear - 2];

  const [taxExportYear, setTaxExportYear] = useState(() =>
    defaultExportYearKey(market)
  );
  useEffect(() => {
    setTaxExportYear(defaultExportYearKey(market, new Date()));
  }, [activeLedgerId, market]);

  const taxSummaryQs =
    activeLedgerId && Number.isInteger(taxExportYear)
      ? `ledgerId=${activeLedgerId}&taxYear=${taxExportYear}`
      : "";

  const receiptZipMb = Math.round(
    RECEIPT_ZIP_MAX_BYTES_UNCOMPRESSED / 1024 / 1024
  );

  const incomeLabel = t("dashboard.income");
  const expenseLabel = t("dashboard.expense");
  const categoryRemaining = Math.max(0, CATEGORY_MAX_PER_LEDGER - categories.length);
  const trialDays = appTrialDaysRemaining(trialEndsAt);
  const showTrialHint =
    canWrite &&
    subscriptionStatus === "trialing" &&
    trialDays !== null &&
    trialDays > 0;

  return (
    <div
      className={`mx-auto max-w-5xl space-y-6 px-4 py-8 ${
        snapEnabled && activeLedgerId && canWrite && !readOnly
          ? "pb-[max(8rem,calc(6rem+env(safe-area-inset-bottom,0px)))]"
          : ""
      }`}
    >
      {readOnly && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-foreground">
          <strong>{t("dashboard.readOnlyTitle")}</strong>
          {colon}
          {t("dashboard.readOnlyBody")}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => startCheckout("monthly")}
              className="rounded-full bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover sm:text-sm"
            >
              {t("dashboard.monthly")}
            </button>
            <button
              type="button"
              onClick={() => startCheckout("yearly")}
              className="rounded-full border border-brand/50 bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-brand/10 sm:text-sm"
            >
              {t("dashboard.yearly")}
            </button>
            {hasStripeCustomer && (
              <button
                type="button"
                onClick={() => openPortal()}
                className="text-xs underline sm:text-sm"
              >
                {t("dashboard.openPortal")}
              </button>
            )}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("dashboard.overview")}
        </h1>
        {showTrialHint && (
          <p className="mt-1 text-sm text-muted">
            {trialDays === 1
              ? t("dashboard.trialDaysOne")
              : t("dashboard.trialDaysLeft", { days: trialDays ?? 0 })}
          </p>
        )}
      </div>

      {activeLedgerId && reportQs && (
        <div className="space-y-3 text-sm">
          <div>
            <a
              className="inline-flex rounded-full border border-border px-3 py-1.5 hover:bg-brand/10"
              href={`/api/reports/csv?${reportQs}`}
            >
              {t("dashboard.exportCsv")}
            </a>
          </div>
          <div>
            <a
              className="inline-flex rounded-full border border-border px-3 py-1.5 hover:bg-brand/10"
              href={`/app/reports/print?${reportQs}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("dashboard.exportPrintPage")}
            </a>
          </div>
          <div className="mt-3 max-w-md space-y-2 rounded-xl border border-border/80 bg-muted/15 p-3">
            <label className="block text-xs font-medium text-muted">
              {market === "hk"
                ? t("dashboard.taxYearForExportHK")
                : t("dashboard.taxYearForExportCal")}
            </label>
            <select
              value={taxExportYear}
              onChange={(e) => setTaxExportYear(Number(e.target.value))}
              className="w-full max-w-xs rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
            >
              {taxYearOptions.map((start) => (
                <option key={start} value={start}>
                  {market === "hk"
                    ? t("dashboard.taxYearOptionHK", {
                        y1: start,
                        y2: String(start + 1).slice(-2),
                      })
                    : t("dashboard.taxYearOptionCal", { year: start })}
                </option>
              ))}
            </select>
            {taxSummaryQs && (
              <>
                <div>
                  <a
                    className="inline-flex rounded-full border border-border px-3 py-1.5 hover:bg-brand/10"
                    href={`/app/reports/tax-summary/print?${taxSummaryQs}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("dashboard.taxSummaryPrint")}
                  </a>
                </div>
                <div>
                  <a
                    className="inline-flex rounded-full border border-border px-3 py-1.5 hover:bg-brand/10"
                    href={`/api/receipts/zip?${taxSummaryQs}`}
                  >
                    {t("dashboard.receiptZipDownload")}
                  </a>
                </div>
                <p className="text-xs text-muted">
                  {t("dashboard.receiptZipHint", {
                    files: RECEIPT_ZIP_MAX_FILES,
                    mb: receiptZipMb,
                  })}
                </p>
              </>
            )}
          </div>
          <p className="max-w-xl text-muted">{t("dashboard.exportHint")}</p>
        </div>
      )}

      <div className="text-sm">
        <Link
          href="/app/invoices"
          className="inline-flex rounded-full border border-border px-3 py-1.5 hover:bg-brand/10"
        >
          {t("invoice.dashLink")}
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-medium text-muted">
          {t("dashboard.monthSums")}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {sums.length === 0 ? (
            <p className="text-sm text-muted">{t("dashboard.noTx")}</p>
          ) : (
            sums.map((s) => (
              <div
                key={s.currency}
                className="rounded-xl bg-brand/5 px-4 py-3 text-sm"
              >
                <div className="font-medium text-foreground">{s.currency}</div>
                <div className="mt-1 text-income">
                  {incomeLabel} {s.income.toFixed(2)}
                </div>
                <div className="text-expense">
                  {expenseLabel} {s.expense.toFixed(2)}
                </div>
                <div className="mt-1 font-semibold text-foreground">
                  {t("dashboard.net")} {(s.income - s.expense).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {activeLedgerId && fxChartsUnified && fxFormCurrencies.length > 0 && (
        <>
          <p className="text-sm text-muted">
            {t("dashboard.fxChartsNote", { anchor: chartCurrency })}
          </p>
          <LedgerFxRatesForm
            ledgerId={activeLedgerId}
            anchorCurrency={chartCurrency}
            currencies={fxFormCurrencies}
            mergedRates={fxMergedRates}
            canWrite={canWrite && !readOnly}
          />
        </>
      )}

      {activeLedgerId && (
        <DashboardCharts
          chartTxs={chartTxs}
          chartCurrency={chartCurrency}
          reportYear={reportYear}
          reportMonth={reportMonth}
          categories={categories}
        />
      )}

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-medium text-foreground">
          {t("dashboard.ledgers")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ledgers.map((l) => {
            const active = l.id === activeLedgerId;
            return (
              <div
                key={l.id}
                className={`inline-flex items-stretch overflow-hidden rounded-full border text-sm ${
                  active
                    ? "border-brand bg-brand text-white shadow-sm"
                    : "border-border bg-card"
                }`}
              >
                <button
                  type="button"
                  onClick={() => switchLedger(l.id)}
                  className={`max-w-[12rem] truncate px-3 py-1.5 text-left sm:max-w-[16rem] ${
                    active ? "" : "text-foreground hover:bg-brand/10"
                  }`}
                >
                  {l.name}
                </button>
                {canWrite && (
                  <button
                    type="button"
                    aria-label={t("dashboard.ledgerRenameAria")}
                    title={t("dashboard.ledgerRenameAria")}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLedgerRenameTarget({ id: l.id, name: l.name });
                    }}
                    className={`flex shrink-0 items-center justify-center border-l px-2 ${
                      active
                        ? "border-white/35 text-white hover:bg-white/15"
                        : "border-border text-muted hover:bg-brand/10 hover:text-foreground"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                )}
                {canWrite && (
                  <button
                    type="button"
                    aria-label={t("dashboard.ledgerDeleteAria")}
                    title={t("dashboard.ledgerDeleteAria")}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLedgerDeleteTarget({ id: l.id, name: l.name });
                    }}
                    className={`flex shrink-0 items-center justify-center border-l px-2 ${
                      active
                        ? "border-white/35 text-white hover:bg-white/15"
                        : "border-border text-muted hover:bg-expense/10 hover:text-expense"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {readOnly && ledgers.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted">
            <p className="font-medium text-foreground">
              {t("dashboard.writeBlockedTitle")}
            </p>
            <p className="mt-1">{t("dashboard.writeBlockedBody")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startCheckout("monthly")}
                className="rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover sm:text-sm"
              >
                {t("dashboard.monthly")}
              </button>
              <button
                type="button"
                onClick={() => startCheckout("yearly")}
                className="rounded-full border border-brand/50 bg-card px-3 py-1.5 text-xs font-medium hover:bg-brand/10 sm:text-sm"
              >
                {t("dashboard.yearly")}
              </button>
            </div>
          </div>
        )}
        {canWrite && ledgers.length < LEDGER_MAX && (
          <div className="mt-4 border-t border-border pt-4">
            {!showLedgerForm ? (
              <button
                type="button"
                onClick={() => setShowLedgerForm(true)}
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-brand/10"
              >
                {t("dashboard.openAddLedger")}
              </button>
            ) : (
              <div className="relative rounded-xl border border-dashed border-border bg-brand/5 p-4 pt-4 pr-14 sm:pr-16">
                <div className="border-b border-border pb-3 pr-2">
                  <span className="text-sm font-medium text-foreground">
                    {t("dashboard.ledgerFormTitle")}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <input
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    placeholder={t("dashboard.newLedgerPh")}
                    value={newLedgerName}
                    onChange={(e) => setNewLedgerName(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onCreateLedger()}
                      className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-hover"
                    >
                      {t("dashboard.add")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCreateLedger("freelance")}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-brand/10"
                    >
                      {t("dashboard.tplFreelance")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCreateLedger("shop")}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-brand/10"
                    >
                      {t("dashboard.tplShop")}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLedgerDiscardDialogOpen(true)}
                  title={t("dashboard.ledgerCloseAria")}
                  aria-label={t("dashboard.ledgerCloseAria")}
                  className="absolute right-2 top-2 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-card text-foreground shadow-sm transition-colors hover:border-expense/50 hover:bg-expense/10 hover:text-expense focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {activeLedgerId && canWrite && (
        <form
          ref={quickAddRef}
          id="dashboard-quick-add"
          onSubmit={onSubmit}
          className="scroll-mt-6 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <h2 className="text-sm font-medium text-foreground">
            {t("dashboard.quickAdd")}
          </h2>
          {market === "tw" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <button
                type="button"
                className="w-fit rounded-lg border border-brand/50 bg-brand/10 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-brand/15"
                onClick={() => {
                  setTwScanErr(null);
                  setTwScanOpen(true);
                }}
              >
                {t("dashboard.twEinvoiceScan")}
              </button>
              <p className="text-xs text-muted">{t("dashboard.twEinvoiceScanHint")}</p>
            </div>
          )}
          {market === "tw" && twScanErr && (
            <p className="text-xs text-expense" role="alert">
              {twScanErr}
            </p>
          )}
          {market === "tw" && (
            <TwEinvoiceQrScanModal
              open={twScanOpen}
              onClose={() => setTwScanOpen(false)}
              onParsed={(p) => {
                setAmount(String(p.totalAmount));
                setCurrency("TWD");
                setType("expense");
                setTxDate(p.gregorianDateIso);
                setNote(taiwanEInvoiceNoteFromParsed(p));
                setTwScanErr(null);
                requestAnimationFrame(() => amountInputRef.current?.focus());
              }}
              title={t("dashboard.twEinvoiceModalTitle")}
              hint={t("dashboard.twEinvoiceModalHint")}
              scanning={t("dashboard.twEinvoiceScanning")}
              closeLabel={t("dashboard.twEinvoiceClose")}
              errStart={t("dashboard.twEinvoiceErrStart")}
              onStartError={setTwScanErr}
            />
          )}
          {file && (
            <div className="space-y-2">
              <p className="rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs text-foreground">
                {t("dashboard.receiptQueuedHint")}
              </p>
              {receiptQueueBacklog > 0 && (
                <p className="text-xs text-muted">
                  {t("dashboard.receiptQueueBacklog", { n: receiptQueueBacklog })}
                </p>
              )}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              ref={amountInputRef}
              required
              inputMode="decimal"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              placeholder={t("dashboard.amountPh")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              className="rounded-lg border border-border px-3 py-2 text-sm"
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as CurrencyCode)
              }
            >
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-border px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
            >
              <option value="expense">{t("dashboard.typeExpense")}</option>
              <option value="income">{t("dashboard.typeIncome")}</option>
            </select>
            <input
              type="date"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
            />
          </div>
          <select
            className="w-full rounded-lg border border-border px-3 py-2 text-sm sm:max-w-md"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{t("dashboard.categoryOpt")}</option>
            {quickAddCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryLabel(t, c)}
              </option>
            ))}
          </select>
          <div className="space-y-2 rounded-lg border border-dashed border-border bg-brand/5 px-3 py-3">
            <p className="text-xs text-muted">
              {t("dashboard.categoryLimitHint", {
                current: categories.length,
                max: CATEGORY_MAX_PER_LEDGER,
                remaining: categoryRemaining,
              })}
            </p>
            <div className="flex flex-wrap items-end gap-2">
              <input
                type="text"
                className="min-w-[10rem] flex-1 rounded-lg border border-border px-3 py-2 text-sm sm:max-w-xs"
                placeholder={t("dashboard.newCategoryPh")}
                value={newCategoryName}
                disabled={categoryRemaining === 0}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <label className="flex items-center gap-2 text-xs text-muted">
                <span>{t("dashboard.categoryColor")}</span>
                <input
                  type="color"
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-card p-0.5 disabled:opacity-50"
                  value={newCategoryColor}
                  disabled={categoryRemaining === 0}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  aria-label={t("dashboard.categoryColor")}
                />
              </label>
              <button
                type="button"
                onClick={() => void onAddCategory()}
                disabled={pending || categoryRemaining === 0}
                className="rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {t("dashboard.addCategory")}
              </button>
            </div>
          </div>
          <input
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder={t("dashboard.notePh")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="rounded-lg border border-border border-dashed bg-brand/5 px-3 py-3">
            <p className="text-xs font-medium text-foreground">
              {t("dashboard.receiptLabel")}
            </p>
            <p className="mt-1 text-xs text-muted">
              {t("dashboard.receiptExtensions")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={receiptInputRef}
                id="dashboard-receipt-file"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <label
                htmlFor="dashboard-receipt-file"
                className="inline-flex cursor-pointer rounded-lg border border-brand/40 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-brand hover:bg-brand/10"
              >
                {t("dashboard.receiptPick")}
              </label>
              {file ? (
                <>
                  <span className="max-w-[200px] truncate text-sm text-foreground sm:max-w-xs">
                    {file.name?.trim()
                      ? file.name
                      : t("dashboard.receiptCameraUnnamed")}
                  </span>
                  <button
                    type="button"
                    className="text-sm text-expense underline hover:no-underline"
                    onClick={() => {
                      setFile(null);
                      if (receiptInputRef.current) receiptInputRef.current.value = "";
                    }}
                  >
                    {t("dashboard.receiptClear")}
                  </button>
                </>
              ) : (
                <span className="text-sm text-muted">{t("dashboard.receiptNone")}</span>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-income px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? t("dashboard.pending") : t("dashboard.submit")}
          </button>
        </form>
      )}

      {activeLedgerId && readOnly && (
        <section className="space-y-3 rounded-2xl border border-dashed border-border bg-muted/20 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">
            {t("dashboard.writeBlockedTitle")}
          </h2>
          <p className="text-sm text-muted">{t("dashboard.writeBlockedBody")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startCheckout("monthly")}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
            >
              {t("dashboard.monthly")}
            </button>
            <button
              type="button"
              onClick={() => startCheckout("yearly")}
              className="rounded-full border border-brand/50 bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-brand/10"
            >
              {t("dashboard.yearly")}
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-medium text-foreground">
          {t("dashboard.recent")}
        </h2>
        <ul className="mt-3 divide-y divide-border">
          {transactions.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted">
              {t("dashboard.noRecords")}
            </li>
          ) : (
            transactions.map((tx) => {
              const catLabel = !canWrite ? transactionCategoryLabel(tx) : null;
              return (
              <li
                key={tx.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {tx.tx_date}
                  </span>
                  <span className="ml-2 text-muted">
                    {tx.type === "income" ? incomeLabel : expenseLabel} ·{" "}
                    {tx.currency} {tx.amount}
                  </span>
                  {!canWrite && catLabel && (
                    <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs">
                      {catLabel}
                    </span>
                  )}
                  {tx.note && <p className="text-muted">{tx.note}</p>}
                  {tx.receipt_path && (
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <button
                        type="button"
                        onClick={() => void openReceiptPreview(tx.receipt_path!)}
                        disabled={receiptLoadingPath === tx.receipt_path}
                        className="text-brand underline decoration-brand/40 hover:no-underline disabled:opacity-60"
                      >
                        {receiptLoadingPath === tx.receipt_path
                          ? t("dashboard.receiptLoading")
                          : t("dashboard.receiptView")}
                      </button>
                      <button
                        type="button"
                        onClick={() => void downloadReceiptFile(tx.receipt_path!)}
                        disabled={receiptDownloadingPath === tx.receipt_path}
                        className="text-brand underline decoration-brand/40 hover:no-underline disabled:opacity-60"
                      >
                        {receiptDownloadingPath === tx.receipt_path
                          ? t("dashboard.receiptLoading")
                          : t("dashboard.receiptDownload")}
                      </button>
                    </p>
                  )}
                </div>
                {canWrite && (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-muted">
                      <span className="whitespace-nowrap">{t("dashboard.txCategoryLabel")}</span>
                      <select
                        className="max-w-[11rem] rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
                        value={tx.category_id ?? ""}
                        onChange={(e) => onChangeTxCategory(tx.id, e.target.value)}
                        disabled={pending}
                        aria-label={t("dashboard.txCategoryAria")}
                      >
                        <option value="">{t("dashboard.txCategoryUnset")}</option>
                        {categoriesForMarketSelect(
                          categories,
                          market,
                          tx.category_id
                        ).map((c) => (
                          <option key={c.id} value={c.id}>
                            {categoryLabel(t, c)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => onDeleteTx(tx.id)}
                      disabled={pending}
                      className="text-xs text-expense hover:underline disabled:opacity-50"
                    >
                      {t("dashboard.delete")}
                    </button>
                  </div>
                )}
              </li>
              );
            })
          )}
        </ul>
      </section>

      {err && (
        <p className="rounded-lg bg-expense/10 px-3 py-2 text-sm text-expense">
          {err}
        </p>
      )}

      {ledgerDiscardDialogOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="ledger-discard-title"
          aria-describedby="ledger-discard-desc"
          onClick={() => setLedgerDiscardDialogOpen(false)}
        >
          <div
            className="max-w-md rounded-xl border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="ledger-discard-title"
              className="text-base font-semibold text-foreground"
            >
              {t("dashboard.ledgerDiscardTitle")}
            </h3>
            <p id="ledger-discard-desc" className="mt-2 text-sm text-muted">
              {t("dashboard.ledgerDiscardBody")}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setLedgerDiscardDialogOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
              >
                {t("dashboard.ledgerDiscardBack")}
              </button>
              <button
                type="button"
                onClick={cancelLedgerForm}
                className="rounded-lg bg-expense px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                {t("dashboard.ledgerDiscardConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {ledgerRenameTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ledger-rename-title"
          onClick={() => setLedgerRenameTarget(null)}
        >
          <form
            className="max-w-md rounded-xl border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              void confirmRenameLedger();
            }}
          >
            <h3
              id="ledger-rename-title"
              className="text-base font-semibold text-foreground"
            >
              {t("dashboard.ledgerRenameTitle")}
            </h3>
            <label htmlFor="ledger-rename-input" className="sr-only">
              {t("dashboard.ledgerRenamePh")}
            </label>
            <input
              id="ledger-rename-input"
              ref={renameLedgerInputRef}
              value={renameLedgerDraft}
              onChange={(e) => setRenameLedgerDraft(e.target.value)}
              maxLength={200}
              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/30"
              placeholder={t("dashboard.ledgerRenamePh")}
              autoComplete="off"
            />
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setLedgerRenameTarget(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
              >
                {t("dashboard.ledgerRenameCancel")}
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {t("dashboard.ledgerRenameSave")}
              </button>
            </div>
          </form>
        </div>
      )}

      {ledgerDeleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="ledger-delete-title"
          aria-describedby="ledger-delete-desc"
          onClick={() => setLedgerDeleteTarget(null)}
        >
          <div
            className="max-w-md rounded-xl border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="ledger-delete-title"
              className="text-base font-semibold text-foreground"
            >
              {t("dashboard.ledgerDeleteTitle")}
            </h3>
            <p id="ledger-delete-desc" className="mt-2 text-sm text-muted">
              {t("dashboard.ledgerDeleteBody", { name: ledgerDeleteTarget.name })}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setLedgerDeleteTarget(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
              >
                {t("dashboard.ledgerDeleteBack")}
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteLedger()}
                disabled={pending}
                className="rounded-lg bg-expense px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {t("dashboard.ledgerDeleteConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("dashboard.receiptView")}
          onClick={() => setReceiptPreview(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-[min(100%,56rem)] overflow-auto rounded-xl border border-border bg-card p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-3 top-3 z-10 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  void downloadReceiptFile(receiptPreview.path, receiptPreview.url)
                }
                disabled={receiptDownloadingPath === receiptPreview.path}
                className="rounded-full border border-border bg-card px-3 py-1 text-sm shadow-sm hover:bg-muted/40 disabled:opacity-60"
              >
                {receiptDownloadingPath === receiptPreview.path
                  ? t("dashboard.receiptLoading")
                  : t("dashboard.receiptDownload")}
              </button>
              <button
                type="button"
                onClick={() => setReceiptPreview(null)}
                className="rounded-full border border-border bg-card px-3 py-1 text-sm shadow-sm hover:bg-muted/40"
              >
                {t("dashboard.receiptClose")}
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL, not static import */}
            <img
              src={receiptPreview.url}
              alt=""
              className="mx-auto mt-12 block max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
