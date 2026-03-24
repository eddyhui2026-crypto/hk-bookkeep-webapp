import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceContactForm } from "@/components/invoice/InvoiceContactForm";

export const dynamic = "force-dynamic";

export default async function InvoiceContactPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/invoices/contact");

  const { data: prefs } = await supabase
    .from("user_invoice_prefs")
    .select("contact_email, contact_phone")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <InvoiceContactForm
      initialEmail={prefs?.contact_email ?? ""}
      initialPhone={prefs?.contact_phone ?? ""}
    />
  );
}
