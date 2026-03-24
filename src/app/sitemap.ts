import type { MetadataRoute } from "next";
import { getAllArticlesMeta } from "@/lib/articles/load";
import { SITE_URL } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticlesMeta();
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.dateModified ?? a.datePublished),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const last = new Date();

  return [
    { url: SITE_URL, lastModified: last, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/articles`,
      lastModified: last,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    { url: `${SITE_URL}/tools`, lastModified: last, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${SITE_URL}/tools/profits-tax-estimator`,
      lastModified: last,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/tools/freelance-rate`,
      lastModified: last,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/tools/ad-spend-ratio`,
      lastModified: last,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    { url: `${SITE_URL}/contact`, lastModified: last, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: last, changeFrequency: "yearly", priority: 0.35 },
    { url: `${SITE_URL}/privacy`, lastModified: last, changeFrequency: "yearly", priority: 0.35 },
    { url: `${SITE_URL}/login`, lastModified: last, changeFrequency: "monthly", priority: 0.4 },
    ...articleEntries,
  ];
}
