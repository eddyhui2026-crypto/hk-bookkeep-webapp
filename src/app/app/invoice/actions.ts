"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CURRENCIES, normalizeInvoiceCurrency, type CurrencyCode } from "@/lib/constants";

const zInvoiceCurrency = z.enum(
  CURRENCIES as unknown as [CurrencyCode, ...CurrencyCode[]]
);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const schema = z.object({
  invoice_number: z.string().max(80),
  company_name: z
    .string()
    .max(200)
    .transform((s) => {
      const x = s.trim();
      return x === "" ? undefined : x;
    }),
  invoice_date: z.string().max(32),
  client_name: z.string().max(200),
  description: z.string().max(2000),
  amount: z
    .string()
    .transform((s) => {
      const t = s.trim();
      if (t === "") return 0;
      const n = Number(t);
      return Number.isFinite(n) ? n : NaN;
    })
    .pipe(z.number().finite().min(0)),
  currency: z.preprocess((v) => normalizeInvoiceCurrency(v), zInvoiceCurrency),
  payment_method: z.preprocess((v) => {
    const s = String(v);
    if (s === "bank_transfer" || s === "paypal" || s === "fps") return s;
    return "fps";
  }, z.enum(["fps", "bank_transfer", "paypal"])),
  payment_details: z
    .string()
    .max(2000)
    .transform((s) => (s.trim() === "" ? undefined : s)),
  notes: z
    .string()
    .max(2000)
    .transform((s) => (s.trim() === "" ? undefined : s)),
});

export type CreateInvoiceState = { error: string; detail?: string } | null;

function parseInvoiceForm(formData: FormData) {
  return schema.safeParse({
    invoice_number: String(formData.get("invoice_number") ?? ""),
    company_name: String(formData.get("company_name") ?? ""),
    invoice_date: String(formData.get("invoice_date") ?? ""),
    client_name: String(formData.get("client_name") ?? ""),
    description: String(formData.get("description") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    currency: formData.get("currency"),
    payment_method: formData.get("payment_method"),
    payment_details: String(formData.get("payment_details") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
}

export async function createInvoice(
  _prev: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const parsed = parseInvoiceForm(formData);

  if (!parsed.success) {
    return { error: "validation" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "auth" };
  }

  const d = parsed.data;
  const invTrim = d.invoice_number.trim();
  const invoice_number =
    invTrim === ""
      ? `INV-${randomUUID().replace(/-/g, "").slice(0, 12)}`
      : invTrim.slice(0, 80);

  const dateRaw = d.invoice_date.trim();
  const invoice_date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)
    ? dateRaw
    : todayISO();

  const { data: inserted, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      invoice_number,
      company_name: d.company_name ?? null,
      invoice_date,
      client_name: d.client_name,
      description: d.description,
      amount: d.amount,
      currency: d.currency,
      payment_method: d.payment_method,
      payment_details: d.payment_details ?? null,
      notes: d.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "duplicate_number" };
    }
    return { error: "save", detail: error.message };
  }

  if (!inserted?.id) {
    return { error: "save", detail: "no id" };
  }

  revalidatePath("/app/invoices");
  redirect(`/app/invoice/print?id=${inserted.id}`);
}

export async function updateInvoice(
  invoiceId: string,
  _prev: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const trimmedId = invoiceId?.trim();
  if (!trimmedId) {
    return { error: "save", detail: "missing id" };
  }

  const parsed = parseInvoiceForm(formData);
  if (!parsed.success) {
    return { error: "validation" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "auth" };
  }

  const { data: cur } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("id", trimmedId)
    .maybeSingle();

  if (!cur?.invoice_number) {
    return { error: "save", detail: "not found" };
  }

  const d = parsed.data;
  const invTrim = d.invoice_number.trim();
  const invoice_number =
    invTrim === "" ? cur.invoice_number : invTrim.slice(0, 80);

  const dateRaw = d.invoice_date.trim();
  const invoice_date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)
    ? dateRaw
    : todayISO();

  const { error } = await supabase
    .from("invoices")
    .update({
      invoice_number,
      company_name: d.company_name ?? null,
      invoice_date,
      client_name: d.client_name,
      description: d.description,
      amount: d.amount,
      currency: d.currency,
      payment_method: d.payment_method,
      payment_details: d.payment_details ?? null,
      notes: d.notes ?? null,
    })
    .eq("id", trimmedId)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "duplicate_number" };
    }
    return { error: "save", detail: error.message };
  }

  revalidatePath("/app/invoices");
  revalidatePath("/app");
  redirect(`/app/invoice/print?id=${trimmedId}`);
}
