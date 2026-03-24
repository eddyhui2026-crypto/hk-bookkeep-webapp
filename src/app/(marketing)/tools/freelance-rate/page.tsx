"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export default function FreelanceRatePage() {
  const { locale, t } = useI18n();
  const [target, setTarget] = useState("30000");
  const [days, setDays] = useState("20");
  const [hours, setHours] = useState("6");
  const [expenses, setExpenses] = useState("5000");
  const numLocale = locale === "en" ? "en-HK" : "zh-HK";

  const rate = useMemo(() => {
    const tg = Number(target);
    const d = Number(days);
    const h = Number(hours);
    const e = Number(expenses);
    if (![tg, d, h].every((x) => Number.isFinite(x) && x > 0)) return null;
    const need = tg + (Number.isFinite(e) && e > 0 ? e : 0);
    const billable = d * h;
    return need / billable;
  }, [target, days, hours, expenses]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-sm text-brand">
        <Link href="/tools/profits-tax-estimator" className="hover:underline">
          {t("toolFreelance.linkTax")}
        </Link>
        {" · "}
        <Link href="/tools/ad-spend-ratio" className="hover:underline">
          {t("toolFreelance.linkAd")}
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        {t("toolFreelance.title")}
      </h1>
      <p className="mt-3 text-sm text-muted">{t("toolFreelance.blurb")}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">
          {t("toolFreelance.target")}
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          {t("toolFreelance.days")}
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            inputMode="decimal"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          {t("toolFreelance.hours")}
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            inputMode="decimal"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          {t("toolFreelance.expenses")}
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            inputMode="decimal"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
          />
        </label>
      </div>
      {rate != null && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted">{t("toolFreelance.resultLabel")}</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">
            {rate.toLocaleString(numLocale, { maximumFractionDigits: 0 })}
          </p>
        </div>
      )}
      <div className="mt-10 rounded-xl bg-brand/5 px-4 py-3 text-xs text-muted">
        <Link href="/login" className="font-medium text-brand hover:underline">
          {t("toolFreelance.cta")}
        </Link>
      </div>
    </div>
  );
}
