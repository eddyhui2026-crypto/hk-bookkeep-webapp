import { createClient } from "@/lib/supabase/server";
import { monthBounds, yearBounds } from "@/lib/reports";

export const REPORT_PRINT_ROW_LIMIT = 3000;

export type PrintReportRow = {
  tx_date: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  category: string;
  note: string;
};

export type PrintReportTotal = {
  currency: string;
  income: number;
  expense: number;
  net: number;
};

export type PrintReportPayload = {
  ledgerName: string;
  periodLabel: string;
  exportedAt: string;
  rows: PrintReportRow[];
  totals: PrintReportTotal[];
  truncated: boolean;
  rowLimit: number;
};

export type PrintReportFetchResult =
  | { ok: true; data: PrintReportPayload }
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

export async function fetchLedgerReportForPrint(
  ledgerId: string,
  year: number,
  monthParam: string | null
): Promise<PrintReportFetchResult> {
  if (!ledgerId || !Number.isFinite(year)) {
    return { ok: false, status: 400, message: "缺少 ledgerId 或 year" };
  }

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

  let range: { start: string; end: string };
  let periodLabel: string;
  if (monthParam && monthParam !== "all") {
    const m = Number(monthParam);
    if (!Number.isInteger(m) || m < 1 || m > 12) {
      return { ok: false, status: 400, message: "月份須為 1–12" };
    }
    range = monthBounds(year, m);
    periodLabel = `${year} 年 ${m} 月`;
  } else {
    range = yearBounds(year);
    periodLabel = `${year} 年(全年)`;
  }

  const { data: txs, error: te } = await supabase
    .from("transactions")
    .select("type, amount, currency, note, tx_date, category_id")
    .eq("ledger_id", ledgerId)
    .gte("tx_date", range.start)
    .lte("tx_date", range.end)
    .order("tx_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(REPORT_PRINT_ROW_LIMIT);

  if (te) {
    return { ok: false, status: 500, message: te.message };
  }

  const raw = txs ?? [];
  const truncated = raw.length >= REPORT_PRINT_ROW_LIMIT;

  const catIds = [...new Set(raw.map((t) => t.category_id).filter(Boolean))] as string[];
  const catMap = new Map<string, string>();
  if (catIds.length) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name")
      .in("id", catIds);
    for (const c of cats ?? []) catMap.set(c.id, c.name);
  }

  const chronological = [...raw].reverse();

  const rows: PrintReportRow[] = chronological.map((t) => ({
    tx_date: t.tx_date,
    type: t.type === "income" ? "income" : "expense",
    amount: Number(t.amount),
    currency: t.currency,
    category: t.category_id ? (catMap.get(t.category_id) ?? "") : "",
    note: (t.note ?? "").replace(/\r?\n/g, " ").trim(),
  }));

  const byCcy = new Map<string, { inc: number; exp: number }>();
  for (const t of raw) {
    const cur = t.currency || "-";
    const o = byCcy.get(cur) ?? { inc: 0, exp: 0 };
    if (t.type === "income") o.inc += Number(t.amount);
    else o.exp += Number(t.amount);
    byCcy.set(cur, o);
  }

  const totals: PrintReportTotal[] = [...byCcy.keys()]
    .sort()
    .map((currency) => {
      const { inc, exp } = byCcy.get(currency)!;
      return { currency, income: inc, expense: exp, net: inc - exp };
    });

  return {
    ok: true,
    data: {
      ledgerName: ledger.name,
      periodLabel,
      exportedAt: exportTimestampHK(),
      rows,
      totals,
      truncated,
      rowLimit: REPORT_PRINT_ROW_LIMIT,
    },
  };
}
