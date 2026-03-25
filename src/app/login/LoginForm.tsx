"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";
import { SITE_URL } from "@/lib/env";
import { useMarket } from "@/components/MarketProvider";
import { getSiteName } from "@/lib/market";
import {
  isAllowedOauthReturnOrigin,
  OAUTH_RETURN_MAX_AGE_SEC,
  OAUTH_RETURN_ORIGIN_COOKIE,
} from "@/lib/oauth-return-origin";

export function LoginForm() {
  const market = useMarket();
  const siteName = getSiteName(market);
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const err = sp.get("error");
  const nextRaw = sp.get("next") ?? "/app";
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/app";

  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : SITE_URL;

  async function google() {
    setLoading(true);
    setErrMsg(null);
    setInfoMsg(null);
    if (
      typeof window !== "undefined" &&
      isAllowedOauthReturnOrigin(window.location.origin)
    ) {
      document.cookie = `${OAUTH_RETURN_ORIGIN_COOKIE}=${encodeURIComponent(window.location.origin)}; Path=/; Domain=.harbix.app; Max-Age=${OAUTH_RETURN_MAX_AGE_SEC}; Secure; SameSite=Lax`;
    }
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

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    setInfoMsg(null);
    const em = email.trim();
    if (!em) {
      setErrMsg(t("login.needEmail"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    if (mode === "signIn") {
      const { error } = await supabase.auth.signInWithPassword({
        email: em,
        password,
      });
      setLoading(false);
      if (error) {
        setErrMsg(error.message);
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: em,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) {
      setErrMsg(error.message);
      return;
    }
    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }
    setInfoMsg(t("login.checkEmail"));
    setPassword("");
  }

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    setInfoMsg(null);
    const em = email.trim();
    if (!em) {
      setErrMsg(t("login.needEmail"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(em, {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`,
    });
    setLoading(false);
    if (error) {
      setErrMsg(error.message);
      return;
    }
    setInfoMsg(t("login.resetSent"));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Link href="/" className="text-sm text-brand hover:underline">
          {t("login.back")}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {t("login.title", { site: siteName })}
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

        <p className="my-6 text-center text-xs text-muted">{t("login.or")}</p>

        {forgotMode ? (
          <form onSubmit={(e) => void sendReset(e)} className="space-y-3">
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPh")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
            >
              {loading ? t("login.loading") : t("login.forgotSubmit")}
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setErrMsg(null);
                setInfoMsg(null);
              }}
              className="w-full text-sm text-brand underline"
            >
              {t("login.forgotBack")}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => void submitEmail(e)} className="space-y-3">
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPh")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
            <input
              type="password"
              name="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.passwordPh")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
            {mode === "signIn" && (
              <button
                type="button"
                onClick={() => {
                  setForgotMode(true);
                  setErrMsg(null);
                  setInfoMsg(null);
                }}
                className="text-left text-sm text-brand hover:underline"
              >
                {t("login.forgot")}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
            >
              {loading
                ? t("login.loading")
                : mode === "signIn"
                  ? t("login.signInEmail")
                  : t("login.signUpEmail")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
                setErrMsg(null);
                setInfoMsg(null);
              }}
              className="w-full text-sm text-muted hover:text-foreground"
            >
              {mode === "signIn" ? t("login.switchToSignUp") : t("login.switchToSignIn")}
            </button>
          </form>
        )}

        {errMsg && <p className="mt-4 text-sm text-expense">{errMsg}</p>}
        {infoMsg && (
          <p className="mt-4 rounded-lg bg-brand/10 px-3 py-2 text-sm text-foreground">
            {infoMsg}
          </p>
        )}
      </div>
    </div>
  );
}
