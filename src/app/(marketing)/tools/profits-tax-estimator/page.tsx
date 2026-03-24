"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export default function ProfitsTaxEstimatorPage() {
  const { locale, t } = useI18n();
  const [profit, setProfit] = useState("200000");
  const numLocale = locale === "en" ? "en-HK" : "zh-HK";

  const est = useMemo(() => {
    const p = Number(profit);
    if (!Number.isFinite(p) || p <= 0) return null;
    const first = Math.min(p, 2_000_000);
    const rest = Math.max(p - 2_000_000, 0);
    const tax = first * 0.0825 + rest * 0.165;
    return { tax, eff: p > 0 ? (tax / p) * 100 : 0 };
  }, [profit]);

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
