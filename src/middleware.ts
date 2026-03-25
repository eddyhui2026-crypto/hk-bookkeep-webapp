import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Supabase 有時會否決 redirectTo、改將 session 換票用嘅 code 放回 Site URL 根路徑（/?code=）。
  // 換票必須喺 /auth/callback 做；同一網域下轉過去可保留 PKCE cookie。
  const u = request.nextUrl.clone();
  if (u.pathname === "/" && u.searchParams.has("code")) {
    u.pathname = "/auth/callback";
    return NextResponse.redirect(u);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
