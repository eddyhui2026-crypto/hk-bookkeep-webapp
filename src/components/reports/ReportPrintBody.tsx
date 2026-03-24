"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import type { PrintReportPayload } from "@/lib/ledger-report-print";

function formatMoney(n: number, numLocale: string): string {
  return n
    .toLocaleString(numLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\u2212/g, "-");
}

export function ReportPrintBody({ data }: { data: PrintReportPayload }) {
  const { locale, t } = useI18n();
  const numLocale = locale === "en" ? "en-HK" : "zh-HK";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 text-foreground print:max-w-none print:px-6 print:py-4">
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
        <h1 className="text-xl font-semibold">
          {t("printReport.docTitle")} — {data.ledgerName}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t("printReport.period")}: {data.periodLabel}
        </p>
        <p className="text-sm text-muted">
          {t("printReport.exportedAt")}: {data.exportedAt} ({t("printReport.hkTime")})
        </p>
      </header>

      {data.truncated && (
        <p className="mb-3 text-sm text-amber-800 dark:text-amber-200 print:text-black">
          {t("printReport.truncated", { limit: data.rowLimit })}
        </p>
      )}

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full border-collapse border border-border text-sm print:text-[11px]">
          <thead>
            <tr className="bg-brand/10 print:bg-gray-100">
              <th className="border border-border px-2 py-2 text-left font-medium">
                {t("printReport.colDate")}
              </th>
              <th className="border border-border px-2 py-2 text-right font-medium">
                {t("printReport.colIncome")}
              </th>
              <th className="border border-border px-2 py-2 text-right font-medium">
                {t("printReport.colExpense")}
              </th>
              <th className="border border-border px-2 py-2 text-left font-medium">
                {t("printReport.colCurrency")}
              </th>
              <th className="border border-border px-2 py-2 text-left font-medium">
                {t("printReport.colCategory")}
              </th>
              <th className="border border-border px-2 py-2 text-left font-medium">
                {t("printReport.colNote")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-border px-2 py-4 text-center text-muted"
                >
                  {t("printReport.noRows")}
                </td>
              </tr>
            ) : (
              data.rows.map((r, i) => (
                <tr key={`${r.tx_date}-${i}`} className="even:bg-muted/30 print:even:bg-gray-50">
                  <td className="border border-border px-2 py-1.5 whitespace-nowrap">
                    {r.tx_date}
                  </td>
                  <td className="border border-border px-2 py-1.5 text-right tabular-nums text-income print:text-black">
                    {r.type === "income"
                      ? formatMoney(r.amount, numLocale)
                      : "—"}
                  </td>
                  <td className="border border-border px-2 py-1.5 text-right tabular-nums text-expense print:text-black">
                    {r.type === "expense"
                      ? formatMoney(r.amount, numLocale)
                      : "—"}
                  </td>
                  <td className="border border-border px-2 py-1.5">{r.currency}</td>
                  <td className="border border-border px-2 py-1.5">{r.category || "—"}</td>
                  <td className="border border-border px-2 py-1.5 break-words max-w-[14rem] print:max-w-none">
                    {r.note || ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-8 print:mt-6 print:break-inside-avoid">
        <h2 className="mb-2 text-base font-semibold">
          {t("printReport.summaryTitle")}
        </h2>
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
            {data.totals.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="border border-border px-2 py-3 text-center text-muted"
                >
                  {t("printReport.noRows")}
                </td>
              </tr>
            ) : (
              data.totals.map((s) => (
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
        {data.truncated && (
          <p className="mt-2 text-xs text-muted print:text-gray-600">
            {t("printReport.summaryTruncated")}
          </p>
        )}
      </section>
    </div>
  );
}
