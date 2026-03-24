import { CURRENCIES, type CurrencyCode } from "@/lib/constants";

/**
 * 內建參考：1 單位該幣 → 折合幾多 HKD（約數，非即時市價；可喺 UI 改）
 * JPY 為「每 1 日圓」折合 HKD（例如 0.051 即約 100円≈5.1 HKD）
 */
export const DEFAULT_FX_TO_HKD: Record<CurrencyCode, number> = {
  HKD: 1,
  USD: 7.79,
  CNY: 1.09,
  EUR: 8.35,
  GBP: 10.05,
  JPY: 0.051,
  SGD: 5.82,
  MOP: 0.97,
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

/** 合併 DB 覆寫與預設；只接受 CURRENCIES 內、且為正數 */
export function mergeFxRatesToHkd(stored: unknown): Record<CurrencyCode, number> {
  const out = { ...DEFAULT_FX_TO_HKD };
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return out;
  const o = stored as Record<string, unknown>;
  for (const c of CURRENCIES) {
    if (c === "HKD") continue;
    const parsed = parsePositive(o[c]);
    if (parsed !== null) out[c] = parsed;
  }
  return out;
}

export function rateToHkd(
  currency: string,
  merged: Record<string, number>
): number {
  if (currency === "HKD") return 1;
  const r = merged[currency];
  if (typeof r === "number" && Number.isFinite(r) && r > 0) return r;
  const d = DEFAULT_FX_TO_HKD[currency as CurrencyCode];
  return typeof d === "number" && d > 0 ? d : 1;
}

export function convertChartTxsToHkd<
  T extends { amount: number; currency: string },
>(txs: T[], merged: Record<string, number>): T[] {
  return txs.map((t) => ({
    ...t,
    amount: Number(t.amount) * rateToHkd(t.currency, merged),
    currency: "HKD",
  }));
}

const RATE_MIN = 1e-6;
const RATE_MAX = 5000;

export function sanitizeFxPatch(
  patch: Record<string, unknown>
): Partial<Record<CurrencyCode, number>> {
  const out: Partial<Record<CurrencyCode, number>> = {};
  for (const c of CURRENCIES) {
    if (c === "HKD") continue;
    if (!(c in patch)) continue;
    const v = parsePositive(patch[c]);
    if (v === null) continue;
    if (v < RATE_MIN || v > RATE_MAX) continue;
    out[c] = v;
  }
  return out;
}
