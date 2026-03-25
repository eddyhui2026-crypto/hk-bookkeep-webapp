import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getPublicEnv } from "@/lib/env";
import { supabaseCookieOptionsForHost } from "@/lib/supabase/cookie-options";

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
