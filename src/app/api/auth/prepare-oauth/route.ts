import { NextResponse } from "next/server";
import {
  isAllowedSessionSyncOrigin,
  syncOriginFromRequest,
} from "@/lib/auth-request-origin";
import {
  isAllowedOauthReturnOriginOrLocalhost,
  OAUTH_RETURN_MAX_AGE_SEC,
  OAUTH_RETURN_ORIGIN_COOKIE,
  stripTrailingSlash,
} from "@/lib/oauth-return-origin";

/**
 * 用 Set-Cookie（非 document.cookie）記住「邊個 *.bookkeep.harbix.app 開始 OAuth」。
 * Supabase 經常只將 code 送回 Site URL 根路徑 /?code=，唔帶 return_origin；伺服器 cookie 跟住跨子網較穩。
 */
export async function POST(request: Request) {
  const origin = syncOriginFromRequest(request);
  if (!isAllowedSessionSyncOrigin(origin)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!origin || !isAllowedOauthReturnOriginOrLocalhost(origin)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    "";
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";

  const res = NextResponse.json({ ok: true });
  const value = encodeURIComponent(stripTrailingSlash(origin));

  if (hostname === "harbix.app" || hostname.endsWith(".harbix.app")) {
    res.cookies.set(OAUTH_RETURN_ORIGIN_COOKIE, value, {
      domain: ".harbix.app",
      path: "/",
      maxAge: OAUTH_RETURN_MAX_AGE_SEC,
      secure: true,
      sameSite: "none",
    });
  } else {
    res.cookies.set(OAUTH_RETURN_ORIGIN_COOKIE, value, {
      path: "/",
      maxAge: OAUTH_RETURN_MAX_AGE_SEC,
      sameSite: "lax",
    });
  }

  return res;
}
