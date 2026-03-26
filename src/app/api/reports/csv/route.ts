import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { monthBounds, yearBounds } from "@/lib/reports";
import { getMarketFromEnv, marketFromHost } from "@/lib/market";
import { getMessageTree } from "@/lib/i18n/get-message-tree";
import type { Locale } from "@/lib/i18n/messages";
import { translate } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ledgerId = searchParams.get("ledgerId");
  const year = Number(searchParams.get("year"));
  const month = searchParams.get("month");
  const localeRaw = searchParams.get("locale");
  const locale: Locale = localeRaw === "en" ? "en" : "zh";
  const host = new URL(request.url).host;
  const market = marketFromHost(host) ?? getMarketFromEnv();
  const tree = getMessageTree(market, locale);
  const tr = (k: string) => translate(tree, k);

  if (!ledgerId || !Number.isFinite(year)) {
    return NextResponse.json(
      { error: locale === "en" ? "Missing ledgerId or year" : "缺少 ledgerId 或 year" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: locale === "en" ? "Unauthenticated" : "未登入" },
      { status: 401 }
    );
  }

  const { data: ledger, error: le } = await supabase
    .from("ledgers")
    .select("name")
    .eq("id", ledgerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (le || !ledger) {
    return NextResponse.json(
      { error: locale === "en" ? "Ledger not found" : "找不到生意簿" },
      { status: 404 }
    );
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
  const catMap = new Map<string, { name: string; slug: string | null }>();
  if (catIds.length) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name, slug")
      .in("id", catIds);
    for (const c of cats ?? []) catMap.set(c.id, { name: c.name, slug: c.slug ?? null });
  }

  const categoryLabel = (name: string, slug: string | null) => {
    if (slug) {
      const key = `catalog.${slug}`;
      const hit = tr(key);
      if (hit !== key) return hit;
    }
    return name;
  };

  const rows: string[][] = [
    [
      tr("printReport.colDate"),
      locale === "en" ? "Type" : "類型",
      locale === "en" ? "Amount" : "金額",
      tr("printReport.colCurrency"),
      tr("printReport.colCategory"),
      tr("printReport.colNote"),
    ],
    ...(txs ?? []).map((t) => {
      const catRec = t.category_id ? catMap.get(t.category_id) : undefined;
      const cat = catRec ? categoryLabel(catRec.name, catRec.slug) : "";
      return [
        t.tx_date,
        t.type === "income"
          ? tr("dashboard.income")
          : tr("dashboard.expense"),
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
