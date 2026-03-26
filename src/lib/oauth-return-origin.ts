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

/** Dev localhost OAuth callback (http) — production return origins use HTTPS only. */
export function isAllowedOauthReturnOriginOrLocalhost(origin: string): boolean {
  if (isAllowedOauthReturnOrigin(origin)) return true;
  try {
    const u = new URL(origin);
    return (
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

/**
 * 撳 Google 前先 call prepare-oauth：以 hostname 判斷，唔依賴 `new URL(origin)`，
 * 避免少數 Android WebView／異常 origin 字串令 `isAllowedOauthReturnOriginOrLocalhost` 誤判而跳過設 cookie。
 */
export function shouldPrepareOauthForHostname(hostname: string): boolean {
  const h = hostname.split(":")[0]?.toLowerCase() ?? "";
  if (h === "localhost" || h === "127.0.0.1") return true;
  return /^[a-z0-9-]+bookkeep\.harbix\.app$/.test(h);
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
