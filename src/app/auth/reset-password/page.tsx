"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setErrMsg(t("resetPassword.mismatch"));
      return;
    }
    setLoading(true);
    setErrMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setErrMsg(error.message);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Link href="/login" className="text-sm text-brand hover:underline">
          {t("resetPassword.back")}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {t("resetPassword.title")}
        </h1>
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-3">
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("resetPassword.newPh")}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t("resetPassword.confirmPh")}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
          >
            {loading ? t("login.loading") : t("resetPassword.submit")}
          </button>
        </form>
        {errMsg && <p className="mt-4 text-sm text-expense">{errMsg}</p>}
      </div>
    </div>
  );
}
