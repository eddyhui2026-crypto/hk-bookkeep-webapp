"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/components/I18nProvider";
import {
  buildCategorySlices,
  buildMonthlyBars,
  type TxForChart,
} from "@/lib/dashboard-chart-data";
import { categoryLabel } from "@/lib/category-label";

const GRID = "var(--border)";
const AXIS = "var(--muted)";

function formatMoney(n: number, locale: string) {
  return n.toLocaleString(locale === "en" ? "en-HK" : "zh-HK", {
    maximumFractionDigits: 0,
  });
}

function monthTick(ym: string, locale: string) {
  const [, mm] = ym.split("-");
  const m = Number(mm);
  if (locale === "en") {
    return new Date(2000, m - 1, 1).toLocaleString("en", { month: "short" });
  }
  return `${m}月`;
}

export function DashboardCharts({
  chartTxs,
  chartCurrency,
  reportYear,
  reportMonth,
  categories,
}: {
  chartTxs: TxForChart[];
  chartCurrency: string;
  reportYear: number;
  reportMonth: number;
  categories: { id: string; name: string; color: string; slug: string | null }[];
}) {
  const { locale, t } = useI18n();
  const numLocale = locale === "en" ? "en-HK" : "zh-HK";

  const categoriesLabeled = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        name: categoryLabel(t, c),
      })),
    [categories, locale, t]
  );

  const anchor = useMemo(
    () => new Date(reportYear, reportMonth - 1, 1),
    [reportYear, reportMonth]
  );

  const monthlyBars = useMemo(
    () => buildMonthlyBars(anchor, chartCurrency, chartTxs),
    [anchor, chartCurrency, chartTxs]
  );

  const expenseSlices = useMemo(
    () =>
      buildCategorySlices(
        reportYear,
        reportMonth,
        chartCurrency,
        "expense",
        chartTxs,
        categoriesLabeled,
        t("dashboard.chartOther"),
        t("dashboard.uncategorized")
      ),
    [
      reportYear,
      reportMonth,
      chartCurrency,
      chartTxs,
      categoriesLabeled,
      t,
    ]
  );

  const incomeSlices = useMemo(
    () =>
      buildCategorySlices(
        reportYear,
        reportMonth,
        chartCurrency,
        "income",
        chartTxs,
        categoriesLabeled,
        t("dashboard.chartOther"),
        t("dashboard.uncategorized")
      ),
    [
      reportYear,
      reportMonth,
      chartCurrency,
      chartTxs,
      categoriesLabeled,
      t,
    ]
  );

  const chartData = useMemo(
    () =>
      monthlyBars.map((row) => ({
        ...row,
        label: monthTick(row.ym, locale),
      })),
    [monthlyBars, locale]
  );

  const hasMonthly = chartData.some((d) => d.income > 0 || d.expense > 0);
  const hasExpensePie = expenseSlices.length > 0;
  const hasIncomePie = incomeSlices.length > 0;

  if (!hasMonthly && !hasExpensePie && !hasIncomePie) {
    return (
      <section className="rounded-2xl border border-border bg-gradient-to-br from-brand/10 via-card to-brand-accent/5 p-6 shadow-sm">
        <p className="text-center text-sm text-muted">{t("dashboard.chartEmpty")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {hasMonthly && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">
            {t("dashboard.chart6mo", { currency: chartCurrency })}
          </h2>
          <div className="mt-4 h-[300px] w-full min-h-[300px] min-w-0 shrink-0">
            <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={200}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                  <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: AXIS, fontSize: 12 }}
                  axisLine={{ stroke: GRID }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: AXIS, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatMoney(Number(v), locale)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    boxShadow: "0 10px 40px rgba(124,58,237,0.12)",
                  }}
                  formatter={(value, name) => [
                    formatMoney(Number(value ?? 0), locale),
                    name === "income"
                      ? t("dashboard.income")
                      : t("dashboard.expense"),
                  ]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.ym ?? ""
                  }
                />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value) =>
                    value === "income"
                      ? t("dashboard.income")
                      : t("dashboard.expense")
                  }
                />
                <Bar
                  dataKey="income"
                  fill="url(#barIncome)"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expense"
                  fill="url(#barExpense)"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <PieBlock
          title={t("dashboard.chartExpensePie", { currency: chartCurrency })}
          slices={expenseSlices}
          hasData={hasExpensePie}
          emptyHint={t("dashboard.chartPieEmpty")}
          numLocale={numLocale}
        />
        <PieBlock
          title={t("dashboard.chartIncomePie", { currency: chartCurrency })}
          slices={incomeSlices}
          hasData={hasIncomePie}
          emptyHint={t("dashboard.chartPieEmpty")}
          numLocale={numLocale}
        />
      </div>
    </section>
  );
}

function PieBlock({
  title,
  slices,
  hasData,
  emptyHint,
  numLocale,
}: {
  title: string;
  slices: { name: string; color: string; value: number }[];
  hasData: boolean;
  emptyHint: string;
  numLocale: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {!hasData ? (
        <p className="mt-8 text-center text-sm text-muted">{emptyHint}</p>
      ) : (
        <div className="mt-2 h-[280px] w-full min-h-[280px] min-w-0 shrink-0">
          <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={200}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {slices.map((s) => (
                  <Cell key={s.name + s.value} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  boxShadow: "0 10px 40px rgba(236,72,153,0.12)",
                }}
                formatter={(value) =>
                  Number(value ?? 0).toLocaleString(numLocale, {
                    maximumFractionDigits: 0,
                  })
                }
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
