import type { Market } from "@/lib/market";

export const INVOICE_PAYMENT_METHOD_KEYS = [
  "fps",
  "bank_transfer",
  "paypal",
  "paynow",
  "bank_fast",
  "cheque",
  "linepay",
  "jkopay",
] as const;

export type InvoicePaymentMethodKey = (typeof INVOICE_PAYMENT_METHOD_KEYS)[number];

export function invoicePaymentMethodsForMarket(m: Market): InvoicePaymentMethodKey[] {
  switch (m) {
    case "sg":
      return ["paynow", "bank_fast", "bank_transfer", "paypal", "cheque"];
    case "tw":
      return ["linepay", "jkopay", "bank_transfer", "paypal"];
    default:
      return ["fps", "bank_transfer", "paypal"];
  }
}

export function defaultPaymentMethodForMarket(m: Market): InvoicePaymentMethodKey {
  switch (m) {
    case "sg":
      return "paynow";
    case "tw":
      return "linepay";
    default:
      return "fps";
  }
}

export function normalizeInvoicePaymentMethod(
  raw: string,
  market: Market
): InvoicePaymentMethodKey {
  const allowed = new Set(invoicePaymentMethodsForMarket(market));
  const s = raw.trim();
  if (allowed.has(s as InvoicePaymentMethodKey)) return s as InvoicePaymentMethodKey;
  return defaultPaymentMethodForMarket(market);
}
