import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canWriteSubscription,
  readOnlyBanner,
  type ProfileRow,
} from "@/lib/access";
import { monthBounds } from "@/lib/reports";
import {
  pickChartCurrency,
  type TxForChart,
} from "@/lib/dashboard-chart-data";
import { convertChartTxsToHkd, mergeFxRatesToHkd } from "@/lib/fx-rates";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { parseQuickAddIncomePrefill } from "@/lib/app-prefill";

export const dynamic = "force-dynamic";

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{
    ledger?: string;
    prefillIncome?: string;
    prefillAmount?: string;
    prefillCurrency?: string;
    prefillDate?: string;
    prefillNote?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "subscription_status, trial_ends_at, current_period_end, stripe_customer_id"
    )
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as ProfileRow | null;
  const canWrite = canWriteSubscription(p);
  const readOnly = readOnlyBanner(p);

  const { data: ledgers } = await supabase
    .from("ledgers")
    .select("id, name, fx_rates_to_hkd")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const list = ledgers ?? [];
  const sp = await searchParams;
  const quickAddIncomePrefill = parseQuickAddIncomePrefill(
    sp as Record<string, string | string[] | undefined>
  );
  let activeLedgerId = sp.ledger ?? list[0]?.id ?? null;
  if (activeLedgerId && !list.some((l) => l.id === activeLedgerId)) {
    activeLedgerId = list[0]?.id ?? null;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;

  let chartTxs: TxForChart[] = [];
  let categories: { id: string; name: string; color: string; slug: string | null }[] =
    [];
  let transactionsRaw: {
    id: string;
    type: string;
    amount: number;
    currency: string;
    note: string | null;
    tx_date: string;
    category_id: string | null;
    receipt_path: string | null;
  }[] = [];

  if (activeLedgerId) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name, color, slug")
      .eq("ledger_id", activeLedgerId)
      .order("sort_order", { ascending: true });
    categories = cats ?? [];

    const { data: txs } = await supabase
      .from("transactions")
      .select(
        "id, type, amount, currency, note, tx_date, category_id, receipt_path"
      )
      .eq("ledger_id", activeLedgerId)
      .order("tx_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    transactionsRaw = txs ?? [];

    const chartAnchor = new Date(y, m - 1 - 5, 1);
    const chartStartStr = `${chartAnchor.getFullYear()}-${String(chartAnchor.getMonth() + 1).padStart(2, "0")}-01`;
    const { data: ctx } = await supabase
      .from("transactions")
      .select("type, amount, currency, tx_date, category_id")
      .eq("ledger_id", activeLedgerId)
      .gte("tx_date", chartStartStr);
    chartTxs = (ctx ?? []) as TxForChart[];
  }

  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const transactions = transactionsRaw.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    currency: t.currency,
    note: t.note,
    tx_date: t.tx_date,
    category_id: t.category_id,
    category_name: t.category_id ? catName.get(t.category_id) ?? null : null,
    receipt_path: t.receipt_path,
  }));

  const { start, end } = monthBounds(y, m);
  const sumMap = new Map<string, { income: number; expense: number }>();
  for (const t of transactionsRaw) {
    if (t.tx_date < start || t.tx_date > end) continue;
    const cur = sumMap.get(t.currency) ?? { income: 0, expense: 0 };
    if (t.type === "income") cur.income += Number(t.amount);
    else cur.expense += Number(t.amount);
    sumMap.set(t.currency, cur);
  }
  const sums = [...sumMap.entries()].map(([currency, v]) => ({
    currency,
    income: v.income,
    expense: v.expense,
  }));

  const activeLedgerRow = list.find((l) => l.id === activeLedgerId);
  const fxMerged = mergeFxRatesToHkd(activeLedgerRow?.fx_rates_to_hkd);

  const chartCurrencySet = new Set(chartTxs.map((t) => t.currency));
  const useFxCharts = chartCurrencySet.size > 1;

  let chartTxsForCharts = chartTxs;
  let chartCurrency = pickChartCurrency(sums, chartTxs);
  if (useFxCharts) {
    chartTxsForCharts = convertChartTxsToHkd(chartTxs, fxMerged);
    chartCurrency = "HKD";
  }

  const fxFormCurrencies =
    useFxCharts && activeLedgerId
      ? [...chartCurrencySet].filter((c) => c !== "HKD").sort()
      : [];

  const fxMergedForClient = Object.fromEntries(
    fxFormCurrencies.map((c) => [c, fxMerged[c as keyof typeof fxMerged] ?? 1])
  ) as Record<string, number>;

  return (
    <DashboardClient
      userId={user.id}
      canWrite={canWrite}
      readOnly={readOnly}
      trialEndsAt={p?.trial_ends_at ?? null}
      subscriptionStatus={p?.subscription_status ?? "none"}
      hasStripeCustomer={Boolean(p?.stripe_customer_id)}
      ledgers={list}
      activeLedgerId={activeLedgerId}
      categories={categories}
      transactions={transactions}
      sums={sums}
      chartTxs={chartTxsForCharts}
      chartCurrency={chartCurrency}
      fxChartsUnified={useFxCharts}
      fxFormCurrencies={fxFormCurrencies}
      fxMergedRates={fxMergedForClient}
      reportYear={y}
      reportMonth={m}
      quickAddIncomePrefill={quickAddIncomePrefill}
    />
  );
}
