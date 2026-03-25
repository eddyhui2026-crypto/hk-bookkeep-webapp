import { headers } from "next/headers";
import { getMarketFromEnv, marketFromHost, type Market } from "@/lib/market";

/** Server：Host 優先，其次 `NEXT_PUBLIC_MARKET` */
export async function getMarket(): Promise<Market> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
    return marketFromHost(host) ?? getMarketFromEnv();
  } catch {
    return getMarketFromEnv();
  }
}
