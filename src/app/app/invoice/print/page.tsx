import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoicePrintBody } from "@/components/invoice/InvoicePrintBody";
import type { InvoiceRow } from "@/lib/invoice-types";

export const dynamic = "force-dynamic";

export default async function InvoicePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  const id = sp.id?.trim() ?? "";
  if (!id) {
    redirect("/app/invoices");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/invoices");

  const { data: row } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) {
    redirect("/app/invoices");
  }

  const inv = row as InvoiceRow;
  if (inv.user_id !== user.id) {
    redirect("/app/invoices");
  }

  const { data: prefs } = await supabase
    .from("user_invoice_prefs")
    .select("contact_email, contact_phone")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <InvoicePrintBody
      invoice={inv}
      contactEmail={prefs?.contact_email?.trim() || null}
      contactPhone={prefs?.contact_phone?.trim() || null}
    />
  );
}
