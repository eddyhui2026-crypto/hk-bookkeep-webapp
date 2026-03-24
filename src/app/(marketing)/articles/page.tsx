import type { Metadata } from "next";
import { ArticlesIndexClient } from "@/components/articles/ArticlesIndexClient";
import { getAllArticlesMeta } from "@/lib/articles/load";

export const metadata: Metadata = {
  title: "文章",
  description:
    "記帳、freelance、網店相關心得與實用貼士 — Harbix 香港記帳（一般資訊，非專業意見）。",
};

export default function ArticlesIndexPage() {
  const articles = getAllArticlesMeta();
  return <ArticlesIndexClient articles={articles} />;
}
