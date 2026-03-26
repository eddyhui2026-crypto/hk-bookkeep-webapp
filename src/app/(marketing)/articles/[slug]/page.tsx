import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailClient } from "@/components/articles/ArticleDetailClient";
import {
  getArticleBySlug,
  getArticleSlugsForBuild,
} from "@/lib/articles/load";
import { getSiteName } from "@/lib/market";
import { getMarket } from "@/lib/market-server";
import { getRequestSiteUrl } from "@/lib/request-site";

export function generateStaticParams() {
  return getArticleSlugsForBuild().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const market = await getMarket();
  const { slug } = await params;
  const article = getArticleBySlug(market, slug);
  if (!article) return { title: "文章" };

  const siteUrl = await getRequestSiteUrl();
  const url = `${siteUrl}/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url,
      publishedTime: `${article.datePublished}T00:00:00.000+08:00`,
      modifiedTime: article.dateModified
        ? `${article.dateModified}T00:00:00.000+08:00`
        : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const market = await getMarket();
  const site = getSiteName(market);
  const { slug } = await params;
  const article = getArticleBySlug(market, slug);
  if (!article) notFound();

  const siteUrl = await getRequestSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: `${article.datePublished}T00:00:00.000+08:00`,
    dateModified: `${(article.dateModified ?? article.datePublished)}T00:00:00.000+08:00`,
    author: {
      "@type": "Organization",
      name: site,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: site,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/articles/${article.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailClient article={article} />
    </>
  );
}
