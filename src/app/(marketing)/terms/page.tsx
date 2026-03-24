import type { Metadata } from "next";
import { TermsPageBody } from "@/components/legal/TermsPageBody";

export const metadata: Metadata = {
  title: "服務條款 — Harbix 香港記帳",
  description:
    "Harbix 香港記帳服務條款：試用、只讀、Stripe 訂閱與退款、責任限制等。",
};

export default function TermsPage() {
  return <TermsPageBody />;
}
