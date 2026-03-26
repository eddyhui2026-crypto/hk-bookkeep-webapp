export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type ProfileRow = {
  subscription_status: SubscriptionStatus | string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  stripe_customer_id?: string | null;
  trial_retention_reminder_sent_at?: string | null;
};

/**
 * Full read/write (記一筆、改、刪) — 與計劃一致：trialing 期內、或 active；
 * canceled 但仍在已付費週期內（current_period_end 未過）仍當可寫。
 */
export function canWriteSubscription(p: ProfileRow | null): boolean {
  if (process.env.NEXT_PUBLIC_DEV_FULL_ACCESS === "1") return true;
  if (!p) return false;
  const now = Date.now();
  const status = p.subscription_status;

  if (status === "active") return true;

  if (status === "trialing") {
    if (!p.trial_ends_at) return true;
    return now < new Date(p.trial_ends_at).getTime();
  }

  if (status === "canceled" && p.current_period_end) {
    return now < new Date(p.current_period_end).getTime();
  }

  return false;
}

/** 可進入 /app 睇資料（已登入即可）；匯出另由 API 檢查登入 */
export function readOnlyBanner(p: ProfileRow | null): boolean {
  return !canWriteSubscription(p);
}
