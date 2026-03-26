import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceFormClient } from "@/components/invoice/InvoiceFormClient";
import {
  defaultCurrencyForMarket,
  normalizeInvoiceCurrency,
} from "@/lib/constants";
import {
  defaultPaymentMethodForMarket,
  normalizeInvoicePaymentMethod,
} from "@/lib/invoice-payment";
import { getMarket } from "@/lib/market-server";
import type { Market } from "@/lib/market";
import type { InvoiceNewFormDefaults } from "@/lib/invoice-types";

export const dynamic = "force-dynamic";

function mapNewInvoiceDefaults(
  row: Record<string, string | null | undefined> | null,
  market: Market
): InvoiceNewFormDefaults {
  const pmRaw = row?.default_payment_method?.trim() ?? "";
  const payment_method =
    pmRaw === ""
      ? defaultPaymentMethodForMarket(market)
      : normalizeInvoicePaymentMethod(pmRaw, market);
  const currency = normalizeInvoiceCurrency(
    row?.default_currency,
    defaultCurrencyForMarket(market)
  );

  return {
    company_name: row?.default_company_name?.trim() ?? "",
    company_reg_no: row?.default_company_reg_no?.trim() ?? "",
    client_name: row?.default_client_name?.trim() ?? "",
    client_tax_id: row?.default_client_tax_id?.trim() ?? "",
    invoice_number: row?.default_invoice_number?.trim() ?? "",
    currency,
    payment_method,
    payment_details: row?.default_payment_details?.trim() ?? "",
    description: row?.default_description?.trim() ?? "",
    notes: row?.default_notes?.trim() ?? "",
  };
}

export default async function InvoicePage() {
  const supabase = await createClient();
  const market = await getMarket();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/invoices");

  const defaultDate = new Date().toISOString().slice(0, 10);

  const { data: prefs } = await supabase
    .from("user_invoice_prefs")
    .select(
      "default_company_name, default_company_reg_no, default_client_name, default_client_tax_id, default_invoice_number, default_currency, default_payment_method, default_payment_details, default_description, default_notes"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const defaults = mapNewInvoiceDefaults(prefs ?? null, market);

  return <InvoiceFormClient defaultDate={defaultDate} defaults={defaults} />;
}
