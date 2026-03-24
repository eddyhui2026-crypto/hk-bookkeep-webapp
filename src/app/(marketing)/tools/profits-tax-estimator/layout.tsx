import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利得稅粗估",
  description:
    "香港兩級利得稅粗略估算（非稅務意見）。Harbix 免費工具。",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
