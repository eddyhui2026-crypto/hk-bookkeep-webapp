import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBrowserFacingOriginFromRequest } from "@/lib/request-site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getBrowserFacingOriginFromRequest(request);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/app";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const dest = `${origin}${next}`;
      return NextResponse.redirect(dest);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
