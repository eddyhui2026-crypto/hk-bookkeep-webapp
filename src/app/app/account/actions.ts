"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";

const PHRASE_ZH = "刪除我的帳號";
const PHRASE_EN = "DELETE MY ACCOUNT";

export type DeleteAccountState = { error: string; detail?: string } | null;

async function removeUserReceipts(admin: ReturnType<typeof createAdminClient>, userId: string) {
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

export async function deleteMyAccount(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const phrase = String(formData.get("phrase") ?? "").trim();
  const localeRaw = String(formData.get("locale") ?? "zh");
  const locale = localeRaw === "en" ? "en" : "zh";
  const expected = locale === "en" ? PHRASE_EN : PHRASE_ZH;
  if (phrase !== expected) {
    return { error: "phrase" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "auth" };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "config" };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  const customerId = profile?.stripe_customer_id as string | undefined;

  try {
    await removeUserReceipts(admin, user.id);
  } catch (e) {
    console.error("removeUserReceipts", e);
    return {
      error: "storage",
      detail: e instanceof Error ? e.message : String(e),
    };
  }

  if (customerId?.trim()) {
    try {
      await cancelAndDeleteStripeCustomer(customerId.trim());
    } catch (e) {
      console.error("Stripe cleanup on account delete (continuing with auth delete)", e);
    }
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    return { error: "delete_user", detail: delErr.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}
