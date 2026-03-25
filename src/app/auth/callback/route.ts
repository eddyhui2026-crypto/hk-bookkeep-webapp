import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import {
  OAUTH_RETURN_ORIGIN_COOKIE,
  pickRedirectOriginAfterOAuth,
} from "@/lib/oauth-return-origin";
import { getBrowserFacingOriginFromRequest } from "@/lib/request-site";

function clearOauthReturnCookie(res: NextResponse): void {
  res.cookies.set(OAUTH_RETURN_ORIGIN_COOKIE, "", {
    path: "/",
    domain: ".harbix.app",
    maxAge: 0,
    secure: true,
    sameSite: "lax",
  });
}

export async function GET(request: NextRequest) {
  const requestOrigin = getBrowserFacingOriginFromRequest(request);
  const preferred =
    request.cookies.get(OAUTH_RETURN_ORIGIN_COOKIE)?.value ?? null;
  const origin = pickRedirectOriginAfterOAuth(preferred, requestOrigin);

  const code = request.nextUrl.searchParams.get("code");
  let next = request.nextUrl.searchParams.get("next") ?? "/app";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/app";

  const redirectOk = `${origin}${next}`;
  const redirectErr = `${origin}/login?error=auth`;

  if (!code) {
    const res = NextResponse.redirect(redirectErr);
    clearOauthReturnCookie(res);
    return res;
  }

  let response = NextResponse.redirect(redirectOk);
  const supabase = createRouteHandlerClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    response = NextResponse.redirect(redirectErr);
  }

  clearOauthReturnCookie(response);
  return response;
}
