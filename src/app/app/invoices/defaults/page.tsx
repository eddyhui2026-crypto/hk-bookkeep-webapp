import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDefaultsForm } from "@/components/invoice/InvoiceDefaultsForm";
import { CURRENCIES, type CurrencyCode } from "@/lib/constants";
import {
  invoicePaymentMethodsForMarket,
  type InvoicePaymentMethodKey,
} from "@/lib/invoice-payment";
import type { InvoiceDefaultsEditorValues } from "@/lib/invoice-types";

import type { Market } from "@/lib/market";
import { getMarket } from "@/lib/market-server";

export const dynamic = "force-dynamic";

function mapPrefs(
  row: Record<string, string | null | undefined>,
  market: Market
): InvoiceDefaultsEditorValues {
  const pm = row.default_payment_method?.trim() ?? "";
  const allowed = new Set(invoicePaymentMethodsForMarket(market));
  const payOk: "" | InvoicePaymentMethodKey =
    pm !== "" && allowed.has(pm as InvoicePaymentMethodKey)
      ? (pm as InvoicePaymentMethodKey)
      : "";
  const cur = row.default_currency;
  const curOk =
    cur && (CURRENCIES as readonly string[]).includes(cur) ? (cur as CurrencyCode) : "";

  return {
    company_name: row.default_company_name?.trim() ?? "",
    company_reg_no: row.default_company_reg_no?.trim() ?? "",
    client_name: row.default_client_name?.trim() ?? "",
    client_tax_id: row.default_client_tax_id?.trim() ?? "",
    invoice_number: row.default_invoice_number?.trim() ?? "",
    currency: curOk,
    payment_method: payOk,
    payment_details: row.default_payment_details?.trim() ?? "",
    description: row.default_description?.trim() ?? "",
    notes: row.default_notes?.trim() ?? "",
  };
}

export default async function InvoiceDefaultsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/invoices/defaults");

  const market = await getMarket();

  const { data: prefs } = await supabase
    .from("user_invoice_prefs")
    .select(
      "default_company_name, default_company_reg_no, default_client_name, default_client_tax_id, default_invoice_number, default_currency, default_payment_method, default_payment_details, default_description, default_notes"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const initial = mapPrefs(prefs ?? {}, market);

  return <InvoiceDefaultsForm initial={initial} />;
}
