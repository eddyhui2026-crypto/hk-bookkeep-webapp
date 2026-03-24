"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";
import { SITE_NAME, SITE_URL } from "@/lib/env";

export function LoginForm() {
  const { t } = useI18n();
  const sp = useSearchParams();
  const err = sp.get("error");
  const nextRaw = sp.get("next") ?? "/app";
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/app";

  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : SITE_URL;

  async function google() {
    setLoading(true);
    setErrMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) setErrMsg(error.message);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Link href="/" className="text-sm text-brand hover:underline">
          {t("login.back")}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {t("login.title", { site: SITE_NAME })}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("login.subtitle")}</p>

        {err && (
          <p className="mt-4 rounded-lg bg-expense/10 px-3 py-2 text-sm text-expense">
            {t("login.err")}
          </p>
        )}

        <button
          type="button"
          onClick={() => void google()}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium hover:bg-brand/5 disabled:opacity-50"
        >
          {loading ? t("login.loading") : t("login.google")}
        </button>

        {errMsg && <p className="mt-4 text-sm text-expense">{errMsg}</p>}
      </div>
    </div>
  );
}
