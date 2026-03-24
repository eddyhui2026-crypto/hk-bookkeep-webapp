import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv, PUBLIC_SUPPORT_EMAIL } from "@/lib/env";

const UNOSEND_SEND_URL = "https://api.unosend.co/emails";

const schema = z.object({
  name: z.string().max(120).optional(),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  website: z.string().max(10).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "資料無效" }, { status: 400 });
    }
    const { name, email, message, website } = parsed.data;
    if (website) {
      return NextResponse.json({ ok: true });
    }

    const env = getServerEnv();
    const key = env.UNOSEND_API_KEY;
    const to = env.CONTACT_TO_EMAIL ?? PUBLIC_SUPPORT_EMAIL;
    if (!key) {
      return NextResponse.json({ error: "郵件未設定" }, { status: 500 });
    }

    const from =
      env.CONTACT_FROM_EMAIL ?? `Harbix 記帳 <${PUBLIC_SUPPORT_EMAIL}>`;

    const res = await fetch(UNOSEND_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Harbix 記帳] 聯絡表單 — ${name || email}`,
        text: `來自: ${name || "(無)"}\n電郵: ${email}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Unosend contact send failed", res.status, body);
      return NextResponse.json({ error: "發送失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "錯誤" }, { status: 500 });
  }
}
