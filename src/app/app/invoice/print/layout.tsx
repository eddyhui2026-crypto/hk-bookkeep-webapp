import type { Metadata } from "next";

/** 避免瀏覽器列印／PDF 頁首使用「… | Harbix 香港記帳」網站 title */
export const metadata: Metadata = {
  title: { absolute: "Invoice" },
  robots: { index: false, follow: false },
};

export default function InvoicePrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
