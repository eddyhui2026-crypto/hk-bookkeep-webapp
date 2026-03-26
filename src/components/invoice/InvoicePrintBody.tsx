"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import { formatCurrencyAmount } from "@/lib/constants";
import type { InvoiceRow } from "@/lib/invoice-types";

export function InvoicePrintBody({
  invoice,
  contactEmail,
  contactPhone,
}: {
  invoice: InvoiceRow;
  contactEmail: string | null;
  contactPhone: string | null;
}) {
  const { locale, t } = useI18n();
  const market = useMarket();
  const numLocale =
    locale === "en"
      ? "en-HK"
      : market === "tw"
        ? "zh-TW"
        : market === "sg"
          ? "zh-SG"
          : "zh-HK";
  const amt = Number(invoice.amount);
  const pm = invoice.payment_method;
  const payKey = `invoice.pay.${pm}`;
  const payTranslated = t(payKey);
  const paymentLabel = payTranslated !== payKey ? payTranslated : pm;

  const company = invoice.company_name?.trim();
  const hasContact = Boolean(contactEmail || contactPhone);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-foreground print:max-w-none print:px-8 print:py-6">
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-border pb-4 print:hidden">
        <Link
          href="/app/invoices"
          className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-brand/10"
        >
          {t("invoice.printBackList")}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          {t("invoice.printBtn")}
        </button>
        <p className="w-full whitespace-pre-line text-sm text-muted">
          {t("invoice.printHelp")}
        </p>
      </div>

      <header className="mb-6 border-b border-border pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {company ? (
              <p className="text-xl font-semibold tracking-tight text-foreground print:text-lg">
                {company}
              </p>
            ) : null}
            {invoice.company_reg_no?.trim() ? (
              <p className="mt-1 text-sm text-muted print:text-xs">
                {t("invoice.fieldCompanyReg")}: {invoice.company_reg_no.trim()}
              </p>
            ) : null}
            <h1
              className={`text-2xl font-semibold tracking-tight print:text-xl ${company ? "mt-2" : ""}`}
            >
              {t("invoice.docTitle")}
            </h1>
            {hasContact ? (
              <div className="mt-3 space-y-0.5 text-sm text-muted">
                {contactEmail ? (
                  <p>
                    <span className="text-foreground/80">{t("invoice.printContactEmail")}</span>{" "}
                    {contactEmail}
                  </p>
                ) : null}
                {contactPhone ? (
                  <p>
                    <span className="text-foreground/80">{t("invoice.printContactPhone")}</span>{" "}
                    {contactPhone}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-foreground">{invoice.invoice_number}</p>
            <p className="mt-1 text-muted">
              {t("invoice.printDate")}: {invoice.invoice_date}
            </p>
          </div>
        </div>
      </header>

      <dl className="space-y-3 text-sm">
        {invoice.client_name !== "" ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t("invoice.fieldClient")}
            </dt>
            <dd className="mt-0.5 text-base font-medium whitespace-pre-wrap">
              {invoice.client_name}
            </dd>
            {invoice.client_tax_id?.trim() ? (
              <dd className="mt-1 text-sm text-muted">
                {t("invoice.fieldClientTax")}: {invoice.client_tax_id.trim()}
              </dd>
            ) : null}
          </div>
        ) : null}
        {invoice.description !== "" ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t("invoice.fieldDescription")}
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap">{invoice.description}</dd>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-8">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t("invoice.fieldAmount")}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {formatCurrencyAmount(amt, invoice.currency, numLocale)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t("invoice.fieldPayment")}
            </dt>
            <dd className="mt-0.5">
              <span>{paymentLabel}</span>
              {invoice.payment_details?.trim() ? (
                <div className="mt-1.5 whitespace-pre-wrap text-muted">
                  {invoice.payment_details.trim()}
                </div>
              ) : null}
            </dd>
          </div>
        </div>
        {invoice.notes ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t("invoice.fieldNotes")}
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-muted">{invoice.notes}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
