import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { Market } from "@/lib/market";
import { getMarketFromEnv } from "@/lib/market";
import { metaToListItem, parseYamlFrontmatter } from "./parse";
import type { ArticleDetail, ArticleListItem } from "./types";

const ARTICLES_ROOT = path.join(process.cwd(), "content", "articles");

function articlesDirForMarket(market: Market): string {
  return path.join(ARTICLES_ROOT, market);
}

function listMarkdownFilesInDir(dir: string): string[] {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && !f.startsWith("."));
  } catch {
    return [];
  }
}

export function getAllArticlesMeta(market: Market): ArticleListItem[] {
  const dir = articlesDirForMarket(market);
  const items: ArticleListItem[] = [];
  for (const file of listMarkdownFilesInDir(dir)) {
    const slug = file.replace(/\.md$/i, "");
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, "utf8");
    const { meta, body } = parseYamlFrontmatter(raw);
    items.push(metaToListItem(slug, meta, body));
  }
  items.sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1));
  return items;
}

export function getArticleSlugs(market: Market): string[] {
  return getAllArticlesMeta(market).map((a) => a.slug);
}

export function getArticleBySlug(market: Market, slug: string): ArticleDetail | null {
  const filePath = path.join(articlesDirForMarket(market), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { meta, body } = parseYamlFrontmatter(raw);
  const base = metaToListItem(slug, meta, body);
  const bodyHtml = marked.parse(body, { async: false }) as string;
  return { ...base, bodyHtml };
}

/** `generateStaticParams` 等 build-only 場景 */
export function getArticleSlugsForBuild(): string[] {
  return getArticleSlugs(getMarketFromEnv());
}
