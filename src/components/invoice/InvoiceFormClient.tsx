"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import {
  createInvoice,
  updateInvoice,
  type CreateInvoiceState,
} from "@/app/app/invoice/actions";
import { currenciesOrderedForMarket } from "@/lib/constants";
import { invoicePaymentMethodsForMarket } from "@/lib/invoice-payment";
import type { InvoiceNewFormDefaults } from "@/lib/invoice-types";

export function InvoiceFormClient({
  defaultDate,
  defaults,
  editInvoiceId,
  editAmount,
}: {
  defaultDate: string;
  defaults: InvoiceNewFormDefaults;
  editInvoiceId?: string;
  editAmount?: string;
}) {
  const { t } = useI18n();
  const market = useMarket();
  const currencyOptions = currenciesOrderedForMarket(market);
  const paymentMethods = invoicePaymentMethodsForMarket(market);
  const formActionHandler =
    editInvoiceId != null && editInvoiceId !== ""
      ? updateInvoice.bind(null, editInvoiceId)
      : createInvoice;
  const [state, formAction, pending] = useActionState<
    CreateInvoiceState,
    FormData
  >(formActionHandler, null);

  const errMsg =
    state?.error === "validation"
      ? t("invoice.errValidation")
      : state?.error === "auth"
        ? t("invoice.errAuth")
        : state?.error === "duplicate_number"
          ? t("invoice.errDuplicateNumber")
          : state?.error === "save"
            ? t("invoice.errSave")
            : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href="/app/invoices" className="text-brand hover:underline">
          {t("invoice.backList")}
        </Link>
        <Link href="/app" className="text-muted hover:text-foreground hover:underline">
          {t("invoice.backApp")}
        </Link>
        <Link
          href="/app/invoices/contact"
          className="text-muted hover:text-foreground hover:underline"
        >
          {t("invoice.contactSettings")}
        </Link>
        <Link
          href="/app/invoices/defaults"
          className="text-muted hover:text-foreground hover:underline"
        >
          {t("invoice.defaultsSettings")}
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        {editInvoiceId ? t("invoice.editTitle") : t("invoice.title")}
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {t("invoice.disclaimerShort")}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="inv-company" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldCompany")}
          </label>
          <input
            id="inv-company"
            name="company_name"
            type="text"
            maxLength={200}
            autoComplete="organization"
            placeholder={t("invoice.companyPh")}
            defaultValue={defaults.company_name}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="inv-company-reg" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldCompanyReg")}
          </label>
          <input
            id="inv-company-reg"
            name="company_reg_no"
            type="text"
            maxLength={32}
            autoComplete="off"
            placeholder={t("invoice.companyRegPh")}
            defaultValue={defaults.company_reg_no}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="inv-number" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldNumber")}
          </label>
          <input
            id="inv-number"
            name="invoice_number"
            type="text"
            maxLength={80}
            placeholder="INV-0001"
            defaultValue={defaults.invoice_number}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            aria-describedby="invoice-number-hint"
          />
          <p id="invoice-number-hint" className="mt-1 text-xs text-muted">
            {t("invoice.numberHint")}
          </p>
        </div>

        <div>
          <label htmlFor="inv-date" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldDate")}
          </label>
          <input
            id="inv-date"
            name="invoice_date"
            type="date"
            defaultValue={defaultDate}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="inv-client" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldClient")}
          </label>
          <input
            id="inv-client"
            name="client_name"
            type="text"
            maxLength={200}
            autoComplete="off"
            defaultValue={defaults.client_name}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="inv-client-tax" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldClientTax")}
          </label>
          <input
            id="inv-client-tax"
            name="client_tax_id"
            type="text"
            maxLength={32}
            autoComplete="off"
            placeholder={t("invoice.clientTaxPh")}
            defaultValue={defaults.client_tax_id}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="inv-desc" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldDescription")}
          </label>
          <textarea
            id="inv-desc"
            name="description"
            rows={3}
            maxLength={2000}
            placeholder={t("invoice.descPlaceholder")}
            defaultValue={defaults.description}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inv-amount" className="block text-sm font-medium text-foreground">
              {t("invoice.fieldAmount")}
            </label>
            <input
              id="inv-amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              defaultValue={editAmount}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label htmlFor="inv-currency" className="block text-sm font-medium text-foreground">
              {t("invoice.fieldCurrency")}
            </label>
            <select
              id="inv-currency"
              name="currency"
              defaultValue={defaults.currency}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            >
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="inv-pay" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldPayment")}
          </label>
            <select
              id="inv-pay"
              name="payment_method"
              defaultValue={defaults.payment_method}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            >
            {paymentMethods.map((key) => (
              <option key={key} value={key}>
                {t(`invoice.pay.${key}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="inv-pay-detail" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldPaymentDetails")}
          </label>
          <textarea
            id="inv-pay-detail"
            name="payment_details"
            rows={3}
            maxLength={2000}
            defaultValue={defaults.payment_details}
            placeholder={t("invoice.paymentDetailsPh")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">{t("invoice.paymentDetailsHint")}</p>
        </div>

        <div>
          <label htmlFor="inv-notes" className="block text-sm font-medium text-foreground">
            {t("invoice.fieldNotes")}
          </label>
          <textarea
            id="inv-notes"
            name="notes"
            rows={2}
            maxLength={2000}
            defaultValue={defaults.notes}
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
          {pending
            ? t("invoice.pending")
            : editInvoiceId
              ? t("invoice.submitUpdate")
              : t("invoice.submitPrint")}
        </button>
      </form>
    </div>
  );
}
