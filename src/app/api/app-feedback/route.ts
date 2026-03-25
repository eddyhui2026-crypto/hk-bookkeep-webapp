import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendOperatorEmail } from "@/lib/operator-email";

const schema = z.object({
  kind: z.enum(["bug", "confusion", "billing", "suggestion", "other"]),
  message: z.string().min(1).max(8000),
  pageHint: z.string().max(2000).optional(),
  website: z.string().max(10).optional(),
});

const kindLabelZh: Record<string, string> = {
  bug: "錯誤／當機",
  confusion: "唔識用／唔清楚",
  billing: "訂閱／付款",
  suggestion: "建議功能",
  other: "其他",
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "資料無效" }, { status: 400 });
    }

    const { kind, message, pageHint, website } = parsed.data;
    if (website) {
      return NextResponse.json({ ok: true });
    }

    const email = user.email?.trim();
    if (!email) {
      return NextResponse.json(
        { error: "帳戶沒有電郵，無法回覆你" },
        { status: 400 }
      );
    }

    const kindZh = kindLabelZh[kind] ?? kind;
    const sub = `[HKBookkeep] App 回報 — ${kindZh} — ${email}`;

    const text = [
      "— HKBookkeep 應用內回報 —",
      "",
      `種類: ${kindZh} (${kind})`,
      `登入電郵: ${email}`,
      `User ID: ${user.id}`,
      pageHint ? `頁面／描述位置: ${pageHint}` : null,
      "",
      "內容:",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const sent = await sendOperatorEmail({
      subject: sub,
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
