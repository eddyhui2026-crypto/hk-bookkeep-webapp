import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelancer 時薪倒算",
  description: "按目標月入與工時估算需達時薪。Harbix 免費工具。",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
