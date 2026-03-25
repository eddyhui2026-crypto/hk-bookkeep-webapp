import type { Metadata } from "next";
import { ToolsIndexClient } from "@/components/ToolsIndexClient";

export const metadata: Metadata = {
  title: "免費工具",
  description: "利得稅粗估、Freelancer 時薪倒算、網店廣告占比 — HKBookkeep",
};

export default function ToolsIndexPage() {
  return <ToolsIndexClient />;
}
