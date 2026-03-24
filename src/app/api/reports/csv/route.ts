import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { monthBounds, yearBounds } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ledgerId = searchParams.get("ledgerId");
  const year = Number(searchParams.get("year"));
  const month = searchParams.get("month");

  if (!ledgerId || !Number.isFinite(year)) {
    return NextResponse.json({ error: "缺少 ledgerId 或 year" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { data: ledger, error: le } = await supabase
    .from("ledgers")
    .select("name")
    .eq("id", ledgerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (le || !ledger) {
    return NextResponse.json({ error: "找不到生意簿" }, { status: 404 });
  }

  const range =
    month && month !== "all"
      ? monthBounds(year, Number(month))
      : yearBounds(year);

  const { data: txs, error: te } = await supabase
    .from("transactions")
    .select("id, type, amount, currency, note, tx_date, category_id")
    .eq("ledger_id", ledgerId)
    .gte("tx_date", range.start)
    .lte("tx_date", range.end)
    .order("tx_date", { ascending: false });

  if (te) {
    return NextResponse.json({ error: te.message }, { status: 500 });
  }

  const catIds = [...new Set((txs ?? []).map((t) => t.category_id).filter(Boolean))] as string[];
  const catMap = new Map<string, string>();
  if (catIds.length) {
    const { data: cats } = await supabase.from("categories").select("id, name").in("id", catIds);
    for (const c of cats ?? []) catMap.set(c.id, c.name);
  }

  const rows: string[][] = [
    ["日期", "類型", "金額", "幣種", "分類", "備註"],
    ...(txs ?? []).map((t) => {
      const cat = t.category_id ? catMap.get(t.category_id) ?? "" : "";
      return [
        t.tx_date,
        t.type === "income" ? "收入" : "支出",
        String(t.amount),
        t.currency,
        cat,
        (t.note ?? "").replace(/\r?\n/g, " "),
      ];
    }),
  ];

  const bom = "\uFEFF";
  const csv =
    bom +
    rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\r\n");

  const label =
    month && month !== "all"
      ? `${year}-${String(month).padStart(2, "0")}`
      : `${year}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="harbix-${ledgerId.slice(0, 8)}-${label}.csv"`,
    },
  });
}
