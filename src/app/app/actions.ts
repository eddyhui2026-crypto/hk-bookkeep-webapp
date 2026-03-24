"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canWriteSubscription, type ProfileRow } from "@/lib/access";
import {
  CATEGORY_MAX_PER_LEDGER,
  categorySeedRowsForNewLedger,
  LEDGER_MAX,
  CURRENCIES,
} from "@/lib/constants";
import type { CurrencyCode } from "@/lib/constants";
import { sanitizeFxPatch } from "@/lib/fx-rates";
import type { Locale } from "@/lib/i18n/messages";

async function requireUserAndProfile(): Promise<{
  userId: string;
  profile: ProfileRow | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登入");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, trial_ends_at, current_period_end")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    profile: profile as ProfileRow | null,
  };
}

async function requireWrite() {
  const { profile } = await requireUserAndProfile();
  if (!canWriteSubscription(profile)) {
    throw new Error("目前為只讀模式，請訂閱或完成付款。");
  }
}

export async function createLedger(
  name: string,
  template?: "freelance" | "shop",
  uiLocale: Locale = "zh"
) {
  await requireWrite();
  const trimmed = name.trim();
  let finalName = trimmed;
  if (!finalName) {
    if (template === "shop") finalName = uiLocale === "en" ? "Shop A" : "網店 A";
    else if (template === "freelance") finalName = "Freelance";
  }
  if (!finalName) throw new Error("請輸入生意簿名稱或揀範本");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登入");

  const { count } = await supabase
    .from("ledgers")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  if ((count ?? 0) >= LEDGER_MAX) {
    throw new Error(`最多 ${LEDGER_MAX} 本生意簿`);
  }

  const { data: ledger, error: le } = await supabase
    .from("ledgers")
    .insert({ user_id: user.id, name: finalName })
    .select("id")
    .single();

  if (le || !ledger) throw new Error(le?.message ?? "建立失敗");

  const seed = categorySeedRowsForNewLedger(template, uiLocale);

  const cats = seed.map((c, i) => ({
    user_id: user.id,
    ledger_id: ledger.id,
    name: c.name,
    color: c.color,
    slug: c.slug,
    sort_order: i,
  }));

  const { error: ce } = await supabase.from("categories").insert(cats);
  if (ce) throw new Error(ce.message);

  revalidatePath("/app");
  return ledger.id;
}

export async function renameLedger(ledgerId: string, name: string) {
  await requireWrite();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("請輸入生意簿名稱");

  const supabase = await createClient();
  const { error } = await supabase
    .from("ledgers")
    .update({ name: trimmed })
    .eq("id", ledgerId)
    .is("deleted_at", null);
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function updateLedgerFxRates(
  ledgerId: string,
  patch: Record<string, unknown>
) {
  await requireWrite();
  const cleaned = sanitizeFxPatch(patch);
  if (Object.keys(cleaned).length === 0) {
    throw new Error("請輸入有效匯率（正數）");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登入");

  const { data: row, error: selErr } = await supabase
    .from("ledgers")
    .select("fx_rates_to_hkd")
    .eq("id", ledgerId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (selErr) throw new Error(selErr.message);
  if (!row) throw new Error("找不到生意簿");

  const prev =
    row.fx_rates_to_hkd &&
    typeof row.fx_rates_to_hkd === "object" &&
    !Array.isArray(row.fx_rates_to_hkd)
      ? { ...(row.fx_rates_to_hkd as Record<string, unknown>) }
      : {};

  const next = { ...prev, ...cleaned };

  const { error } = await supabase
    .from("ledgers")
    .update({ fx_rates_to_hkd: next })
    .eq("id", ledgerId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function softDeleteLedger(ledgerId: string) {
  await requireWrite();
  const supabase = await createClient();
  const { error } = await supabase
    .from("ledgers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", ledgerId);
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function createTransaction(input: {
  ledgerId: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  categoryId: string | null;
  note: string;
  txDate: string;
}) {
  await requireWrite();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登入");

  if (!CURRENCIES.includes(input.currency as CurrencyCode)) {
    throw new Error("不支援嘅幣種");
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      ledger_id: input.ledgerId,
      category_id: input.categoryId,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      note: input.note.trim() || null,
      tx_date: input.txDate,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/app");
  return data.id;
}

export async function attachReceipt(transactionId: string, path: string) {
  await requireWrite();
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update({ receipt_path: path })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function updateTransactionCategory(
  transactionId: string,
  categoryId: string | null
) {
  await requireWrite();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登入");

  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .select("id, ledger_id")
    .eq("id", transactionId)
    .maybeSingle();

  if (txErr) throw new Error(txErr.message);
  if (!tx) throw new Error("找不到交易");

  if (categoryId) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("ledger_id", tx.ledger_id)
      .maybeSingle();

    if (catErr) throw new Error(catErr.message);
    if (!cat) throw new Error("分類必須屬於同一本生意簿");
  }

  const { error } = await supabase
    .from("transactions")
    .update({ category_id: categoryId })
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function deleteTransaction(transactionId: string) {
  await requireWrite();
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", transactionId);
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function addCategory(ledgerId: string, name: string, color: string) {
  await requireWrite();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("請輸入分類名稱");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登入");

  const { count, error: cntErr } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("ledger_id", ledgerId);

  if (cntErr) throw new Error(cntErr.message);
  if ((count ?? 0) >= CATEGORY_MAX_PER_LEDGER) {
    throw new Error(`每本生意簿最多 ${CATEGORY_MAX_PER_LEDGER} 個分類`);
  }

  const { data: maxRow } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("ledger_id", ledgerId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      ledger_id: ledgerId,
      name: trimmed,
      color: color?.trim() || "#6366f1",
      sort_order: nextOrder,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "新增分類失敗");
  revalidatePath("/app");
  return data.id;
}
