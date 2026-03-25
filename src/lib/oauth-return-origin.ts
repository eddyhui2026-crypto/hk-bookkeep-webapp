/** 記低「邊個 bookkeep 子網開始 OAuth」，callback 喺 hk 完成換票後仍可跳返 sg/tw。 */

export const OAUTH_RETURN_ORIGIN_COOKIE = "bookkeep_oauth_origin";
export const OAUTH_RETURN_MAX_AGE_SEC = 600;

export function isAllowedOauthReturnOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    return /^[a-z0-9-]+bookkeep\.harbix\.app$/.test(h);
  } catch {
    return false;
  }
}

export function stripTrailingSlash(u: string): string {
  return u.replace(/\/$/, "");
}

export function pickRedirectOriginAfterOAuth(
  preferredFromCookie: string | null | undefined,
  requestOrigin: string
): string {
  if (preferredFromCookie) {
    const decoded = decodeURIComponent(preferredFromCookie);
    if (isAllowedOauthReturnOrigin(decoded)) {
      return stripTrailingSlash(decoded);
    }
  }
  return stripTrailingSlash(requestOrigin);
}

/** OAuth callback：query `return_origin`（Supabase 換 host 時多數會保留）優先於 cookie。 */
export function pickRedirectOriginAfterOAuthFromSources(
  returnOriginQuery: string | null | undefined,
  preferredFromCookie: string | null | undefined,
  requestOrigin: string
): string {
  if (returnOriginQuery) {
    const q = returnOriginQuery.trim();
    if (isAllowedOauthReturnOrigin(q)) return stripTrailingSlash(q);
  }
  return pickRedirectOriginAfterOAuth(preferredFromCookie, requestOrigin);
}
