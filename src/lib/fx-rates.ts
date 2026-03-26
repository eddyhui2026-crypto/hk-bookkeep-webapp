import { CURRENCIES, type CurrencyCode } from "@/lib/constants";
import type { Market } from "@/lib/market";
import { defaultCurrencyForMarket } from "@/lib/constants";

/**
 * 內建參考：1 單位外幣 → 折合幾多「本籍幣」（約數，非即時市價）
 */
export const DEFAULT_FX_TO_ANCHOR: Partial<
  Record<CurrencyCode, Partial<Record<CurrencyCode, number>>>
> = {
  HKD: {
    HKD: 1,
    USD: 7.79,
    CNY: 1.09,
    EUR: 8.35,
    GBP: 10.05,
    JPY: 0.051,
    SGD: 5.82,
    MOP: 0.97,
    TWD: 0.24,
    MYR: 1.68,
  },
  SGD: {
    SGD: 1,
    USD: 1.35,
    EUR: 1.46,
    GBP: 1.71,
    CNY: 0.186,
    JPY: 0.00875,
    HKD: 0.172,
    MYR: 0.304,
    TWD: 0.041,
    MOP: 0.212,
  },
  TWD: {
    TWD: 1,
    USD: 31.8,
    HKD: 4.08,
    JPY: 0.211,
    EUR: 34.5,
    GBP: 40.2,
    CNY: 4.42,
    SGD: 23.6,
    MYR: 7.25,
    MOP: 3.95,
  },
};

function parsePositive(n: unknown): number | null {
  const v =
    typeof n === "number"
      ? n
      : typeof n === "string"
        ? Number.parseFloat(n)
        : NaN;
  if (!Number.isFinite(v) || v <= 0) return null;
  return v;
}

export function anchorForMarket(market: Market): CurrencyCode {
  return defaultCurrencyForMarket(market);
}

/** @deprecated 用 mergeFxRatesForAnchor(anchor, stored) */
export function mergeFxRatesToHkd(stored: unknown): Record<CurrencyCode, number> {
  return mergeFxRatesForAnchor("HKD", stored);
}

export function mergeFxRatesForAnchor(
  anchor: CurrencyCode,
  stored: unknown
): Record<CurrencyCode, number> {
  const baseDefaults =
    (DEFAULT_FX_TO_ANCHOR[anchor] ??
      DEFAULT_FX_TO_ANCHOR.HKD) as Partial<Record<CurrencyCode, number>>;
  const out = { ...baseDefaults } as Record<CurrencyCode, number>;
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return out;
  const o = stored as Record<string, unknown>;
  for (const c of CURRENCIES) {
    if (c === anchor) continue;
    const parsed = parsePositive(o[c]);
    if (parsed !== null) out[c] = parsed;
  }
  return out;
}

export function rateToAnchor(
  currency: string,
  merged: Record<string, number>,
  anchor: CurrencyCode
): number {
  if (currency === anchor) return 1;
  const r = merged[currency];
  if (typeof r === "number" && Number.isFinite(r) && r > 0) return r;
  const d = DEFAULT_FX_TO_ANCHOR[anchor]?.[currency as CurrencyCode];
  return typeof d === "number" && d > 0 ? d : 1;
}

export function convertChartTxsToAnchor<
  T extends { amount: number; currency: string },
>(txs: T[], merged: Record<string, number>, anchor: CurrencyCode): T[] {
  return txs.map((t) => ({
    ...t,
    amount: Number(t.amount) * rateToAnchor(t.currency, merged, anchor),
    currency: anchor,
  }));
}

/** @deprecated 用 convertChartTxsToAnchor(..., anchor) */
export function convertChartTxsToHkd<
  T extends { amount: number; currency: string },
>(txs: T[], merged: Record<string, number>): T[] {
  return convertChartTxsToAnchor(txs, merged, "HKD");
}

const RATE_MIN = 1e-6;
const RATE_MAX = 5000;

export function sanitizeFxPatch(
  patch: Record<string, unknown>,
  anchor: CurrencyCode = "HKD"
): Partial<Record<CurrencyCode, number>> {
  const out: Partial<Record<CurrencyCode, number>> = {};
  for (const c of CURRENCIES) {
    if (c === anchor) continue;
    if (!(c in patch)) continue;
    const v = parsePositive(patch[c]);
    if (v === null) continue;
    if (v < RATE_MIN || v > RATE_MAX) continue;
    out[c] = v;
  }
  return out;
}
