export type Market = "hk" | "tw" | "sg";

const HOST_MARKERS: { substr: string; market: Market }[] = [
  { substr: "twbookkeep", market: "tw" },
  { substr: "sgbookkeep", market: "sg" },
  { substr: "hkbookkeep", market: "hk" },
];

export function marketFromHost(host: string): Market | null {
  const l = host.split(":")[0]?.toLowerCase() ?? "";
  for (const { substr, market } of HOST_MARKERS) {
    if (l.includes(substr)) return market;
  }
  return null;
}

/** Build-time / fallback when `headers()` 唔適用 */
export function getMarketFromEnv(): Market {
  const m = process.env.NEXT_PUBLIC_MARKET;
  if (m === "tw" || m === "sg" || m === "hk") return m;
  return "hk";
}

export function getSiteName(market: Market): string {
  switch (market) {
    case "tw":
      return "TWBookKeep";
    case "sg":
      return "SGBookKeep";
    default:
      return "HKBookkeep";
  }
}

/** 示意圖／說明用主機名（與 production 對齊） */
export function getMarketingHost(market: Market): string {
  switch (market) {
    case "tw":
      return "twbookkeep.harbix.app";
    case "sg":
      return "sgbookkeep.harbix.app";
    default:
      return "hkbookkeep.harbix.app";
  }
}

export function getPublicHtmlLang(market: Market, locale: "zh" | "en"): string {
  if (market === "tw") return "zh-TW";
  if (market === "sg") return locale === "en" ? "en" : "zh-CN";
  return locale === "en" ? "en" : "zh-HK";
}
