/** Resolve category label for current UI language when `slug` is set (seeded defaults). */
export function categoryLabel(
  t: (key: string) => string,
  row: { name: string; slug: string | null }
): string {
  if (!row.slug) return row.name;
  const key = `catalog.${row.slug}`;
  const s = t(key);
  return s !== key ? s : row.name;
}
