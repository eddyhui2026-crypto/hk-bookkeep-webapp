import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/app";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 必須用「今次請求實際打中嘅」callback URL，唔好用 x-forwarded-host：
      // 多網域同一 deployment 時，forwarded host 有機會永遠係主網域（例如 hk），會把 SG/TW OAuth 錯送去 HK。
      const dest = `${origin}${next}`;
      return NextResponse.redirect(dest);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
