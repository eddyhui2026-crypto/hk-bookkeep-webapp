import type { CurrencyCode } from "@/lib/constants";

/** 由 user_invoice_prefs 讀出，用於「新增 Invoice」表單（幣種／付款方式必有值） */
export type InvoiceNewFormDefaults = {
  company_name: string;
  client_name: string;
  invoice_number: string;
  currency: CurrencyCode;
  payment_method: "fps" | "bank_transfer" | "paypal";
  payment_details: string;
  description: string;
  notes: string;
};

/** 「Invoice 預設」編輯頁：幣種／付款方式可留空＝唔套用預設 */
export type InvoiceDefaultsEditorValues = {
  company_name: string;
  client_name: string;
  invoice_number: string;
  currency: "" | CurrencyCode;
  payment_method: "" | "fps" | "bank_transfer" | "paypal";
  payment_details: string;
  description: string;
  notes: string;
};

export type InvoiceRow = {
  id: string;
  user_id: string;
  invoice_number: string;
  company_name: string | null;
  invoice_date: string;
  client_name: string;
  description: string;
  amount: number;
  currency: string;
  payment_method: "fps" | "bank_transfer" | "paypal" | string;
  payment_details: string | null;
  notes: string | null;
  created_at: string;
};
