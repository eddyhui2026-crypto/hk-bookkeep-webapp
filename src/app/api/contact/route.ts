import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv, PUBLIC_SUPPORT_EMAIL } from "@/lib/env";

const UNOSEND_SEND_URL = "https://api.unosend.co/emails";
const RESEND_SEND_URL = "https://api.resend.com/emails";

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
    const to = env.CONTACT_TO_EMAIL ?? PUBLIC_SUPPORT_EMAIL;
    const from =
      env.CONTACT_FROM_EMAIL ?? `HKBookkeep <${PUBLIC_SUPPORT_EMAIL}>`;

    const resendKey = env.RESEND_API_KEY?.trim();
    const unosendKey = env.UNOSEND_API_KEY?.trim();

    if (!resendKey && !unosendKey) {
      return NextResponse.json(
        { error: "郵件未設定：請喺部署環境加 RESEND_API_KEY 或 UNOSEND_API_KEY" },
        { status: 500 }
      );
    }

    const subject = `[HKBookkeep] 聯絡表單 — ${name || email}`;
    const text = `來自: ${name || "(無)"}\n電郵: ${email}\n\n${message}`;

    if (resendKey) {
      const res = await fetch(RESEND_SEND_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject,
          text,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("Resend contact send failed", res.status, body);
        return NextResponse.json(
          {
            error:
              "Resend 發送失敗（check from 網域是否已喺 Resend verify、API key 是否有效）",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    const res = await fetch(UNOSEND_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${unosendKey!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Unosend contact send failed", res.status, body);
      return NextResponse.json({ error: "Unosend 發送失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "錯誤" }, { status: 500 });
  }
}
