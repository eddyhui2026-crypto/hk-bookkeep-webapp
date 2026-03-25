"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import {
  OAUTH_RETURN_ORIGIN_COOKIE,
  pickRedirectOriginAfterOAuthFromSources,
  stripTrailingSlash,
} from "@/lib/oauth-return-origin";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(/\s*;\s*/);
  for (const p of parts) {
    if (p.startsWith(`${name}=`)) {
      return decodeURIComponent(p.slice(name.length + 1));
    }
  }
  return null;
}

function clearOauthReturnClient(): void {
  if (typeof document === "undefined") return;
  const h = window.location.hostname.toLowerCase();
  if (h === "harbix.app" || h.endsWith(".harbix.app")) {
    document.cookie = `${OAUTH_RETURN_ORIGIN_COOKIE}=; Path=/; Domain=.harbix.app; Max-Age=0; Secure; SameSite=None`;
  }
  document.cookie = `${OAUTH_RETURN_ORIGIN_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=None`;
}

function AuthCallbackFallback() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted">
      {t("authCallback.working")}
    </div>
  );
}

function AuthCallbackInner() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const code = sp.get("code");
        let next = sp.get("next") ?? "/app";
        if (!next.startsWith("/") || next.startsWith("//")) next = "/app";

        const requestOrigin = stripTrailingSlash(window.location.origin);
        const origin = pickRedirectOriginAfterOAuthFromSources(
          sp.get("return_origin"),
          readCookie(OAUTH_RETURN_ORIGIN_COOKIE),
          requestOrigin
        );

        if (!code) {
          clearOauthReturnClient();
          router.replace(`${origin}/login?error=auth`);
          return;
        }

        const supabase = createClient();
        await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        clearOauthReturnClient();

        const { data: sessionData } = await supabase.auth.getSession();
        const access = sessionData.session?.access_token;
        const refresh = sessionData.session?.refresh_token;
        if (!access || !refresh) {
          router.replace(`${origin}/login?error=auth`);
          return;
        }

        const sync = await fetch(`${origin}/api/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            access_token: access,
            refresh_token: refresh,
          }),
        });
        if (!sync.ok) {
          router.replace(`${origin}/login?error=auth`);
          return;
        }

        window.location.replace(`${origin}${next}`);
      } catch {
        const origin = stripTrailingSlash(
          typeof window !== "undefined" ? window.location.origin : ""
        );
        if (origin) {
          router.replace(`${origin}/login?error=auth`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, sp]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted">
      {t("authCallback.working")}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackInner />
    </Suspense>
  );
}
