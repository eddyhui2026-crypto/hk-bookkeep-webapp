"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import { displayNumberLocale } from "@/lib/display-number-locale";
import { estimateProfitsTaxDemo } from "@/lib/tax-tools";

export default function ProfitsTaxEstimatorPage() {
  const market = useMarket();
  const { locale, t } = useI18n();
  const [profit, setProfit] = useState(
    market === "hk" ? "200000" : market === "tw" ? "800000" : "50000"
  );
  const numLocale = displayNumberLocale(market, locale);

  const est = useMemo(() => {
    const p = Number(profit);
    const r = estimateProfitsTaxDemo(market, p);
    if (!r) return null;
    return { tax: r.tax, eff: r.effPct };
  }, [profit, market]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-sm text-brand">
        <Link href="/tools/freelance-rate" className="hover:underline">
          {t("toolProfit.linkRate")}
        </Link>
        {" · "}
        <Link href="/tools/ad-spend-ratio" className="hover:underline">
          {t("toolProfit.linkAd")}
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        {t("toolProfit.title")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t("toolProfit.disclaimer")}
      </p>
      <label className="mt-8 block text-sm font-medium text-foreground">
        {t("toolProfit.label")}
        <input
          inputMode="decimal"
          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-lg"
          value={profit}
          onChange={(e) => setProfit(e.target.value)}
        />
      </label>
      {est && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted">{t("toolProfit.estLabel")}</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">
            {est.tax.toLocaleString(numLocale, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-2 text-sm text-muted">
            {t("toolProfit.pctLabel", { n: est.eff.toFixed(2) })}
          </p>
        </div>
      )}
      <div className="mt-10 rounded-xl bg-brand/5 px-4 py-3 text-xs text-muted">
        {t("toolProfit.cta")}{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          {t("toolProfit.ctaLink")}
        </Link>
      </div>
    </div>
  );
}
