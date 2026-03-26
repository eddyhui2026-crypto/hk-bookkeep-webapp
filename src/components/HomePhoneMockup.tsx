import type { Market } from "@/lib/market";

type HomePhoneMockupProps = {
  market: Market;
  appTitle: string;
  appSubtitle: string;
  receiptLabel: string;
  expenseLabel: string;
  categorySample: string;
  submitLabel: string;
  hintLabel: string;
  /** 手機框下、相機捷徑說明 */
  belowCameraLabel: string;
  /** 僅台灣站：電子發票掃描說明 */
  belowInvoiceLabel?: string;
  /** 示意收據下面細行（店名／類型） */
  receiptMockSubtitle: string;
};

const MOCK_AMOUNT: Record<Market, { symbol: string; amount: string }> = {
  hk: { symbol: "HK$", amount: "128.50" },
  tw: { symbol: "NT$", amount: "580" },
  sg: { symbol: "S$", amount: "24.80" },
};

function CameraGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4.5 9.5h2l1.5-2.5h8l1.5 2.5h2A1.5 1.5 0 0 1 21 11v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19v-8a1.5 1.5 0 0 1 1.5-1.5Z" />
      <circle cx="12" cy="15" r="3.25" />
    </svg>
  );
}

function InvoiceQrGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 3H5a2 2 0 0 0-2 2v2M21 7V5a2 2 0 0 0-2-2h-2M17 21h2a2 2 0 0 0 2-2v-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7.5" y="7.5" width="3.2" height="3.2" rx="0.4" />
      <rect x="13.3" y="7.5" width="3.2" height="3.2" rx="0.4" />
      <rect x="7.5" y="13.3" width="3.2" height="3.2" rx="0.4" />
      <path d="M14.5 14h1M14.5 16.5h3M17.5 14v4.5" />
    </svg>
  );
}

/** Marketing hero：手機示意（幣種跟市場）；底欄相機／台灣加發票 */
export function HomePhoneMockup({
  market,
  appTitle,
  appSubtitle,
  receiptLabel,
  expenseLabel,
  categorySample,
  submitLabel,
  hintLabel,
  belowCameraLabel,
  belowInvoiceLabel,
  receiptMockSubtitle,
}: HomePhoneMockupProps) {
  const mock = MOCK_AMOUNT[market];
  const showInvoice = market === "tw" && Boolean(belowInvoiceLabel?.trim());

  return (
    <div className="relative mx-auto w-[min(100%,18.5rem)]">
      <div
        className="relative rounded-[2.5rem] border-[11px] border-[#1e1b4b] bg-[linear-gradient(145deg,#312e81_0%,#1e1b4b_50%,#0f172a_100%)] shadow-[0_28px_70px_-14px_rgba(91,33,182,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 z-10 h-[1.35rem] w-[34%] -translate-x-1/2 rounded-b-[1rem] bg-[#0f172a]/90 shadow-inner" />
        <div className="overflow-hidden rounded-[1.95rem] bg-gradient-to-b from-[#faf5ff] via-white to-[#f1f5f9]">
          <div className="flex items-center justify-between px-4 pb-0.5 pt-8 text-[10px] font-semibold tracking-wide text-[#64748b]">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-4 rounded-sm bg-[#94a3b8]/70" />
              <span className="h-2 w-2 rounded-full bg-[#94a3b8]/70" />
            </span>
          </div>
          <div className="border-b border-[#e9d5ff]/90 bg-white/80 px-4 py-2.5 backdrop-blur-sm">
            <p className="text-center text-[13px] font-bold tracking-tight text-[#312e81]">
              {appTitle}
            </p>
            <p className="text-center text-[10px] font-medium text-[#64748b]">{appSubtitle}</p>
          </div>
          <div className="space-y-3 p-3.5 pb-4">
            <div className="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(91,33,182,0.2)]">
              {/* 收據紙：頂部鋸齒感 */}
              <div className="h-2 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,#e9d5ff_6px,#e9d5ff_8px)] opacity-[0.65]" />
              <div className="px-3 pb-3 pt-2">
                <div className="flex gap-2.5">
                  <div className="relative flex h-[4.25rem] w-[3.35rem] shrink-0 flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200/90 p-1.5 ring-1 ring-slate-300/60">
                    <div className="h-1 w-full rounded bg-slate-400/40" />
                    <div className="space-y-0.5 opacity-80">
                      <div className="h-px w-full rounded bg-slate-400/50" />
                      <div className="h-px w-[72%] rounded bg-slate-400/40" />
                      <div className="h-px w-full rounded bg-slate-400/45" />
                    </div>
                    <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand/20 text-brand ring-2 ring-white shadow-sm">
                      <CameraGlyph className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
                      {receiptLabel}
                    </p>
                    <p className="mt-0.5 truncate text-[9px] text-[#94a3b8]">
                      {receiptMockSubtitle}
                    </p>
                    <p className="mt-1.5 text-xl font-bold tabular-nums leading-none text-income">
                      <span className="text-[11px] font-semibold text-income/90">{mock.symbol}</span>{" "}
                      {mock.amount}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-expense/12 px-2 py-0.5 text-[9px] font-semibold text-expense ring-1 ring-expense/20">
                        {expenseLabel}
                      </span>
                      <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[9px] font-semibold text-brand ring-1 ring-brand/15">
                        {categorySample}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-[repeating-linear-gradient(90deg,#f8fafc_0px,#f8fafc_5px,transparent_5px,transparent_8px)] opacity-90" />
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-gradient-to-r from-brand to-violet-600 px-3 py-2.5 text-center text-[12px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(91,33,182,0.55)] ring-1 ring-white/20 transition hover:brightness-105"
              tabIndex={-1}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3.5 text-center text-[11px] font-medium leading-snug text-muted">{hintLabel}</p>

      <div className="mt-5 flex flex-wrap items-stretch justify-center gap-2.5">
        {showInvoice && (
          <div className="flex min-w-[5.5rem] flex-1 flex-col items-center gap-1.5 rounded-2xl border border-brand/25 bg-gradient-to-b from-brand/8 to-card px-3 py-3 shadow-sm sm:flex-initial sm:min-w-0">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/30 bg-brand/12 text-brand shadow-sm">
              <InvoiceQrGlyph className="h-[1.35rem] w-[1.35rem]" />
            </span>
            <span className="max-w-[6rem] text-center text-[10px] font-semibold leading-tight text-foreground">
              {belowInvoiceLabel}
            </span>
          </div>
        )}
        <div
          className={`flex min-w-[5.5rem] flex-1 flex-col items-center gap-1.5 rounded-2xl border border-violet-300/35 bg-gradient-to-b from-violet-50/90 to-card px-3 py-3 shadow-sm sm:flex-initial sm:min-w-0 ${showInvoice ? "" : "max-w-[13rem]"}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/25 bg-white text-violet-700 shadow-md ring-2 ring-violet-200/50">
            <CameraGlyph className="h-[1.4rem] w-[1.4rem]" />
          </span>
          <span className="max-w-[7rem] text-center text-[10px] font-semibold leading-tight text-foreground">
            {belowCameraLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
