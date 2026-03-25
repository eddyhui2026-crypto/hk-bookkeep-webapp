import type { CookieOptions } from "@supabase/ssr";

/**
 * OAuth 由 sg/tw 開始卻被 Supabase 送回 hk（Site URL）時，預設 host-only cookie 唔會跟住跨子網域，
 * PKCE verifier 唔見 → exchangeCodeForSession 失敗 → /login?error=auth。
 * 正式環境同一頂級域 *.harbix.app 共用 cookie domain。
 */
export function supabaseCookieOptionsForHost(
  hostHeaderOrHostname: string | null | undefined
): CookieOptions | undefined {
  if (!hostHeaderOrHostname) return undefined;
  const host = hostHeaderOrHostname.split(":")[0]?.toLowerCase() ?? "";
  if (host === "harbix.app" || host.endsWith(".harbix.app")) {
    return {
      domain: ".harbix.app",
      path: "/",
      /** Google OAuth 返嚟屬 cross-site top-level navigation；Android Chrome 喺 Lax 下間中甩 session */
      sameSite: "none",
      secure: true,
    };
  }
  return undefined;
}
