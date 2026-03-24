import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceListClient } from "@/components/invoice/InvoiceListClient";

export const dynamic = "force-dynamic";

export default async function InvoicesListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/invoices");

  const { data: rows, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, invoice_date, client_name, amount, currency, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-expense">{error.message}</p>
        <Link href="/app" className="mt-4 inline-block text-sm text-brand underline">
          ← App
        </Link>
      </div>
    );
  }

  return (
    <InvoiceListClient
      rows={(rows ?? []).map((r) => ({
        id: r.id,
        invoice_number: r.invoice_number,
        invoice_date: r.invoice_date,
        client_name: r.client_name,
        amount: Number(r.amount),
        currency: r.currency,
      }))}
    />
  );
}
