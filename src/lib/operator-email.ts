import { getServerEnv, PUBLIC_SUPPORT_EMAIL } from "@/lib/env";

const RESEND_SEND_URL = "https://api.resend.com/emails";
const UNOSEND_SEND_URL = "https://api.unosend.co/emails";

export async function sendOperatorEmail(params: {
  subject: string;
  text: string;
  replyTo: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const env = getServerEnv();
  const to = env.CONTACT_TO_EMAIL ?? PUBLIC_SUPPORT_EMAIL;
  const from =
    env.CONTACT_FROM_EMAIL ?? `HKBookkeep <${PUBLIC_SUPPORT_EMAIL}>`;

  const resendKey = env.RESEND_API_KEY?.trim();
  const unosendKey = env.UNOSEND_API_KEY?.trim();

  if (!resendKey && !unosendKey) {
    return {
      ok: false,
      error:
        "郵件未設定：請喺部署環境加 RESEND_API_KEY 或 UNOSEND_API_KEY",
    };
  }

  const body = JSON.stringify({
    from,
    to: [to],
    reply_to: params.replyTo,
    subject: params.subject,
    text: params.text,
  });

  if (resendKey) {
    const res = await fetch(RESEND_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body,
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("Resend operator email failed", res.status, errBody);
      return {
        ok: false,
        error:
          "Resend 發送失敗（check from 網域是否已喺 Resend verify、API key 是否有效）",
      };
    }
    return { ok: true };
  }

  const res = await fetch(UNOSEND_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${unosendKey!}`,
      "Content-Type": "application/json",
    },
    body,
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("Unosend operator email failed", res.status, errBody);
    return { ok: false, error: "Unosend 發送失敗" };
  }
  return { ok: true };
}
