import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { parse } from "cookie";
import { getPublicEnv } from "@/lib/env";
import { supabaseCookieOptionsForHost } from "@/lib/supabase/cookie-options";

function isAllowedSessionSyncOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    if (
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1")
    )
      return true;
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    return h === "harbix.app" || /^[a-z0-9-]+bookkeep\.harbix\.app$/.test(h);
  } catch {
    return false;
  }
}

function syncOriginFromRequest(request: Request): string | null {
  const o = request.headers.get("origin");
  if (o) return o;
  const ref = request.headers.get("referer");
  if (ref) {
    try {
      return new URL(ref).origin;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/** OAuth 喺瀏覽器用 localStorage 換票後，把 session 寫入 SSR／middleware 用嘅 http cookies。 */
export async function POST(request: Request) {
  const origin = syncOriginFromRequest(request);
  if (!isAllowedSessionSyncOrigin(origin)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { access_token?: string; refresh_token?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.access_token || !body.refresh_token) {
    return NextResponse.json({ error: "missing tokens" }, { status: 400 });
  }

  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    "";
  const cookieOptions = supabaseCookieOptionsForHost(host);
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  const res = NextResponse.json({ ok: true });
  const raw = request.headers.get("cookie") ?? "";

  const supabase = createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions,
      cookies: {
        getAll() {
          const parsed = parse(raw);
          return Object.keys(parsed).map((name) => ({
            name,
            value: parsed[name] ?? "",
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.setSession({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  return res;
}
