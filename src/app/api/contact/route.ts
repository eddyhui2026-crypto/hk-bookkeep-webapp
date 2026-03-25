import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOperatorEmail } from "@/lib/operator-email";

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

    const subject = `[HKBookkeep] 聯絡表單 — ${name || email}`;
    const text = `來自: ${name || "(無)"}\n電郵: ${email}\n\n${message}`;

    const sent = await sendOperatorEmail({
      subject,
      text,
      replyTo: email,
    });

    if (!sent.ok) {
      return NextResponse.json({ error: sent.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "錯誤" }, { status: 500 });
  }
}
