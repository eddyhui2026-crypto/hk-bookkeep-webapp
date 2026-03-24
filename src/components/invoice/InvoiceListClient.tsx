"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useI18n } from "@/components/I18nProvider";
import { deleteInvoice } from "@/app/app/invoices/actions";
import { formatCurrencyAmount } from "@/lib/constants";

export type InvoiceListRow = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  amount: number;
  currency: string;
};

export function InvoiceListClient({ rows }: { rows: InvoiceListRow[] }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const numLocale = locale === "en" ? "en-HK" : "zh-HK";
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function formatMoney(n: number, currency: string): string {
    return formatCurrencyAmount(n, currency, numLocale);
  }

  function bookkeepHref(r: InvoiceListRow): string {
    const qs = new URLSearchParams();
    qs.set("prefillIncome", "1");
    qs.set("prefillAmount", String(r.amount));
    qs.set("prefillCurrency", r.currency);
    qs.set("prefillDate", r.invoice_date);
    const parts = [r.invoice_number];
    if (r.client_name) parts.push(r.client_name);
    qs.set("prefillNote", parts.join(" · ").slice(0, 400));
    return `/app?${qs.toString()}`;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <Link href="/app" className="text-sm text-brand hover:underline">
            {t("invoice.listBackApp")}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            {t("invoice.listTitle")}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/app/invoices/defaults"
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-brand/10"
          >
            {t("invoice.defaultsSettings")}
          </Link>
          <Link
            href="/app/invoices/contact"
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-brand/10"
          >
            {t("invoice.contactSettings")}
          </Link>
          <Link
            href="/app/invoice"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            {t("invoice.newInvoice")}
          </Link>
        </div>
      </div>

      {err && (
        <p className="mt-4 rounded-lg bg-expense/10 px-3 py-2 text-sm text-expense">{err}</p>
      )}

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted">{t("invoice.listEmpty")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-brand/5 text-left">
                <th className="px-3 py-2.5 font-medium">{t("invoice.colNumber")}</th>
                <th className="px-3 py-2.5 font-medium">{t("invoice.colDate")}</th>
                <th className="px-3 py-2.5 font-medium">{t("invoice.colClient")}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t("invoice.colAmount")}</th>
                <th className="px-3 py-2.5 font-medium">{t("invoice.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 font-medium">{r.invoice_number}</td>
                  <td className="px-3 py-2.5 text-muted">{r.invoice_date}</td>
                  <td className="max-w-[12rem] truncate px-3 py-2.5">{r.client_name}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatMoney(r.amount, r.currency)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/app/invoice/edit?id=${r.id}`}
                        className="text-foreground underline hover:no-underline"
                      >
                        {t("invoice.actionEdit")}
                      </Link>
                      <Link
                        href={bookkeepHref(r)}
                        className="text-foreground underline hover:no-underline"
                      >
                        {t("invoice.actionBookkeep")}
                      </Link>
                      <Link
                        href={`/app/invoice/print?id=${r.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand underline hover:no-underline"
                      >
                        {t("invoice.actionPrint")}
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm(t("invoice.deleteConfirm"))) return;
                          setErr(null);
                          startTransition(async () => {
                            const out = await deleteInvoice(r.id);
                            if (!out.ok) {
                              setErr(out.error ?? t("invoice.errDelete"));
                              return;
                            }
                            router.refresh();
                          });
                        }}
                        className="text-expense underline hover:no-underline disabled:opacity-50"
                      >
                        {t("invoice.actionDelete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
