import { createClient } from "@/lib/supabase/server";
import type { Market } from "@/lib/market";
import { taxPeriodForExport } from "@/lib/reports";

export type TaxSummaryLine = {
  category: string;
  currency: string;
  amount: number;
};

export type TaxSummaryCurrencyTotal = {
  currency: string;
  income: number;
  expense: number;
  net: number;
};

export type TaxSummaryPayload = {
  ledgerName: string;
  taxYearLabel: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  exportedAt: string;
  incomeLines: TaxSummaryLine[];
  expenseLines: TaxSummaryLine[];
  totalsByCurrency: TaxSummaryCurrencyTotal[];
};

export type TaxSummaryFetchResult =
  | { ok: true; data: TaxSummaryPayload }
  | { ok: false; status: number; message: string };

function exportTimestampHK(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const g = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")} ${g("hour")}:${g("minute")}`;
}

export async function fetchLedgerTaxSummaryForPrint(
  ledgerId: string,
  exportYearKey: number,
  market: Market
): Promise<TaxSummaryFetchResult> {
  if (
    !ledgerId ||
    !Number.isInteger(exportYearKey) ||
    exportYearKey < 2000 ||
    exportYearKey > 2100
  ) {
    return { ok: false, status: 400, message: "缺少 ledgerId 或有效 taxYear" };
  }

  const range = taxPeriodForExport(market, exportYearKey);
  const taxYearLabel =
    market === "hk"
      ? `${exportYearKey}/${String(exportYearKey + 1).slice(-2)}`
      : String(exportYearKey);
  const periodLabel =
    market === "hk"
      ? `${taxYearLabel}（${range.start} 至 ${range.end}）`
      : `${exportYearKey}（${range.start} 至 ${range.end}）`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, status: 401, message: "未登入" };
  }

  const { data: ledger, error: le } = await supabase
    .from("ledgers")
    .select("name")
    .eq("id", ledgerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (le || !ledger) {
    return { ok: false, status: 404, message: "找不到生意簿" };
  }

  const { data: txs, error: te } = await supabase
    .from("transactions")
    .select("type, amount, currency, category_id")
    .eq("ledger_id", ledgerId)
    .gte("tx_date", range.start)
    .lte("tx_date", range.end);

  if (te) {
    return { ok: false, status: 500, message: te.message };
  }

  const raw = txs ?? [];
  const catIds = [...new Set(raw.map((t) => t.category_id).filter(Boolean))] as string[];
  const catMap = new Map<string, string>();
  if (catIds.length) {
    const { data: cats } = await supabase.from("categories").select("id, name").in("id", catIds);
    for (const c of cats ?? []) catMap.set(c.id, c.name);
  }

  const incMap = new Map<string, number>();
  const expMap = new Map<string, number>();

  for (const t of raw) {
    const cat = t.category_id ? (catMap.get(t.category_id) ?? "") : "";
    const cur = t.currency || "HKD";
    const key = `${cat}\0${cur}`;
    const amt = Number(t.amount);
    if (t.type === "income") {
      incMap.set(key, (incMap.get(key) ?? 0) + amt);
    } else {
      expMap.set(key, (expMap.get(key) ?? 0) + amt);
    }
  }

  const lineFromMap = (m: Map<string, number>): TaxSummaryLine[] =>
    [...m.entries()]
      .map(([key, amount]) => {
        const [category, currency] = key.split("\0");
        return { category, currency, amount };
      })
      .filter((l) => l.amount !== 0)
      .sort((a, b) =>
        a.category !== b.category
          ? a.category.localeCompare(b.category, "zh-HK")
          : a.currency.localeCompare(b.currency)
      );

  const incomeLines = lineFromMap(incMap);
  const expenseLines = lineFromMap(expMap);

  const byCcy = new Map<string, { inc: number; exp: number }>();
  for (const t of raw) {
    const cur = t.currency || "HKD";
    const o = byCcy.get(cur) ?? { inc: 0, exp: 0 };
    if (t.type === "income") o.inc += Number(t.amount);
    else o.exp += Number(t.amount);
    byCcy.set(cur, o);
  }

  const totalsByCurrency: TaxSummaryCurrencyTotal[] = [...byCcy.keys()]
    .sort()
    .map((currency) => {
      const { inc, exp } = byCcy.get(currency)!;
      return { currency, income: inc, expense: exp, net: inc - exp };
    });

  return {
    ok: true,
    data: {
      ledgerName: ledger.name,
      taxYearLabel,
      periodStart: range.start,
      periodEnd: range.end,
      periodLabel,
      exportedAt: exportTimestampHK(),
      incomeLines,
      expenseLines,
      totalsByCurrency,
    },
  };
}
