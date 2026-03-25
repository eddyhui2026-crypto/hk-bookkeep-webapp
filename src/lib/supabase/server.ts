import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/env";
import { supabaseCookieOptionsForHost } from "@/lib/supabase/cookie-options";

/**
 * Route Handler：`exchangeCodeForSession` 等寫入必須落在最終回傳嘅 `NextResponse` 上，
 * 否則部分環境（尤其手機）Redirect 唔會帶齊 session cookie。
 */
export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse
) {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    "";
  const cookieOptions = supabaseCookieOptionsForHost(host);
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  return createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function createClient() {
  const cookieStore = await cookies();
  const h = await headers();
  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ?? h.get("host") ?? "";
  const cookieOptions = supabaseCookieOptionsForHost(host);

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* Server Component — ignore */
        }
      },
    },
  });
}
