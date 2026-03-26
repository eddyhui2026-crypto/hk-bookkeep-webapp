import { getServerEnv, PUBLIC_SUPPORT_EMAIL } from "@/lib/env";

const RESEND_SEND_URL = "https://api.resend.com/emails";
const UNOSEND_SEND_URL = "https://api.unosend.co/emails";

/** 服務類電郵（寄給用戶本人），與聯絡表單共用 Resend／Unosend 設定 */
export async function sendTransactionalEmailToUser(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const env = getServerEnv();
  const from =
    env.CONTACT_FROM_EMAIL ?? `Harbix Bookkeep <${PUBLIC_SUPPORT_EMAIL}>`;

  const resendKey = env.RESEND_API_KEY?.trim();
  const unosendKey = env.UNOSEND_API_KEY?.trim();

  if (!resendKey && !unosendKey) {
    return {
      ok: false,
      error: "No RESEND_API_KEY or UNOSEND_API_KEY configured",
    };
  }

  const body = JSON.stringify({
    from,
    to: [params.to],
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
      console.error("Resend transactional email failed", res.status, errBody);
      return { ok: false, error: `Resend failed (${res.status})` };
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
    console.error("Unosend transactional email failed", res.status, errBody);
    return { ok: false, error: `Unosend failed (${res.status})` };
  }
  return { ok: true };
}
