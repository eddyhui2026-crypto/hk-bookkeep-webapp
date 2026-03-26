import type { Locale } from "@/lib/i18n/messages";
import type { Market } from "@/lib/market";

export const CURRENCIES = [
  "HKD",
  "CNY",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "SGD",
  "MOP",
  "TWD",
  "MYR",
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export function defaultCurrencyForMarket(m: Market): CurrencyCode {
  if (m === "tw") return "TWD";
  if (m === "sg") return "SGD";
  return "HKD";
}

/** 本土幣置頂，其餘按該市場較常見次序，最尾為較少用地區場景嘅幣種 */
export function currenciesOrderedForMarket(m: Market): CurrencyCode[] {
  const prioritize = (order: CurrencyCode[]): CurrencyCode[] => {
    const set = new Set(order);
    const rest = CURRENCIES.filter((c) => !set.has(c));
    return [...order, ...rest];
  };
  switch (m) {
    case "tw":
      return prioritize([
        "TWD",
        "USD",
        "JPY",
        "HKD",
        "CNY",
        "EUR",
        "SGD",
        "GBP",
        "MYR",
        "MOP",
      ]);
    case "sg":
      return prioritize([
        "SGD",
        "USD",
        "MYR",
        "HKD",
        "CNY",
        "EUR",
        "GBP",
        "JPY",
        "TWD",
        "MOP",
      ]);
    default:
      return prioritize([
        "HKD",
        "CNY",
        "USD",
        "MOP",
        "EUR",
        "SGD",
        "MYR",
        "GBP",
        "JPY",
        "TWD",
      ]);
  }
}

/** Invoice 表單／DB 用，與快速記一筆 CURRENCIES 一致 */
export function normalizeInvoiceCurrency(
  input: unknown,
  fallback: CurrencyCode = "HKD"
): CurrencyCode {
  const s = String(input ?? "").trim();
  return CURRENCIES.includes(s as CurrencyCode)
    ? (s as CurrencyCode)
    : fallback;
}

/** 列表／列印：JPY／TWD 唔強制顯示小數 */
export function formatCurrencyAmount(
  n: number,
  currency: string,
  numLocale: string
): string {
  const intMinor = currency === "JPY" || currency === "TWD";
  return new Intl.NumberFormat(numLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: intMinor ? 0 : 2,
    maximumFractionDigits: intMinor ? 0 : 2,
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
  {
    slug: "cat_fl_home_office",
    zh: "居家辦公（水電煤寬頻比例）",
    en: "Home office (utilities & broadband share)",
    color: "#78716c",
  },
  {
    slug: "cat_fl_mpf",
    zh: "強積金（MPF／自僱強制供款）",
    en: "MPF (mandatory self-employed contributions)",
    color: "#059669",
  },
  { slug: "cat_fl_marketing", zh: "市場推廣", en: "Marketing", color: "#ec4899" },
  {
    slug: "cat_fl_entertainment",
    zh: "應酬／送禮（客戶／夥伴）",
    en: "Entertainment & gifts (clients & partners)",
    color: "#d946ef",
  },
  {
    slug: "cat_fl_tax_provision",
    zh: "稅款預留（提醒／撥備）",
    en: "Tax provision (reminder / set-aside)",
    color: "#b45309",
  },
  { slug: "cat_fl_other", zh: "其他", en: "Other", color: "#94a3b8" },
];

const SHOP_DEFS: readonly SeedDef[] = [
  { slug: "cat_sh_platform", zh: "平台佣金", en: "Marketplace fees", color: "#8b5cf6" },
  {
    slug: "cat_sh_tx_fees",
    zh: "支付手續費（Stripe／PayPal／PayMe 等）",
    en: "Payment fees (Stripe, PayPal, PayMe, etc.)",
    color: "#7c3aed",
  },
  {
    slug: "cat_sh_refunds",
    zh: "退款／退貨",
    en: "Refunds & returns",
    color: "#ef4444",
  },
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
    slug: "cat_sh_samples",
    zh: "樣品／損耗（推廣／KOL）",
    en: "Samples & spoilage (promo / KOL)",
    color: "#c026d3",
  },
  {
    slug: "cat_sh_software",
    zh: "軟件訂閱",
    en: "Software subscriptions",
    color: "#3b82f6",
  },
  { slug: "cat_sh_other", zh: "其他", en: "Other", color: "#94a3b8" },
];

/** 新建生意簿分類種子：sg + zh 介面用簡體預設名（與香港繁體稿對照） */
const SG_ZH_BY_SLUG: Record<string, string> = {
  cat_def_operating_income: "营业收入",
  cat_def_cogs: "采购／成本",
  cat_def_platform: "平台／渠道费",
  cat_def_ads: "广告与推广",
  cat_def_logistics: "物流运费",
  cat_def_software: "软件订阅",
  cat_def_pro: "专业服务",
  cat_def_other: "其他",
  cat_fl_project: "项目／服务收入",
  cat_fl_outsource: "外包协作",
  cat_fl_software: "软件与工具",
  cat_fl_travel: "交通通讯",
  cat_fl_training: "专业进修",
  cat_fl_office: "办公耗材",
  cat_fl_home_office: "居家办公（水电煤宽带比例）",
  cat_fl_mpf: "强积金（MPF／自雇强制供款）",
  cat_fl_marketing: "市场推广",
  cat_fl_entertainment: "应酬／送礼（客户／伙伴）",
  cat_fl_tax_provision: "税款预留（提醒／拨备）",
  cat_fl_other: "其他",
  cat_sh_platform: "平台佣金",
  cat_sh_tx_fees: "支付手续费（Stripe／PayPal／PayNow 等）",
  cat_sh_refunds: "退款／退货",
  cat_sh_ads: "广告费",
  cat_sh_ship: "包装运费",
  cat_sh_product: "货物成本",
  cat_sh_inventory: "仓存／进货",
  cat_sh_packmat: "包装物料",
  cat_sh_samples: "样品／损耗（推广／KOL）",
  cat_sh_software: "软件订阅",
  cat_sh_other: "其他",
};

const TW_ZH_PATCH: Record<string, string> = {
  cat_sh_tx_fees: "支付手續費（Stripe／PayPal／LINE Pay 等）",
};

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

function applyMarketZhSeedNames(
  rows: CategorySeedRow[],
  locale: Locale,
  market: Market
): CategorySeedRow[] {
  if (locale !== "zh") return rows;
  if (market === "tw") {
    return rows.map((r) => ({
      ...r,
      name: TW_ZH_PATCH[r.slug] ?? r.name,
    }));
  }
  if (market === "sg") {
    return rows.map((r) => ({
      ...r,
      name: SG_ZH_BY_SLUG[r.slug] ?? r.name,
    }));
  }
  return rows;
}

export function categorySeedRowsForNewLedger(
  template: "freelance" | "shop" | undefined,
  locale: Locale,
  market: Market
): CategorySeedRow[] {
  let rows: CategorySeedRow[];
  if (template === "freelance") {
    const defs =
      market === "hk"
        ? FREELANCE_DEFS
        : FREELANCE_DEFS.filter((d) => d.slug !== "cat_fl_mpf");
    rows = seedRowsFromDefs(defs, locale);
  } else if (template === "shop") {
    rows = seedRowsFromDefs(SHOP_DEFS, locale);
  } else {
    rows = seedRowsFromDefs(DEFAULT_DEFS, locale);
  }
  return applyMarketZhSeedNames(rows, locale, market);
}

export const LEDGER_MAX = 10;
/** 每本生意簿分類總數上限（含建立時預設種子） */
export const CATEGORY_MAX_PER_LEDGER = 30;
export const RECEIPT_MAX_BYTES = 600 * 1024; // ~600KB server cap after client target 500KB

/** 浮動「影收據」隊列上限（出街連拍多張，記憶體與 UX 平衡） */
export const RECEIPT_SNAP_QUEUE_MAX = 24;

/** 一鍵 ZIP：最多收據檔數（配合 serverless timeout） */
export const RECEIPT_ZIP_MAX_FILES = 200;
/** 一鍵 ZIP：源流（未壓縮）總量上限（bytes） */
export const RECEIPT_ZIP_MAX_BYTES_UNCOMPRESSED = 80 * 1024 * 1024;
export const TRIAL_DAYS = 14;
