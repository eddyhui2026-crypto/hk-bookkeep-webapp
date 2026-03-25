import { headers } from "next/headers";
import { SITE_URL } from "@/lib/env";

function stripTrailingSlash(u: string): string {
  return u.replace(/\/$/, "");
}

/**
 * 瀏覽器實際用嘅公開 origin（同一個 deployment 多個網域時唔好用單一 `NEXT_PUBLIC_SITE_URL`）。
 * 用於 Stripe 返回網址、metadataBase 等。
 */
export async function getRequestSiteUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  if (!host) return stripTrailingSlash(SITE_URL);

  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.") ||
    host.startsWith("[::1]");

  const fwd = h.get("x-forwarded-proto");
  const proto =
    fwd === "http" || fwd === "https"
      ? fwd
      : isLocal
        ? "http"
        : "https";

  return stripTrailingSlash(`${proto}://${host}`);
}

/**
 * Route Handler 入面：`Request.url` 已帶正確 host（例如 client 由 sgbookkeep POST 過嚟）。
 */
export function getOriginFromApiRequest(request: Request): string {
  try {
    const u = new URL(request.url);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return stripTrailingSlash(u.origin);
    }
  } catch {
    /* use fallback */
  }
  return stripTrailingSlash(SITE_URL);
}

/**
 * OAuth／瀏覽器直接 GET：以 `Host`、`X-Forwarded-Host` 砌 origin，
 * 避免少數平台上 `request.url` 內部 host 同用戶網址列唔一致。
 */
export function getBrowserFacingOriginFromRequest(request: Request): string {
  const reqUrl = new URL(request.url);
  const xfHost = request.headers.get("x-forwarded-host");
  // 優先用 Host（與瀏覽器請求目標一致）；Forwarded-Host 有時係鏈或與主網域重覆。
  const host =
    request.headers.get("host") ||
    xfHost?.split(",")[0]?.trim() ||
    reqUrl.host;
  if (!host) return stripTrailingSlash(SITE_URL);

  const hostLower = host.split(":")[0]?.toLowerCase() ?? "";
  const isLocal =
    hostLower.startsWith("localhost") ||
    hostLower.startsWith("127.") ||
    hostLower.startsWith("[::1]");

  const xfProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    xfProto === "http" || xfProto === "https"
      ? xfProto
      : isLocal
        ? reqUrl.protocol === "https:"
          ? "https"
          : "http"
        : "https";

  return stripTrailingSlash(`${proto}://${host}`);
}
