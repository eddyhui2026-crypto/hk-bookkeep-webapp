"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateLedgerFxRates } from "@/app/app/actions";
import { useI18n } from "@/components/I18nProvider";

export function LedgerFxRatesForm({
  ledgerId,
  anchorCurrency,
  currencies,
  mergedRates,
  canWrite,
}: {
  ledgerId: string;
  anchorCurrency: string;
  currencies: string[];
  mergedRates: Record<string, number>;
  canWrite: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});

  const currenciesKey = currencies.join(",");
  const mergedKey = JSON.stringify(mergedRates);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const c of currencies) {
      const n = mergedRates[c];
      next[c] =
        typeof n === "number" && Number.isFinite(n)
          ? String(n)
          : "";
    }
    setVals(next);
    setErr(null);
    setOk(false);
  }, [ledgerId, currenciesKey, mergedKey]);

  if (currencies.length === 0) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    setErr(null);
    setOk(false);
    const patch: Record<string, unknown> = {};
    for (const c of currencies) {
      const raw = (vals[c] ?? "").trim().replace(/,/g, "");
      patch[c] = Number.parseFloat(raw);
    }
    startTransition(async () => {
      try {
        await updateLedgerFxRates(ledgerId, patch);
        setOk(true);
        router.refresh();
      } catch (x) {
        setErr(x instanceof Error ? x.message : String(x));
      }
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold text-foreground">
        {t("dashboard.fxTitle", { anchor: anchorCurrency })}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {t("dashboard.fxHint", { anchor: anchorCurrency })}
      </p>
      <p className="mt-1 text-xs text-muted">{t("dashboard.fxDisclaimer")}</p>
      <form onSubmit={(e) => void submit(e)} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {currencies.map((c) => (
            <label
              key={c}
              className="flex flex-col gap-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="text-muted">
                {t("dashboard.fxRowLabel", { code: c, anchor: anchorCurrency })}
              </span>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-foreground">1 {c} =</span>
                <input
                  type="number"
                  name={`fx_${c}`}
                  inputMode="decimal"
                  step="any"
                  min={0.000001}
                  max={5000}
                  required
                  disabled={!canWrite || pending}
                  value={vals[c] ?? ""}
                  onChange={(e) =>
                    setVals((v) => ({ ...v, [c]: e.target.value }))
                  }
                  className="min-w-0 flex-1 rounded-lg border border-border bg-card px-2 py-1.5 text-foreground outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
                />
                <span className="shrink-0 text-foreground">{anchorCurrency}</span>
              </div>
            </label>
          ))}
        </div>
        {err && <p className="text-sm text-expense">{err}</p>}
        {ok && (
          <p className="text-sm text-income">{t("dashboard.fxSaved")}</p>
        )}
        <button
          type="submit"
          disabled={!canWrite || pending}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {pending ? t("dashboard.fxSaving") : t("dashboard.fxSave")}
        </button>
      </form>
    </section>
  );
}
