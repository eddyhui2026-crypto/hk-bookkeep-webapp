import type { ArticleListItem } from "./types";

export function parseYamlFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  if (!raw.startsWith("---")) {
    return { meta: {}, body: raw };
  }
  const nl = raw.indexOf("\n");
  if (nl === -1) return { meta: {}, body: raw };
  const rest = raw.slice(nl + 1);
  const end = rest.indexOf("\n---");
  if (end === -1) return { meta: {}, body: raw };
  const fmBlock = rest.slice(0, end).trim();
  const body = rest.slice(end + 4).replace(/^\s*\n/, "");
  return { meta: parseYamlLines(fmBlock), body };
}

function parseYamlLines(yaml: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of yaml.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function normalizeDate(value: string, ctx: string): string {
  const d = new Date(value.trim());
  if (Number.isNaN(d.getTime())) {
    throw new Error(`${ctx}: invalid date "${value}"`);
  }
  return d.toISOString().slice(0, 10);
}

export function metaToListItem(
  slug: string,
  meta: Record<string, string>,
  body: string
): ArticleListItem {
  const title = meta.title?.trim();
  const description = meta.description?.trim();
  const dateRaw = meta.date?.trim();
  if (!title) throw new Error(`Article "${slug}": missing title in frontmatter`);
  if (!description)
    throw new Error(`Article "${slug}": missing description in frontmatter`);
  if (!dateRaw) throw new Error(`Article "${slug}": missing date in frontmatter`);
  if (!body.trim()) throw new Error(`Article "${slug}": empty body`);

  const datePublished = normalizeDate(dateRaw, `Article "${slug}"`);
  let dateModified: string | undefined;
  if (meta.modified?.trim()) {
    dateModified = normalizeDate(meta.modified.trim(), `Article "${slug}" modified`);
  }

  return {
    slug,
    title,
    description,
    datePublished,
    dateModified,
  };
}
