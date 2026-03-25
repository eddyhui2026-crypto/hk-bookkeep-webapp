import type { Market } from "@/lib/market";

const MPF_SLUG = "cat_fl_mpf";

export type CategoryPickRow = {
  id: string;
  name: string;
  color: string;
  slug: string | null;
};

/** 強積金僅香港；若現有分錄已用 MPF，仍保留喺清單以便辨識／修改 */
export function categoriesForMarketSelect(
  categories: CategoryPickRow[],
  market: Market,
  selectedCategoryId: string | null | undefined
): CategoryPickRow[] {
  if (market === "hk") return categories;
  const sel = categories.find((c) => c.id === selectedCategoryId);
  if (sel?.slug === MPF_SLUG) return categories;
  return categories.filter((c) => c.slug !== MPF_SLUG);
}
