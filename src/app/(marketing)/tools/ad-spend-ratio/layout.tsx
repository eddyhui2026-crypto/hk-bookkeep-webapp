import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "網店廣告占比",
  description: "廣告費占營業額試算（非經營建議）。Harbix 免費工具。",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
