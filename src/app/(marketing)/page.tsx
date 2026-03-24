import type { Metadata } from "next";
import { HomePageClient } from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Harbix 香港記帳 — 多生意簿、專為 freelancer／網店",
  description:
    "HK$38／月、年付 HK$380、14 日試用。多本生意簿、手機影收據即記、簡易 Invoice 列印／PDF、CSV／報表匯出。慳時間整理單據。",
};

export default function HomePage() {
  return <HomePageClient />;
}
