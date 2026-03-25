import type { Metadata } from "next";
import { ToolsIndexClient } from "@/components/ToolsIndexClient";
import { getMarket } from "@/lib/market-server";
import { getMarketingToolPageMetadata } from "@/lib/market-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const market = await getMarket();
  return getMarketingToolPageMetadata(market, "tools-index");
}

export default function ToolsIndexPage() {
  return <ToolsIndexClient />;
}
