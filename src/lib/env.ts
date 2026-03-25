import { z } from "zod";

const server = z.object({
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_YEARLY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  /** Unosend：Dashboard → API Keys，格式通常為 un_… */
  UNOSEND_API_KEY: z.string().optional(),
  /** 已於 Unosend 驗證嘅發件人；可填純電郵或「顯示名稱 <email@domain>」 */
  CONTACT_FROM_EMAIL: z.string().min(1).optional(),
  CONTACT_TO_EMAIL: z.string().email().optional(),
});

const client = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export function getPublicEnv() {
  return client.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

export function getServerEnv() {
  return server.parse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_MONTHLY: process.env.STRIPE_PRICE_MONTHLY,
    STRIPE_PRICE_YEARLY: process.env.STRIPE_PRICE_YEARLY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    UNOSEND_API_KEY: process.env.UNOSEND_API_KEY,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  });
}

/** 介面／PWA 顯示名（法律主體見條款內文） */
export const SITE_NAME = "HKBookkeep";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hkbookkeep.harbix.app";

/** 公開營運／聯絡電郵（預設發件／收件可與此對齊，並於 Unosend 驗證網域） */
export const PUBLIC_SUPPORT_EMAIL = "hkbookkeep@harbix.app";
