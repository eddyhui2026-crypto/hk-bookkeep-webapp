import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestOrigin = getBrowserFacingOriginFromRequest(request);
  const jar = await cookies();
  const preferred = jar.get(OAUTH_RETURN_ORIGIN_COOKIE)?.value ?? null;
  const origin = pickRedirectOriginAfterOAuth(preferred, requestOrigin);

  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/app";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const res = NextResponse.redirect(`${origin}${next}`);
      clearOauthReturnCookie(res);
      return res;
    }
  }

  const res = NextResponse.redirect(`${origin}/login?error=auth`);
  clearOauthReturnCookie(res);
  return res;
}
