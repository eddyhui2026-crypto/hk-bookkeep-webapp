import { NextResponse } from "next/server";
import { PUBLIC_SUPPORT_EMAIL, getPublicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { purgeAuthUserAndRelatedData, removeUserReceiptsFromStorage } from "@/lib/account-purge";
import { sendTransactionalEmailToUser } from "@/lib/transactional-email";
import {
  buildTrialReminderEmail,
  isEligibleForTrialRetentionPolicy,
  utcAddCalendarDays,
} from "@/lib/trial-retention";
import type { ProfileRow } from "@/lib/access";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ProfileRetentionRow = Pick<
  ProfileRow,
  | "subscription_status"
  | "trial_ends_at"
  | "current_period_end"
  | "trial_retention_reminder_sent_at"
> & { id: string };

function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    if (process.env.VERCEL === "1") return false;
    return true;
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: "Server misconfigured", detail: String(e) },
      { status: 500 }
    );
  }

  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const appUrl = (NEXT_PUBLIC_SITE_URL ?? "https://hkbookkeep.harbix.app").replace(
    /\/$/,
    ""
  );

  const { data: rows, error: qErr } = await admin
    .from("profiles")
    .select(
      "id, subscription_status, trial_ends_at, current_period_end, trial_retention_reminder_sent_at"
    )
    .not("trial_ends_at", "is", null)
    .lte("trial_ends_at", new Date(now).toISOString())
    .limit(2000);

  if (qErr) {
    console.error("trial-retention cron query", qErr);
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  let remindersSent = 0;
  let purged = 0;
  let t90ExtraStoragePasses = 0;
  const errors: string[] = [];

  for (const row of (rows ?? []) as ProfileRetentionRow[]) {
    if (!isEligibleForTrialRetentionPolicy(row, now)) continue;

    const t0 = row.trial_ends_at!;
    const t60 = utcAddCalendarDays(t0, 60);
    const t90 = utcAddCalendarDays(t0, 90);

    if (now >= t60.getTime()) {
      if (now >= t90.getTime()) {
        try {
          await removeUserReceiptsFromStorage(admin, row.id);
          t90ExtraStoragePasses++;
        } catch (e) {
          errors.push(
            `t90 storage ${row.id}: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }

      const purgeResult = await purgeAuthUserAndRelatedData(admin, row.id);
      if (!purgeResult.ok) {
        if (
          purgeResult.step === "auth" &&
          /not\s*found|not found|No user found/i.test(purgeResult.message)
        ) {
          continue;
        }
        errors.push(`purge ${row.id}: ${purgeResult.step} ${purgeResult.message}`);
        continue;
      }
      purged++;
      continue;
    }

    const t30 = utcAddCalendarDays(t0, 30);
    if (now < t30.getTime()) continue;
    if (row.trial_retention_reminder_sent_at) continue;

    const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(
      row.id
    );
    if (userErr || !userRes.user?.email) {
      errors.push(`reminder ${row.id}: no user or email`);
      continue;
    }

    const { subject, text } = buildTrialReminderEmail({
      appUrl,
      supportEmail: PUBLIC_SUPPORT_EMAIL,
    });
    const sent = await sendTransactionalEmailToUser({
      to: userRes.user.email,
      subject,
      text,
    });
    if (!sent.ok) {
      errors.push(`reminder ${row.id}: ${sent.error}`);
      continue;
    }

    const { error: upErr } = await admin
      .from("profiles")
      .update({
        trial_retention_reminder_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (upErr) {
      errors.push(`reminder mark ${row.id}: ${upErr.message}`);
      continue;
    }
    remindersSent++;
  }

  return NextResponse.json({
    ok: true,
    remindersSent,
    purged,
    t90ExtraStoragePasses,
    errorCount: errors.length,
    errors: errors.slice(0, 20),
  });
}
