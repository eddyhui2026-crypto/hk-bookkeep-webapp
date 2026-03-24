import type { Locale } from "@/lib/i18n/messages";

export const CURRENCIES = [
  "HKD",
  "CNY",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "SGD",
  "MOP",
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

/** Invoice 表單／DB 用，與快速記一筆 CURRENCIES 一致 */
export function normalizeInvoiceCurrency(input: unknown): CurrencyCode {
  const s = String(input ?? "").trim();
  return CURRENCIES.includes(s as CurrencyCode) ? (s as CurrencyCode) : "HKD";
}

/** 列表／列印：JPY 唔顯示小數 */
export function formatCurrencyAmount(
  n: number,
  currency: string,
  numLocale: string
): string {
  const jpy = currency === "JPY";
  return new Intl.NumberFormat(numLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: jpy ? 0 : 2,
    maximumFractionDigits: jpy ? 0 : 2,
  }).format(n);
}

type SeedDef = {
  slug: string;
  zh: string;
  en: string;
  color: string;
};

export type CategorySeedRow = { slug: string; name: string; color: string };

const DEFAULT_DEFS: readonly SeedDef[] = [
  {
    slug: "cat_def_operating_income",
    zh: "營業收入",
    en: "Operating income",
    color: "#14b8a6",
  },
  { slug: "cat_def_cogs", zh: "採購／成本", en: "Purchases / COGS", color: "#0d9488" },
  {
    slug: "cat_def_platform",
    zh: "平台／渠道費",
    en: "Platform / channel fees",
    color: "#8b5cf6",
  },
  {
    slug: "cat_def_ads",
    zh: "廣告與推廣",
    en: "Advertising & marketing",
    color: "#ec4899",
  },
  {
    slug: "cat_def_logistics",
    zh: "物流運費",
    en: "Shipping & logistics",
    color: "#f97316",
  },
  {
    slug: "cat_def_software",
    zh: "軟件訂閱",
    en: "Software subscriptions",
    color: "#3b82f6",
  },
  {
    slug: "cat_def_pro",
    zh: "專業服務",
    en: "Professional services",
    color: "#6366f1",
  },
  { slug: "cat_def_other", zh: "其他", en: "Other", color: "#94a3b8" },
];

const FREELANCE_DEFS: readonly SeedDef[] = [
  {
    slug: "cat_fl_project",
    zh: "項目／服務收入",
    en: "Project / service income",
    color: "#14b8a6",
  },
  { slug: "cat_fl_outsource", zh: "外包協作", en: "Subcontractors", color: "#6366f1" },
  {
    slug: "cat_fl_software",
    zh: "軟件與工具",
    en: "Software & tools",
    color: "#3b82f6",
  },
  { slug: "cat_fl_travel", zh: "交通通訊", en: "Travel & telecom", color: "#f59e0b" },
  { slug: "cat_fl_training", zh: "專業進修", en: "Training & CPD", color: "#8b5cf6" },
  { slug: "cat_fl_office", zh: "辦公耗材", en: "Office supplies", color: "#64748b" },
  { slug: "cat_fl_marketing", zh: "市場推廣", en: "Marketing", color: "#ec4899" },
  { slug: "cat_fl_other", zh: "其他", en: "Other", color: "#94a3b8" },
];

const SHOP_DEFS: readonly SeedDef[] = [
  { slug: "cat_sh_platform", zh: "平台佣金", en: "Marketplace fees", color: "#8b5cf6" },
  { slug: "cat_sh_ads", zh: "廣告費", en: "Advertising", color: "#ec4899" },
  {
    slug: "cat_sh_ship",
    zh: "包裝運費",
    en: "Packaging & shipping",
    color: "#f97316",
  },
  { slug: "cat_sh_product", zh: "貨物成本", en: "Product cost", color: "#14b8a6" },
  {
    slug: "cat_sh_inventory",
    zh: "倉存／進貨",
    en: "Inventory / stock-in",
    color: "#0d9488",
  },
  {
    slug: "cat_sh_packmat",
    zh: "包裝物料",
    en: "Packaging materials",
    color: "#a855f7",
  },
  {
    slug: "cat_sh_software",
    zh: "軟件訂閱",
    en: "Software subscriptions",
    color: "#3b82f6",
  },
  { slug: "cat_sh_other", zh: "其他", en: "Other", color: "#94a3b8" },
];

function seedRowsFromDefs(
  defs: readonly SeedDef[],
  locale: Locale
): CategorySeedRow[] {
  const en = locale === "en";
  return defs.map((d) => ({
    slug: d.slug,
    name: en ? d.en : d.zh,
    color: d.color,
  }));
}

export function categorySeedRowsForNewLedger(
  template: "freelance" | "shop" | undefined,
  locale: Locale
): CategorySeedRow[] {
  if (template === "freelance") return seedRowsFromDefs(FREELANCE_DEFS, locale);
  if (template === "shop") return seedRowsFromDefs(SHOP_DEFS, locale);
  return seedRowsFromDefs(DEFAULT_DEFS, locale);
}

export const LEDGER_MAX = 10;
/** 每本生意簿分類總數上限（含建立時預設種子） */
export const CATEGORY_MAX_PER_LEDGER = 30;
export const RECEIPT_MAX_BYTES = 600 * 1024; // ~600KB server cap after client target 500KB
export const TRIAL_DAYS = 14;
