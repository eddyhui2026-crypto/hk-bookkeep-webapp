"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import { currenciesOrderedForMarket } from "@/lib/constants";
import { invoicePaymentMethodsForMarket } from "@/lib/invoice-payment";
import type { InvoiceDefaultsEditorValues } from "@/lib/invoice-types";
import {
  saveInvoiceDefaults,
  type SaveInvoiceDefaultsState,
} from "@/app/app/invoices/actions";

export function InvoiceDefaultsForm({
  initial,
}: {
  initial: InvoiceDefaultsEditorValues;
}) {
  const { t } = useI18n();
  const market = useMarket();
  const currencyOptions = currenciesOrderedForMarket(market);
  const paymentMethods = invoicePaymentMethodsForMarket(market);
  const [state, formAction, pending] = useActionState<
    SaveInvoiceDefaultsState,
    FormData
  >(saveInvoiceDefaults, null);

  const errMsg =
    state?.error === "validation"
      ? t("invoice.defaultsErrValidation")
      : state?.error === "auth"
        ? t("invoice.errAuth")
        : state?.error === "save"
          ? t("invoice.defaultsErrSave")
          : null;

  const curUnset = initial.currency === "";
  const payUnset = initial.payment_method === "";

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/app/invoices" className="text-sm text-brand hover:underline">
        {t("invoice.contactBackList")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        {t("invoice.defaultsPageTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("invoice.defaultsPageBlurb")}</p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="def-company"
            className="block text-sm font-medium text-foreground"
          >
            {t("invoice.fieldCompany")}
          </label>
          <input
            id="def-company"
            name="default_company_name"
            type="text"
            maxLength={200}
            autoComplete="organization"
            defaultValue={initial.company_name}
            placeholder={t("invoice.companyPh")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label
            htmlFor="def-company-reg"
            className="block text-sm font-medium text-foreground"
          >
            {t("invoice.fieldCompanyReg")}
          </label>
          <input
            id="def-company-reg"
            name="default_company_reg_no"
            type="text"
            maxLength={32}
            autoComplete="off"
            defaultValue={initial.company_reg_no}
            placeholder={t("invoice.companyRegPh")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label
            htmlFor="def-number"
            className="block text-sm font-medium text-foreground"
          >
            {t("invoice.fieldNumber")}
          </label>
          <input
            id="def-number"
            name="default_invoice_number"
            type="text"
            maxLength={80}
            defaultValue={initial.invoice_number}
            placeholder="INV-0001"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label
            htmlFor="def-client"
            className="block text-sm font-medium text-foreground"
          >
            {t("invoice.fieldClient")}
          </label>
          <input
            id="def-client"
            name="default_client_name"
            type="text"
            maxLength={200}
            autoComplete="off"
            defaultValue={initial.client_name}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label
            htmlFor="def-client-tax"
            className="block text-sm font-medium text-foreground"
          >
            {t("invoice.fieldClientTax")}
          </label>
          <input
            id="def-client-tax"
            name="default_client_tax_id"
            type="text"
            maxLength={32}
            autoComplete="off"
            defaultValue={initial.client_tax_id}
            placeholder={t("invoice.clientTaxPh")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label
            htmlFor="def-desc"
            className="block text-sm font-medium text-foreground"
          >
            {t("invoice.fieldDescription")}
          </label>
          <textarea
            id="def-desc"
            name="default_description"
            rows={3}
            maxLength={2000}
            defaultValue={initial.description}
            placeholder={t("invoice.descPlaceholder")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="def-currency"
              className="block text-sm font-medium text-foreground"
            >
              {t("invoice.fieldCurrency")}
            </label>
            <select
              id="def-currency"
              name="default_currency"
              defaultValue={curUnset ? "" : initial.currency}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">{t("invoice.defaultsUnsetSelect")}</option>
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="def-pay"
              className="block text-sm font-medium text-foreground"
            >
              {t("invoice.fieldPayment")}
            </label>
            <select
              id="def-pay"
              name="default_payment_method"
              defaultValue={payUnset ? "" : initial.payment_method}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">{t("invoice.defaultsUnsetSelect")}</option>
              {paymentMethods.map((key) => (
                <option key={key} value={key}>
                  {t(`invoice.pay.${key}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="def-pay-detail"
            className="block text-sm font-medium text-foreground"
          >
            {t("invoice.fieldPaymentDetails")}
          </label>
          <textarea
            id="def-pay-detail"
            name="default_payment_details"
            rows={3}
            maxLength={2000}
            defaultValue={initial.payment_details}
            placeholder={t("invoice.paymentDetailsPh")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">{t("invoice.paymentDetailsHint")}</p>
        </div>

        <div>
          <label
            htmlFor="def-notes"
            className="block text-sm font-medium text-foreground"
          >
            {t("invoice.fieldNotes")}
          </label>
          <textarea
            id="def-notes"
            name="default_notes"
            rows={2}
            maxLength={2000}
            defaultValue={initial.notes}
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
          {pending ? t("invoice.pending") : t("invoice.saveDefaults")}
        </button>
      </form>
    </div>
  );
}
