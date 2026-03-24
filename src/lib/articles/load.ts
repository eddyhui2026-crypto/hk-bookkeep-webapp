import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { metaToListItem, parseYamlFrontmatter } from "./parse";
import type { ArticleDetail, ArticleListItem } from "./types";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function listMarkdownFiles(): string[] {
  try {
    return fs
      .readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith(".md") && !f.startsWith("."));
  } catch {
    return [];
  }
}

export function getAllArticlesMeta(): ArticleListItem[] {
  const items: ArticleListItem[] = [];
  for (const file of listMarkdownFiles()) {
    const slug = file.replace(/\.md$/i, "");
    const full = path.join(ARTICLES_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const { meta, body } = parseYamlFrontmatter(raw);
    items.push(metaToListItem(slug, meta, body));
  }
  items.sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1));
  return items;
}

export function getArticleSlugs(): string[] {
  return getAllArticlesMeta().map((a) => a.slug);
}

export function getArticleBySlug(slug: string): ArticleDetail | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { meta, body } = parseYamlFrontmatter(raw);
  const base = metaToListItem(slug, meta, body);
  const bodyHtml = marked.parse(body, { async: false }) as string;
  return { ...base, bodyHtml };
}
