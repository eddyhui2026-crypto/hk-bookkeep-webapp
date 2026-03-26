"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import type { TaxSummaryPayload } from "@/lib/ledger-tax-summary-print";

function formatMoney(n: number, numLocale: string): string {
  return n
    .toLocaleString(numLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\u2212/g, "-");
}

export function TaxSummaryPrintBody({ data }: { data: TaxSummaryPayload }) {
  const { locale, t } = useI18n();
  const numLocale = locale === "en" ? "en-HK" : "zh-HK";
  const periodLabel =
    locale === "en"
      ? `${data.periodStart} to ${data.periodEnd}`
      : `${data.periodStart} 至 ${data.periodEnd}`;

  const catLabel = (name: string, slug: string | null) => {
    if (slug) {
      const key = `catalog.${slug}`;
      const hit = t(key);
      if (hit !== key) return hit;
    }
    return name.trim() ? name : t("dashboard.uncategorized");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 text-foreground print:max-w-none print:px-6 print:py-4">
      <div className="print:hidden mb-6 flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <Link
          href="/app"
          className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-brand/10"
        >
          {t("printReport.backApp")}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          {t("printReport.printBtn")}
        </button>
        <p className="w-full text-sm text-muted">{t("printReport.help")}</p>
      </div>

      <header className="mb-4 border-b border-border pb-3 print:mb-3">
        <h1 className="text-xl font-semibold">{t("taxSummary.title")}</h1>
        <p className="mt-1 text-sm font-medium">
          {t("printReport.docTitle")} — {data.ledgerName}
        </p>
        <p className="mt-1 text-sm text-muted">
          {t("taxSummary.period")}: {periodLabel}
        </p>
        <p className="text-sm text-muted">
          {t("printReport.exportedAt")}: {data.exportedAt} ({t("printReport.hkTime")})
        </p>
      </header>

      <p className="mb-4 text-xs text-muted print:text-[10px] print:text-gray-700">
        {t("taxSummary.disclaimer")}
      </p>

      <section className="mb-6 print:mb-5">
        <h2 className="mb-2 text-base font-semibold text-income">
          {t("taxSummary.incomeByCategory")}
        </h2>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-border text-sm print:text-[11px]">
            <thead>
              <tr className="bg-brand/10 print:bg-gray-100">
                <th className="border border-border px-2 py-2 text-left font-medium">
                  {t("printReport.colCategory")}
                </th>
                <th className="border border-border px-2 py-2 text-left font-medium">
                  {t("printReport.colCurrency")}
                </th>
                <th className="border border-border px-2 py-2 text-right font-medium">
                  {t("taxSummary.amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.incomeLines.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-border px-2 py-3 text-center text-muted"
                  >
                    {t("printReport.noRows")}
                  </td>
                </tr>
              ) : (
                data.incomeLines.map((r, i) => (
                  <tr
                    key={`i-${r.category_name}-${r.currency}-${i}`}
                    className="even:bg-muted/30 print:even:bg-gray-50"
                  >
                    <td className="border border-border px-2 py-1.5">
                      {catLabel(r.category_name, r.category_slug)}
                    </td>
                    <td className="border border-border px-2 py-1.5">{r.currency}</td>
                    <td className="border border-border px-2 py-1.5 text-right tabular-nums text-income print:text-black">
                      {formatMoney(r.amount, numLocale)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6 print:mb-5 print:break-inside-avoid">
        <h2 className="mb-2 text-base font-semibold text-expense">
          {t("taxSummary.expenseByCategory")}
        </h2>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-border text-sm print:text-[11px]">
            <thead>
              <tr className="bg-brand/10 print:bg-gray-100">
                <th className="border border-border px-2 py-2 text-left font-medium">
                  {t("printReport.colCategory")}
                </th>
                <th className="border border-border px-2 py-2 text-left font-medium">
                  {t("printReport.colCurrency")}
                </th>
                <th className="border border-border px-2 py-2 text-right font-medium">
                  {t("taxSummary.amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.expenseLines.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-border px-2 py-3 text-center text-muted"
                  >
                    {t("printReport.noRows")}
                  </td>
                </tr>
              ) : (
                data.expenseLines.map((r, i) => (
                  <tr
                    key={`e-${r.category_name}-${r.currency}-${i}`}
                    className="even:bg-muted/30 print:even:bg-gray-50"
                  >
                    <td className="border border-border px-2 py-1.5">
                      {catLabel(r.category_name, r.category_slug)}
                    </td>
                    <td className="border border-border px-2 py-1.5">{r.currency}</td>
                    <td className="border border-border px-2 py-1.5 text-right tabular-nums text-expense print:text-black">
                      {formatMoney(r.amount, numLocale)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="print:break-inside-avoid">
        <h2 className="mb-2 text-base font-semibold">{t("taxSummary.totalsByCurrency")}</h2>
        <table className="w-full max-w-xl border-collapse border border-border text-sm print:text-[11px]">
          <thead>
            <tr className="bg-brand/10 print:bg-gray-100">
              <th className="border border-border px-2 py-2 text-left font-medium">
                {t("printReport.colCurrency")}
              </th>
              <th className="border border-border px-2 py-2 text-right font-medium">
                {t("printReport.totalIncome")}
              </th>
              <th className="border border-border px-2 py-2 text-right font-medium">
                {t("printReport.totalExpense")}
              </th>
              <th className="border border-border px-2 py-2 text-right font-medium">
                {t("printReport.net")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.totalsByCurrency.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="border border-border px-2 py-3 text-center text-muted"
                >
                  {t("printReport.noRows")}
                </td>
              </tr>
            ) : (
              data.totalsByCurrency.map((s) => (
                <tr key={s.currency} className="even:bg-muted/30 print:even:bg-gray-50">
                  <td className="border border-border px-2 py-1.5">{s.currency}</td>
                  <td className="border border-border px-2 py-1.5 text-right tabular-nums text-income print:text-black">
                    {formatMoney(s.income, numLocale)}
                  </td>
                  <td className="border border-border px-2 py-1.5 text-right tabular-nums text-expense print:text-black">
                    {formatMoney(s.expense, numLocale)}
                  </td>
                  <td className="border border-border px-2 py-1.5 text-right tabular-nums font-medium print:text-black">
                    {formatMoney(s.net, numLocale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs text-muted print:mt-4 print:text-[10px]">
        {t("taxSummary.detailCsvHint")}
      </p>
    </div>
  );
}
