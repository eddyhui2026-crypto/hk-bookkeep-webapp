import type { Market } from "@/lib/market";

/** Locale tag for `Number.prototype.toLocaleString` from market + UI locale. */
export function displayNumberLocale(market: Market, locale: "zh" | "en"): string {
  if (market === "tw") return "zh-TW";
  if (market === "sg") return locale === "en" ? "en-SG" : "zh-CN";
  return locale === "en" ? "en-HK" : "zh-HK";
}
