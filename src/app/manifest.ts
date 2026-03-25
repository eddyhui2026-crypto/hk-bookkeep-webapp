import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getMarketingMetadata } from "@/lib/market-metadata";
import { getMarketFromEnv, getSiteName, marketFromHost } from "@/lib/market";

/** 按安裝來源域名（hk／sg／tw）決定 PWA 顯示名稱 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const market = marketFromHost(host) ?? getMarketFromEnv();
  const meta = getMarketingMetadata(market);
  const title =
    typeof meta.title === "string" ? meta.title : getSiteName(market);
  const description =
    typeof meta.description === "string" ? meta.description : "";

  return {
    name: title,
    short_name: getSiteName(market),
    description,
    start_url: "/app",
    display: "standalone",
    background_color: "#faf5ff",
    theme_color: "#9333ea",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
