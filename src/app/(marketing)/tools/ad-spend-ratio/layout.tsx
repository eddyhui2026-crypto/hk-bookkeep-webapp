import type { Metadata } from "next";
import { getMarket } from "@/lib/market-server";
import { getMarketingToolPageMetadata } from "@/lib/market-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const market = await getMarket();
  return getMarketingToolPageMetadata(market, "ad-spend");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
