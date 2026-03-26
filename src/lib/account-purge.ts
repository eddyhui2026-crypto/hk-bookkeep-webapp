import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";

export async function removeUserReceiptsFromStorage(
  admin: SupabaseClient,
  userId: string
): Promise<void> {
  const prefix = userId;
  for (;;) {
    const { data: objs, error } = await admin.storage.from("receipts").list(prefix, {
      limit: 1000,
    });
    if (error) throw error;
    if (!objs?.length) break;
    const paths = objs.map((o) => `${prefix}/${o.name}`);
    const { error: rmErr } = await admin.storage.from("receipts").remove(paths);
    if (rmErr) throw rmErr;
    if (objs.length < 1000) break;
  }
}

async function cancelAndDeleteStripeCustomer(customerId: string) {
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY) return;
  const stripe = getStripe();
  let startingAfter: string | undefined;
  for (;;) {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
      starting_after: startingAfter,
    });
    for (const sub of subs.data) {
      if (!["canceled", "incomplete_expired"].includes(sub.status)) {
        await stripe.subscriptions.cancel(sub.id);
      }
    }
    if (!subs.has_more) break;
    startingAfter = subs.data[subs.data.length - 1]!.id;
  }
  await stripe.customers.del(customerId);
}

/**
 * 與帳號頁「刪除帳戶」相同之清除（收據 Storage、Stripe、Auth 用戶；DB 隨 auth 級联刪除）。
 */
export async function purgeAuthUserAndRelatedData(
  admin: SupabaseClient,
  userId: string
): Promise<{ ok: true } | { ok: false; step: string; message: string }> {
  try {
    await removeUserReceiptsFromStorage(admin, userId);
  } catch (e) {
    return {
      ok: false,
      step: "storage",
      message: e instanceof Error ? e.message : String(e),
    };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();
  const customerId = profile?.stripe_customer_id as string | undefined;

  if (customerId?.trim()) {
    try {
      await cancelAndDeleteStripeCustomer(customerId.trim());
    } catch (e) {
      console.error("Stripe cleanup on purge (continuing with auth delete)", e);
    }
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
    return {
      ok: false,
      step: "auth",
      message: delErr.message,
    };
  }

  return { ok: true };
}
