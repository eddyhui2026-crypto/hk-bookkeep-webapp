type HomePhoneMockupProps = {
  appSubtitle: string;
  receiptLabel: string;
  expenseLabel: string;
  categorySample: string;
  submitLabel: string;
  hintLabel: string;
};

/** Decorative phone frame for marketing hero — labels from i18n. */
export function HomePhoneMockup({
  appSubtitle,
  receiptLabel,
  expenseLabel,
  categorySample,
  submitLabel,
  hintLabel,
}: HomePhoneMockupProps) {
  return (
    <div className="relative mx-auto w-[min(100%,17.5rem)]">
      <div
        className="relative rounded-[2.35rem] border-[10px] border-[#1e1b4b] bg-[#1e1b4b] shadow-[0_25px_60px_-12px_rgba(91,33,182,0.45)]"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 z-10 h-5 w-[38%] -translate-x-1/2 rounded-b-2xl bg-[#1e1b4b]" />
        <div className="overflow-hidden rounded-[1.85rem] bg-gradient-to-b from-[#faf5ff] via-white to-[#f5f3ff]">
          <div className="flex items-center justify-between px-4 pb-1 pt-7 text-[10px] font-medium text-[#64748b]">
            <span>9:41</span>
            <span className="flex gap-0.5">
              <span className="h-2 w-3 rounded-sm bg-[#cbd5e1]" />
              <span className="h-2 w-3 rounded-sm bg-[#cbd5e1]" />
            </span>
          </div>
          <div className="border-b border-[#e9d5ff] px-4 py-2.5">
            <p className="text-center text-xs font-semibold text-[#312e81]">Harbix</p>
            <p className="text-center text-[10px] text-[#64748b]">{appSubtitle}</p>
          </div>
          <div className="space-y-3 p-3">
            <div className="rounded-xl border border-dashed border-brand/40 bg-white/90 p-3 shadow-sm">
              <div className="flex gap-2">
                <div className="flex h-14 w-11 shrink-0 flex-col justify-between rounded-md bg-gradient-to-br from-brand/20 to-brand-accent/15 p-1">
                  <div className="h-1.5 w-full rounded bg-brand/30" />
                  <div className="space-y-0.5">
                    <div className="h-0.5 w-full rounded bg-[#cbd5e1]" />
                    <div className="h-0.5 w-4/5 rounded bg-[#cbd5e1]" />
                    <div className="h-0.5 w-full rounded bg-[#cbd5e1]" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-[#64748b]">{receiptLabel}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-income">
                    HK$ 128.50
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className="rounded-full bg-expense/15 px-2 py-0.5 text-[9px] font-medium text-expense">
                      {expenseLabel}
                    </span>
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[9px] font-medium text-brand">
                      {categorySample}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-brand px-3 py-2 text-center text-xs font-medium text-white shadow-md">
              {submitLabel}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted">{hintLabel}</p>
    </div>
  );
}
