import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDefaultsForm } from "@/components/invoice/InvoiceDefaultsForm";
import { CURRENCIES, type CurrencyCode } from "@/lib/constants";
import type { InvoiceDefaultsEditorValues } from "@/lib/invoice-types";

export const dynamic = "force-dynamic";

function mapPrefs(
  row: Record<string, string | null | undefined>
): InvoiceDefaultsEditorValues {
  const pm = row.default_payment_method;
  const payOk =
    pm === "fps" || pm === "bank_transfer" || pm === "paypal" ? pm : "";
  const cur = row.default_currency;
  const curOk =
    cur && (CURRENCIES as readonly string[]).includes(cur) ? (cur as CurrencyCode) : "";

  return {
    company_name: row.default_company_name?.trim() ?? "",
    client_name: row.default_client_name?.trim() ?? "",
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

  const { data: prefs } = await supabase
    .from("user_invoice_prefs")
    .select(
      "default_company_name, default_client_name, default_invoice_number, default_currency, default_payment_method, default_payment_details, default_description, default_notes"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const initial = mapPrefs(prefs ?? {});

  return <InvoiceDefaultsForm initial={initial} />;
}
