/** 由 /app?prefillIncome=1&… 帶入「快速記一筆」收入欄 */

import {
  defaultCurrencyForMarket,
  normalizeInvoiceCurrency,
  type CurrencyCode,
} from "@/lib/constants";
import { getMarketFromEnv } from "@/lib/market";

export type QuickAddIncomePrefill = {
  amount: string;
  currency: CurrencyCode;
  note: string;
  txDate: string;
} | null;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseQuickAddIncomePrefill(
  sp: Record<string, string | string[] | undefined>
): QuickAddIncomePrefill {
  const flag = first(sp.prefillIncome);
  if (flag !== "1" && flag !== "true") return null;

  const amount = (first(sp.prefillAmount) ?? "").trim();
  const currency = normalizeInvoiceCurrency(
    first(sp.prefillCurrency),
    defaultCurrencyForMarket(getMarketFromEnv())
  );
  const note = first(sp.prefillNote) ?? "";
  const d = (first(sp.prefillDate) ?? "").trim();
  const txDate = /^\d{4}-\d{2}-\d{2}$/.test(d)
    ? d
    : new Date().toISOString().slice(0, 10);

  return { amount, currency, note, txDate };
}
