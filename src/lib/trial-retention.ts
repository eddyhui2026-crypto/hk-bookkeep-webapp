import type { ProfileRow } from "@/lib/access";

/**
 * 試用已結束且符合私隱政策「仍未訂閱」— 可發 T+30 提醒／T+60 清除。
 * 與 `canWriteSubscription` 分開：須排除 past_due／unpaid 等仍屬 Stripe 訂閱狀態者。
 */
export function isEligibleForTrialRetentionPolicy(
  p: Pick<
    ProfileRow,
    "subscription_status" | "trial_ends_at" | "current_period_end"
  >,
  nowMs: number
): boolean {
  if (!p.trial_ends_at) return false;
  const t0 = new Date(p.trial_ends_at).getTime();
  if (nowMs < t0) return false;

  const status = String(p.subscription_status);

  if (status === "active") return false;
  if (status === "past_due" || status === "unpaid") return false;
  if (status === "incomplete") return false;
  if (status === "paused") return false;

  if (status === "canceled" && p.current_period_end) {
    const periodEnd = new Date(p.current_period_end).getTime();
    if (nowMs < periodEnd) return false;
  }

  return true;
}

/** UTC 日曆日加減（試用 T0 以 trial_ends_at 為準） */
export function utcAddCalendarDays(isoTimestamptz: string, days: number): Date {
  const d = new Date(isoTimestamptz);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function buildTrialReminderEmail(params: {
  appUrl: string;
  supportEmail: string;
}): { subject: string; text: string } {
  const subject =
    "[Bookkeep] 試用結束後資料提醒 / Trial ended — data retention reminder";
  const text = `您好，

根據《私隱政策》，你的免費試用已結束，而帳戶目前沒有有效付費訂閱。我們在試用結束日起約第 30 日發出本電郵，提醒你可登入匯出資料（CSV／報表列印）或選擇訂閱以繼續使用。

登入／訂閱（請使用你註冊時的網站）：
${params.appUrl}/app

如有查詢：${params.supportEmail}

---

Hello,

Under our Privacy Policy, your free trial has ended and there is no active paid subscription. We send this email around 30 days after trial end as a reminder that you may sign in to export data (CSV / print reports) or subscribe to continue.

Sign in:
${params.appUrl}/app

Questions: ${params.supportEmail}

— Harbix
`;
  return { subject, text };
}
