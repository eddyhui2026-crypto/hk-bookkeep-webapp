"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Market } from "@/lib/market";

const MarketContext = createContext<Market>("hk");

export function MarketProvider({
  market,
  children,
}: {
  market: Market;
  children: ReactNode;
}) {
  return (
    <MarketContext.Provider value={market}>{children}</MarketContext.Provider>
  );
}

export function useMarket(): Market {
  return useContext(MarketContext);
}
