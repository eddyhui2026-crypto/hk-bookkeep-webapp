"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canWriteSubscription, type ProfileRow } from "@/lib/access";
import {
  CATEGORY_MAX_PER_LEDGER,
  categorySeedRowsForNewLedger,
  LEDGER_MAX,
  CURRENCIES,
  defaultCurrencyForMarket,
} from "@/lib/constants";
import type { CurrencyCode } from "@/lib/constants";
import { sanitizeFxPatch } from "@/lib/fx-rates";
import {
  serverActionUiCategoryMax,
  serverActionUiLedgerMax,
  serverActionUiMessage,
} from "@/lib/i18n/server-action-ui";
import type { Locale } from "@/lib/i18n/messages";
import type { Market } from "@/lib/market";
import { getMarket } from "@/lib/market-server";

async function requireUserAndProfile(): Promise<{
  userId: string;
  profile: ProfileRow | null;
  market: Market;
}> {
  const market = await getMarket();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(serverActionUiMessage(market, "notSignedIn"));

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, trial_ends_at, current_period_end")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    profile: profile as ProfileRow | null,
    market,
  };
}

async function requireWrite(): Promise<{ userId: string; market: Market }> {
  const ctx = await requireUserAndProfile();
  if (!canWriteSubscription(ctx.profile)) {
    throw new Error(serverActionUiMessage(ctx.market, "readOnly"));
  }
  return { userId: ctx.userId, market: ctx.market };
}

export async function createLedger(
  name: string,
  template?: "freelance" | "shop",
  uiLocale: Locale = "zh"
) {
  const { userId, market } = await requireWrite();
  const trimmed = name.trim();
  let finalName = trimmed;
  if (!finalName) {
    if (template === "shop") finalName = uiLocale === "en" ? "Shop A" : "網店 A";
    else if (template === "freelance") finalName = "Freelance";
  }
  if (!finalName) {
    throw new Error(serverActionUiMessage(market, "ledgerNameOrTemplate"));
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("ledgers")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  if ((count ?? 0) >= LEDGER_MAX) {
    throw new Error(serverActionUiLedgerMax(market, LEDGER_MAX));
  }

  const { data: ledger, error: le } = await supabase
    .from("ledgers")
    .insert({ user_id: userId, name: finalName })
    .select("id")
    .single();

  if (le || !ledger) {
    throw new Error(le?.message ?? serverActionUiMessage(market, "createFailed"));
  }

  const seed = categorySeedRowsForNewLedger(template, uiLocale, market);

  const cats = seed.map((c, i) => ({
    user_id: userId,
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
  const { market } = await requireWrite();
  const trimmed = name.trim();
  if (!trimmed) throw new Error(serverActionUiMessage(market, "ledgerNameRequired"));

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
  const { userId, market } = await requireWrite();
  const anchor = defaultCurrencyForMarket(market);
  const cleaned = sanitizeFxPatch(patch, anchor);
  if (Object.keys(cleaned).length === 0) {
    throw new Error(serverActionUiMessage(market, "fxInvalid"));
  }

  const supabase = await createClient();

  const { data: row, error: selErr } = await supabase
    .from("ledgers")
    .select("fx_rates_to_anchor")
    .eq("id", ledgerId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (selErr) throw new Error(selErr.message);
  if (!row) throw new Error(serverActionUiMessage(market, "ledgerNotFound"));

  const prev =
    row.fx_rates_to_anchor &&
    typeof row.fx_rates_to_anchor === "object" &&
    !Array.isArray(row.fx_rates_to_anchor)
      ? { ...(row.fx_rates_to_anchor as Record<string, unknown>) }
      : {};

  const next = { ...prev, ...cleaned };

  const { error } = await supabase
    .from("ledgers")
    .update({ fx_rates_to_anchor: next })
    .eq("id", ledgerId)
    .eq("user_id", userId)
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
  const { userId, market } = await requireWrite();
  const supabase = await createClient();

  if (!CURRENCIES.includes(input.currency as CurrencyCode)) {
    throw new Error(serverActionUiMessage(market, "currencyUnsupported"));
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
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
  const { userId, market } = await requireWrite();
  const supabase = await createClient();

  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .select("id, ledger_id")
    .eq("id", transactionId)
    .maybeSingle();

  if (txErr) throw new Error(txErr.message);
  if (!tx) throw new Error(serverActionUiMessage(market, "txNotFound"));

  if (categoryId) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("ledger_id", tx.ledger_id)
      .maybeSingle();

    if (catErr) throw new Error(catErr.message);
    if (!cat) throw new Error(serverActionUiMessage(market, "categorySameLedger"));
  }

  const { error } = await supabase
    .from("transactions")
    .update({ category_id: categoryId })
    .eq("id", transactionId)
    .eq("user_id", userId);

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
  const { userId, market } = await requireWrite();
  const trimmed = name.trim();
  if (!trimmed) throw new Error(serverActionUiMessage(market, "categoryNameRequired"));

  const supabase = await createClient();

  const { count, error: cntErr } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("ledger_id", ledgerId);

  if (cntErr) throw new Error(cntErr.message);
  if ((count ?? 0) >= CATEGORY_MAX_PER_LEDGER) {
    throw new Error(serverActionUiCategoryMax(market, CATEGORY_MAX_PER_LEDGER));
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
      user_id: userId,
      ledger_id: ledgerId,
      name: trimmed,
      color: color?.trim() || "#6366f1",
      sort_order: nextOrder,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? serverActionUiMessage(market, "addCategoryFailed"));
  }
  revalidatePath("/app");
  return data.id;
}
