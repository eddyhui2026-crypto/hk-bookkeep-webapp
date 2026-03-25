import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";
import { supabaseCookieOptionsForHost } from "@/lib/supabase/cookie-options";

export function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();
  const host =
    typeof window !== "undefined" ? window.location.hostname : "";
  const cookieOptions = supabaseCookieOptionsForHost(host);

  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions,
  });
}
