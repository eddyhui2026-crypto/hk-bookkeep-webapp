import type { Market } from "@/lib/market";

/** 香港兩級利得稅（示範） */
export function estimateHkProfitsTax(profit: number): { tax: number; effPct: number } | null {
  if (!Number.isFinite(profit) || profit <= 0) return null;
  const first = Math.min(profit, 2_000_000);
  const rest = Math.max(profit - 2_000_000, 0);
  const tax = first * 0.0825 + rest * 0.165;
  return { tax, effPct: profit > 0 ? (tax / profit) * 100 : 0 };
}

/**
 * 台灣：營利事業所得稅單一稅率示範（僅教學用）。
 * 獨資／執行業務多數適用綜合所得稅，唔在此公式涵蓋。
 */
export function estimateTwCorporateTaxSimplified(profit: number): { tax: number; effPct: number } | null {
  if (!Number.isFinite(profit) || profit <= 0) return null;
  const rate = 0.2;
  const tax = profit * rate;
  return { tax, effPct: rate * 100 };
}

/** 星洲： chargeable income → IRAS Partial Tax Exemption (YA 2020+) 後 × 17%（示範；唔計每年 rebate） */
export function sgTaxableAfterPartialExemption(chargeable: number): number {
  if (chargeable <= 0) return 0;
  if (chargeable <= 200_000) {
    const exempt =
      Math.min(chargeable, 10_000) * 0.75 + Math.min(Math.max(chargeable - 10_000, 0), 190_000) * 0.5;
    return chargeable - exempt;
  }
  return 97_500 + (chargeable - 200_000);
}

export function estimateSgCorporateTaxSimplified(profit: number): { tax: number; effPct: number } | null {
  if (!Number.isFinite(profit) || profit <= 0) return null;
  const taxable = sgTaxableAfterPartialExemption(profit);
  const tax = taxable * 0.17;
  return { tax, effPct: profit > 0 ? (tax / profit) * 100 : 0 };
}

export function estimateProfitsTaxDemo(
  market: Market,
  amount: number
): { tax: number; effPct: number } | null {
  switch (market) {
    case "hk":
      return estimateHkProfitsTax(amount);
    case "tw":
      return estimateTwCorporateTaxSimplified(amount);
    case "sg":
      return estimateSgCorporateTaxSimplified(amount);
    default:
      return estimateHkProfitsTax(amount);
  }
}
