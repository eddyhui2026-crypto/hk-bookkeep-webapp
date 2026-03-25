import type { Metadata } from "next";
import { PrivacyPageBody } from "@/components/legal/PrivacyPageBody";

export const metadata: Metadata = {
  title: "私隱政策 — HKBookkeep",
  description:
    "個人資料收集、用途、副處理者（Stripe、Supabase、Unosend、Vercel）、試用結束後 T+30／60／90 保留安排。",
};

export default function PrivacyPage() {
  return <PrivacyPageBody />;
}
