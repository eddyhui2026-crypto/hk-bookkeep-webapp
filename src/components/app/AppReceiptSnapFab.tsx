"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import { useAppSnap } from "@/components/app/AppSnapContext";
import { useTwEinvoiceScan } from "@/components/app/TwEinvoiceScanContext";
import { RECEIPT_SNAP_QUEUE_MAX } from "@/lib/constants";
import { isLikelyReceiptImageFile } from "@/lib/receipt-file";

function QrGlyph({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2" />
      <rect x="7" y="7" width="4" height="4" rx="0.5" />
      <rect x="13" y="7" width="4" height="4" rx="0.5" />
      <rect x="7" y="13" width="4" height="4" rx="0.5" />
      <path d="M14 14h1M14 17h3M17 14v5" />
    </svg>
  );
}

function CameraGlyph({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4.5 9.5h2l1.5-2.5h8l1.5 2.5h2A1.5 1.5 0 0 1 21 11v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19v-8a1.5 1.5 0 0 1 1.5-1.5Z" />
      <circle cx="12" cy="14" r="3.35" />
    </svg>
  );
}

export function AppReceiptSnapFab() {
  const { t } = useI18n();
  const market = useMarket();
  const twEinvoice = useTwEinvoiceScan();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const { enqueueReceipt, snapEnabled, defaultLedgerId } = useAppSnap();
  const [fabErr, setFabErr] = useState<string | null>(null);

  useEffect(() => {
    if (!fabErr) return;
    const id = window.setTimeout(() => setFabErr(null), 4500);
    return () => window.clearTimeout(id);
  }, [fabErr]);

  if (!snapEnabled || !defaultLedgerId) return null;
  // FAB 只應出現於概覽頁，避免遮擋 Invoice 等流程頁面。
  if (pathname !== "/app") return null;

  const isPrintRoute = pathname.includes("/print");
  if (isPrintRoute) return null;

  const showTwEinvoiceFab =
    market === "tw" &&
    twEinvoice &&
    snapEnabled &&
    !isPrintRoute;

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!isLikelyReceiptImageFile(f)) {
      setFabErr(t("dashboard.receiptFileRejected"));
      return;
    }
    if (!enqueueReceipt(f)) {
      setFabErr(t("dashboard.receiptQueueFull", { max: RECEIPT_SNAP_QUEUE_MAX }));
      return;
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          e.target.value = "";
          onFile(f);
        }}
      />
      {(fabErr || twEinvoice?.scanStartError) && (
        <div
          className="print:hidden fixed z-[46] max-w-[min(calc(100vw-2rem),18rem)] rounded-lg border border-expense/40 bg-card px-3 py-2 text-xs text-expense shadow-lg"
          style={{
            bottom: "max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom, 0px)))",
            right: "max(1rem, env(safe-area-inset-right, 0px))",
          }}
          role="alert"
        >
          {fabErr ?? twEinvoice?.scanStartError}
        </div>
      )}
      <div
        className="print:hidden fixed z-[45] flex flex-row items-end gap-2"
        style={{
          bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
          right: "max(1rem, env(safe-area-inset-right, 0px))",
        }}
      >
        {showTwEinvoiceFab && (
          <button
            type="button"
            className="flex max-w-[min(calc(100vw-2rem),9.5rem)] items-center gap-2 rounded-full border border-brand/40 bg-card py-2.5 pl-2.5 pr-3 text-left text-foreground shadow-[0_6px_22px_rgba(0,0,0,0.12)] transition hover:border-brand/60 hover:bg-brand/5 focus-visible:outline focus-visible:ring-4 focus-visible:ring-brand/30 active:scale-[0.98] sm:gap-2.5 sm:py-3 sm:pl-3 sm:pr-3.5"
            onClick={() => twEinvoice?.openTwEinvoiceScan()}
            aria-label={t("dashboard.twEinvoiceScan")}
            title={t("dashboard.twEinvoiceScanHint")}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand sm:h-12 sm:w-12"
              aria-hidden
            >
              <QrGlyph className="h-[1.55rem] w-[1.55rem] sm:h-7 sm:w-7" />
            </span>
            <span className="min-w-0 select-none text-sm font-bold tracking-tight text-foreground sm:text-base">
              {t("dashboard.twEinvoiceFabShort")}
            </span>
          </button>
        )}
        <button
          type="button"
          className="flex max-w-[min(calc(100vw-2rem),15.5rem)] items-center gap-2.5 rounded-full border border-white/15 bg-brand py-2.5 pl-2.5 pr-3.5 text-left text-white shadow-[0_8px_28px_rgba(147,51,234,0.45)] transition hover:bg-brand-hover hover:shadow-[0_10px_32px_rgba(147,51,234,0.5)] focus-visible:outline focus-visible:ring-4 focus-visible:ring-brand/35 active:scale-[0.98] sm:gap-3 sm:py-3 sm:pl-3 sm:pr-4"
          onClick={() => {
            inputRef.current?.click();
          }}
          aria-label={t("dashboard.fabQuickSnapAria")}
          title={t("dashboard.fabQuickSnapHint")}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-12 sm:w-12"
            aria-hidden
          >
            <CameraGlyph className="h-[1.65rem] w-[1.65rem] sm:h-7 sm:w-7" />
          </span>
          <span className="min-w-0 flex-1 select-none leading-tight">
            <span className="block text-sm font-bold tracking-tight sm:text-base">
              {t("dashboard.fabQuickSnapLine1")}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-white/90 sm:text-xs">
              {t("dashboard.fabQuickSnapLine2")}
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
