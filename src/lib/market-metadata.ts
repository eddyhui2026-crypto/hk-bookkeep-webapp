import type { Metadata } from "next";
import type { Market } from "./market";
import { getSiteName } from "./market";

export function getMarketingMetadata(market: Market): Pick<
  Metadata,
  "title" | "description" | "appleWebApp"
> {
  const site = getSiteName(market);
  switch (market) {
    case "tw":
      return {
        title: `${site} — 台灣記帳 · 接案與小商家`,
        description:
          "NT$150／月、年繳 NT$1,500、14 日免費試用。多本生意簿、手機拍收據、簡易 Invoice、CSV／報表。年付約省近 2 個月月費。",
        appleWebApp: { capable: true, title: site, statusBarStyle: "default" },
      };
    case "sg":
      return {
        title: `${site} — Singapore bookkeeping`,
        description:
          "SGD 6.50/mo, SGD 65/year, 14-day free trial. Ledgers, receipts, simple invoices, CSV & reports. Annual plan ≈ two months free vs monthly.",
        appleWebApp: { capable: true, title: site, statusBarStyle: "default" },
      };
    default:
      return {
        title: "HKBookkeep — 香港記帳 · 多生意簿、專為 freelancer／網店",
        description:
          "HK$38／月、年付 HK$380（年付約慳近 2 個月月費）、14 日免費試用。多本生意簿、手機影收據即記、簡易 Invoice 列印／PDF、CSV／報表匯出。",
        appleWebApp: { capable: true, title: "HKBookkeep", statusBarStyle: "default" },
      };
  }
}

export type MarketingToolPageSlug =
  | "tools-index"
  | "profits-tax"
  | "freelance-rate"
  | "ad-spend";

export function getMarketingToolPageMetadata(
  market: Market,
  slug: MarketingToolPageSlug
): Metadata {
  const site = getSiteName(market);

  if (slug === "tools-index") {
    if (market === "tw") {
      return {
        title: "免費工具",
        description: `營所稅示範、接案時薪、廣告占比 — ${site}。`,
      };
    }
    if (market === "sg") {
      return {
        title: "Free tools",
        description: `Tax demos, freelance rate, ad spend ratio — ${site}.`,
      };
    }
    return {
      title: "免費工具",
      description: `利得稅粗估、Freelancer 時薪倒算、網店廣告占比 — ${site}。`,
    };
  }

  if (slug === "profits-tax") {
    if (market === "tw") {
      return {
        title: "營所稅試算（示範）",
        description: `台灣營利事業所得稅單一稅率示範（非稅務意見）。${site} 免費工具。`,
      };
    }
    if (market === "sg") {
      return {
        title: "Corporate tax demo",
        description: `Singapore chargeable income, partial exemption, 17% headline (demo, not tax advice). Free ${site} tool.`,
      };
    }
    return {
      title: "利得稅粗估",
      description: `香港兩級利得稅粗略估算（非稅務意見）。${site} 免費工具。`,
    };
  }

  if (slug === "freelance-rate") {
    if (market === "tw") {
      return {
        title: "接案時薪試算",
        description: `按目標月入與工時估算需達時薪（示範）。${site} 免費工具。`,
      };
    }
    if (market === "sg") {
      return {
        title: "Freelance rate calculator",
        description: `Back-calculate hourly rate from target income and billable hours. Free ${site} tool.`,
      };
    }
    return {
      title: "Freelancer 時薪倒算",
      description: `按目標月入與工時估算需達時薪。${site} 免費工具。`,
    };
  }

  // ad-spend
  if (market === "tw") {
    return {
      title: "廣告占比試算",
      description: `廣告費占營業額試算（非經營建議）。${site} 免費工具。`,
    };
  }
  if (market === "sg") {
    return {
      title: "Ad spend ratio",
      description: `Ad spend as % of revenue (illustration only). Free ${site} tool.`,
    };
  }
  return {
    title: "網店廣告占比",
    description: `廣告費占營業額試算（非經營建議）。${site} 免費工具。`,
  };
}
