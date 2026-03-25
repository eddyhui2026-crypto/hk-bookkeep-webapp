import { monthBounds } from "@/lib/reports";

export type TxForChart = {
  type: string;
  amount: number;
  currency: string;
  tx_date: string;
  category_id: string | null;
};

export type MonthlyBarPoint = {
  ym: string;
  income: number;
  expense: number;
};

export type CategorySlice = {
  id: string;
  name: string;
  color: string;
  value: number;
};

const FALLBACK_COLORS = [
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#3b82f6",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
];

export const UNCATEGORIZED_ID = "__uncategorized__";

export function pickChartCurrency(
  sums: { currency: string }[],
  txs: TxForChart[],
  homeCurrency = "HKD"
): string {
  const fromTxs = new Set(txs.map((t) => t.currency));
  if (fromTxs.has(homeCurrency)) return homeCurrency;
  if (fromTxs.has("HKD")) return "HKD";
  if (sums.length) return sums[0].currency;
  return txs[0]?.currency ?? homeCurrency;
}

/** Last 6 calendar months including current; `ym` = YYYY-MM */
export function buildMonthlyBars(
  now: Date,
  currency: string,
  txs: TxForChart[]
): MonthlyBarPoint[] {
  const out: MonthlyBarPoint[] = [];
  for (let back = 5; back >= 0; back--) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const ym = `${y}-${String(m).padStart(2, "0")}`;
    const { start, end } = monthBounds(y, m);
    let income = 0;
    let expense = 0;
    for (const t of txs) {
      if (t.currency !== currency) continue;
      if (t.tx_date < start || t.tx_date > end) continue;
      const a = Number(t.amount);
      if (!Number.isFinite(a)) continue;
      if (t.type === "income") income += a;
      else expense += a;
    }
    out.push({ ym, income, expense });
  }
  return out;
}

function topSlices(
  entries: CategorySlice[],
  otherLabel: string,
  max = 6
): CategorySlice[] {
  const sorted = [...entries].filter((e) => e.value > 0).sort((a, b) => b.value - a.value);
  if (sorted.length <= max) {
    return sorted.map((s, i) => ({
      ...s,
      color: s.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));
  }
  const head = sorted.slice(0, max).map((s, i) => ({
    ...s,
    color: s.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));
  const restVal = sorted.slice(max).reduce((s, x) => s + x.value, 0);
  if (restVal > 0) {
    head.push({
      id: "__other__",
      name: otherLabel,
      color: "#64748b",
      value: restVal,
    });
  }
  return head;
}

export function buildCategorySlices(
  year: number,
  month1to12: number,
  currency: string,
  kind: "income" | "expense",
  txs: TxForChart[],
  categories: { id: string; name: string; color: string }[],
  otherLabel: string,
  uncategorizedLabel: string
): CategorySlice[] {
  const { start, end } = monthBounds(year, month1to12);
  const catMeta = new Map(categories.map((c) => [c.id, c] as const));
  const map = new Map<string, CategorySlice>();

  for (const t of txs) {
    if (t.currency !== currency) continue;
    if (t.tx_date < start || t.tx_date > end) continue;
    if (t.type !== kind) continue;
    const a = Number(t.amount);
    if (!Number.isFinite(a) || a <= 0) continue;
    const id = t.category_id ?? UNCATEGORIZED_ID;
    const meta = t.category_id ? catMeta.get(t.category_id) : undefined;
    const name =
      id === UNCATEGORIZED_ID
        ? uncategorizedLabel
        : meta?.name ?? uncategorizedLabel;
    const color =
      id === UNCATEGORIZED_ID
        ? "#94a3b8"
        : meta?.color || "#a855f7";
    const cur = map.get(id);
    if (cur) cur.value += a;
    else map.set(id, { id, name, color, value: a });
  }

  return topSlices([...map.values()], otherLabel, 6);
}
