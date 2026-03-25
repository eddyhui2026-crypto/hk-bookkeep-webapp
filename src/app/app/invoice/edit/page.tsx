import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceFormClient } from "@/components/invoice/InvoiceFormClient";
import {
  defaultCurrencyForMarket,
  normalizeInvoiceCurrency,
} from "@/lib/constants";
import type { Market } from "@/lib/market";
import { getMarket } from "@/lib/market-server";
import type { InvoiceNewFormDefaults, InvoiceRow } from "@/lib/invoice-types";

export const dynamic = "force-dynamic";

function rowToDefaults(inv: InvoiceRow, market: Market): InvoiceNewFormDefaults {
  const pm = inv.payment_method;
  const payment_method =
    pm === "bank_transfer" || pm === "paypal" || pm === "fps" ? pm : "fps";
  const currency = normalizeInvoiceCurrency(
    inv.currency,
    defaultCurrencyForMarket(market)
  );
  return {
    company_name: inv.company_name?.trim() ?? "",
    client_name: inv.client_name,
    invoice_number: inv.invoice_number,
    currency,
    payment_method,
    payment_details: inv.payment_details?.trim() ?? "",
    description: inv.description,
    notes: inv.notes?.trim() ?? "",
  };
}

export default async function InvoiceEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  const id = sp.id?.trim() ?? "";
  if (!id) redirect("/app/invoices");

  const supabase = await createClient();
  const market = await getMarket();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/app/invoice/edit?id=${id}`)}`);

  const { data: row } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!row) redirect("/app/invoices");

  const inv = row as InvoiceRow;
  if (inv.user_id !== user.id) redirect("/app/invoices");

  const defaults = rowToDefaults(inv, market);
  const defaultDate = inv.invoice_date;
  const editAmount = String(Number(inv.amount));

  return (
    <InvoiceFormClient
      defaultDate={defaultDate}
      defaults={defaults}
      editInvoiceId={id}
      editAmount={editAmount}
    />
  );
}
