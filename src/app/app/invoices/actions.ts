"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CURRENCIES } from "@/lib/constants";
import { normalizeInvoicePaymentMethod } from "@/lib/invoice-payment";
import { getMarket } from "@/lib/market-server";

const contactSchema = z.object({
  contact_email: z
    .string()
    .max(320)
    .transform((s) => s.trim())
    .transform((s) => (s === "" ? undefined : s)),
  contact_phone: z
    .string()
    .max(80)
    .transform((s) => s.trim())
    .transform((s) => (s === "" ? undefined : s)),
});

export type SaveInvoiceContactState = { error: string; detail?: string } | null;

const emptyToNull = (s: string) => {
  const t = s.trim();
  return t === "" ? null : t;
};

const defaultsSchema = z.object({
  default_company_name: z.string().max(200),
  default_client_name: z.string().max(200),
  default_company_reg_no: z.string().max(32),
  default_client_tax_id: z.string().max(32),
  default_invoice_number: z.string().max(80),
  default_currency: z
    .string()
    .refine((s) => s === "" || (CURRENCIES as readonly string[]).includes(s)),
  default_payment_method: z.string(),
  default_payment_details: z.string().max(2000),
  default_description: z.string().max(2000),
  default_notes: z.string().max(2000),
});

export type SaveInvoiceDefaultsState = { error: string; detail?: string } | null;

export async function saveInvoiceDefaults(
  _prev: SaveInvoiceDefaultsState,
  formData: FormData
): Promise<SaveInvoiceDefaultsState> {
  const parsed = defaultsSchema.safeParse({
    default_company_name: String(formData.get("default_company_name") ?? ""),
    default_client_name: String(formData.get("default_client_name") ?? ""),
    default_company_reg_no: String(formData.get("default_company_reg_no") ?? ""),
    default_client_tax_id: String(formData.get("default_client_tax_id") ?? ""),
    default_invoice_number: String(formData.get("default_invoice_number") ?? ""),
    default_currency: String(formData.get("default_currency") ?? ""),
    default_payment_method: String(formData.get("default_payment_method") ?? ""),
    default_payment_details: String(formData.get("default_payment_details") ?? ""),
    default_description: String(formData.get("default_description") ?? ""),
    default_notes: String(formData.get("default_notes") ?? ""),
  });

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

  const market = await getMarket();
  const d = parsed.data;
  const pmRaw = d.default_payment_method.trim();
  const default_payment_method =
    pmRaw === "" ? null : normalizeInvoicePaymentMethod(pmRaw, market);

  const { error } = await supabase.from("user_invoice_prefs").upsert(
    {
      user_id: user.id,
      default_company_name: emptyToNull(d.default_company_name),
      default_client_name: emptyToNull(d.default_client_name),
      default_company_reg_no: emptyToNull(d.default_company_reg_no),
      default_client_tax_id: emptyToNull(d.default_client_tax_id),
      default_invoice_number: emptyToNull(d.default_invoice_number),
      default_currency: d.default_currency === "" ? null : d.default_currency,
      default_payment_method,
      default_payment_details: emptyToNull(d.default_payment_details),
      default_description: emptyToNull(d.default_description),
      default_notes: emptyToNull(d.default_notes),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: "save", detail: error.message };
  }

  revalidatePath("/app/invoices");
  revalidatePath("/app/invoices/defaults");
  revalidatePath("/app/invoice");
  redirect("/app/invoices");
}

export async function saveInvoiceContact(
  _prev: SaveInvoiceContactState,
  formData: FormData
): Promise<SaveInvoiceContactState> {
  const parsed = contactSchema.safeParse({
    contact_email: String(formData.get("contact_email") ?? ""),
    contact_phone: String(formData.get("contact_phone") ?? ""),
  });
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

  const { error } = await supabase.from("user_invoice_prefs").upsert(
    {
      user_id: user.id,
      contact_email: parsed.data.contact_email ?? null,
      contact_phone: parsed.data.contact_phone ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: "save", detail: error.message };
  }

  revalidatePath("/app/invoices");
  revalidatePath("/app/invoices/contact");
  revalidatePath("/app/invoices/defaults");
  revalidatePath("/app/invoice");
  redirect("/app/invoices");
}

export async function deleteInvoice(id: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { ok: false, error: "invalid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "auth" };
  }

  const { error } = await supabase.from("invoices").delete().eq("id", trimmed);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/app/invoices");
  return { ok: true };
}
