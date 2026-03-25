import type { Metadata } from "next";
import { ArticlesIndexClient } from "@/components/articles/ArticlesIndexClient";
import { getAllArticlesMeta } from "@/lib/articles/load";
import { getSiteName } from "@/lib/market";
import { getMarket } from "@/lib/market-server";

export async function generateMetadata(): Promise<Metadata> {
  const market = await getMarket();
  const site = getSiteName(market);
  return {
    title: "文章",
    description: `記帳、freelance、網店相關心得 — ${site}（一般資訊，非專業意見）。`,
  };
}

export default async function ArticlesIndexPage() {
  const market = await getMarket();
  const articles = getAllArticlesMeta(market);
  return <ArticlesIndexClient articles={articles} />;
}
