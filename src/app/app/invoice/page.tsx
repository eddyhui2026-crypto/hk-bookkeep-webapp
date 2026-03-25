import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceFormClient } from "@/components/invoice/InvoiceFormClient";
import {
  defaultCurrencyForMarket,
  normalizeInvoiceCurrency,
} from "@/lib/constants";
import { getMarket } from "@/lib/market-server";
import type { Market } from "@/lib/market";
import type { InvoiceNewFormDefaults } from "@/lib/invoice-types";

export const dynamic = "force-dynamic";

function mapNewInvoiceDefaults(
  row: Record<string, string | null | undefined> | null,
  market: Market
): InvoiceNewFormDefaults {
  const pm = row?.default_payment_method;
  const payment_method =
    pm === "fps" || pm === "bank_transfer" || pm === "paypal" ? pm : "fps";
  const currency = normalizeInvoiceCurrency(
    row?.default_currency,
    defaultCurrencyForMarket(market)
  );

  return {
    company_name: row?.default_company_name?.trim() ?? "",
    client_name: row?.default_client_name?.trim() ?? "",
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
      "default_company_name, default_client_name, default_invoice_number, default_currency, default_payment_method, default_payment_details, default_description, default_notes"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const defaults = mapNewInvoiceDefaults(prefs ?? null, market);

  return <InvoiceFormClient defaultDate={defaultDate} defaults={defaults} />;
}
