"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useI18n } from "@/components/I18nProvider";
import {
  saveInvoiceContact,
  type SaveInvoiceContactState,
} from "@/app/app/invoices/actions";

export function InvoiceContactForm({
  initialEmail,
  initialPhone,
}: {
  initialEmail: string;
  initialPhone: string;
}) {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState<
    SaveInvoiceContactState,
    FormData
  >(saveInvoiceContact, null);

  const errMsg =
    state?.error === "validation"
      ? t("invoice.contactErrValidation")
      : state?.error === "auth"
        ? t("invoice.errAuth")
        : state?.error === "save"
          ? t("invoice.contactErrSave")
          : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/app/invoices" className="text-sm text-brand hover:underline">
        {t("invoice.contactBackList")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        {t("invoice.contactPageTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("invoice.contactPageBlurb")}</p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="pref-email" className="block text-sm font-medium text-foreground">
            {t("invoice.contactEmailLabel")}
          </label>
          <input
            id="pref-email"
            name="contact_email"
            type="text"
            maxLength={320}
            defaultValue={initialEmail}
            autoComplete="email"
            placeholder={t("invoice.contactEmailPh")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label htmlFor="pref-phone" className="block text-sm font-medium text-foreground">
            {t("invoice.contactPhoneLabel")}
          </label>
          <input
            id="pref-phone"
            name="contact_phone"
            type="text"
            maxLength={80}
            autoComplete="tel"
            defaultValue={initialPhone}
            placeholder={t("invoice.contactPhonePh")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {errMsg && (
          <p className="rounded-lg bg-expense/10 px-3 py-2 text-sm text-expense">
            {errMsg}
            {state?.detail ? (
              <span className="mt-1 block text-xs opacity-90">{state.detail}</span>
            ) : null}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {pending ? t("invoice.pending") : t("invoice.saveContact")}
        </button>
      </form>
    </div>
  );
}
