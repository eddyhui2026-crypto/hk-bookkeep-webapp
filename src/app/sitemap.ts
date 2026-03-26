import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getAllArticlesMeta } from "@/lib/articles/load";
import { getMarketFromEnv, marketFromHost } from "@/lib/market";
import { getRequestSiteUrl } from "@/lib/request-site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const market = marketFromHost(host) ?? getMarketFromEnv();
  const base = await getRequestSiteUrl();

  const articles = getAllArticlesMeta(market);
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: new Date(a.dateModified ?? a.datePublished),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const last = new Date();

  return [
    { url: base, lastModified: last, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/articles`,
      lastModified: last,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    { url: `${base}/tools`, lastModified: last, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${base}/tools/profits-tax-estimator`,
      lastModified: last,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/tools/freelance-rate`,
      lastModified: last,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/tools/ad-spend-ratio`,
      lastModified: last,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    { url: `${base}/contact`, lastModified: last, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/terms`, lastModified: last, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/privacy`, lastModified: last, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/login`, lastModified: last, changeFrequency: "monthly", priority: 0.4 },
    ...articleEntries,
  ];
}
