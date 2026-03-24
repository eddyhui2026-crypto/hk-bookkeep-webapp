"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export default function AdSpendRatioPage() {
  const { t } = useI18n();
  const [revenue, setRevenue] = useState("50000");
  const [adSpend, setAdSpend] = useState("5000");

  const { ratio, hintKey } = useMemo(() => {
    const r = Number(revenue);
    const a = Number(adSpend);
    if (!Number.isFinite(r) || r <= 0 || !Number.isFinite(a) || a < 0) {
      return { ratio: null as number | null, hintKey: null as string | null };
    }
    const pct = (a / r) * 100;
    const hintKey =
      pct < 10
        ? "toolAd.hintLow"
        : pct < 25
          ? "toolAd.hintMid"
          : "toolAd.hintHigh";
    return { ratio: pct, hintKey };
  }, [revenue, adSpend]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-sm text-brand">
        <Link href="/tools/profits-tax-estimator" className="hover:underline">
          {t("toolAd.linkTax")}
        </Link>
        {" · "}
        <Link href="/tools/freelance-rate" className="hover:underline">
          {t("toolAd.linkRate")}
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        {t("toolAd.title")}
      </h1>
      <p className="mt-3 text-sm text-muted">{t("toolAd.disclaimer")}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">
          {t("toolAd.revenue")}
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            inputMode="decimal"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          {t("toolAd.adSpend")}
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            inputMode="decimal"
            value={adSpend}
            onChange={(e) => setAdSpend(e.target.value)}
          />
        </label>
      </div>
      {ratio != null && hintKey && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted">{t("toolAd.ratioLabel")}</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">
            {ratio.toFixed(2)}%
          </p>
          <p className="mt-3 text-sm text-muted">{t(hintKey)}</p>
        </div>
      )}
      <div className="mt-10 rounded-xl bg-brand/5 px-4 py-3 text-xs text-muted">
        <Link href="/login" className="font-medium text-brand hover:underline">
          {t("toolAd.cta")}
        </Link>
      </div>
    </div>
  );
}
