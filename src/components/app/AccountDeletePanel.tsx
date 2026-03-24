"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { deleteMyAccount, type DeleteAccountState } from "@/app/app/account/actions";

export function AccountDeletePanel({ email }: { email: string }) {
  const { locale, t } = useI18n();
  const [state, formAction, pending] = useActionState<
    DeleteAccountState,
    FormData
  >(deleteMyAccount, null);

  const errMsg =
    state?.error === "phrase"
      ? t("account.errPhrase")
      : state?.error === "auth"
        ? t("account.errAuth")
        : state?.error === "config"
          ? t("account.errConfig")
          : state?.error === "storage"
            ? t("account.errStorage")
            : state?.error === "delete_user"
              ? t("account.errDeleteUser")
              : null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/app"
          className="text-sm text-brand hover:underline"
        >
          {t("account.backApp")}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {t("account.title")}
        </h1>
        {email ? (
          <p className="mt-2 text-sm text-muted">
            {t("account.signedInAs", { email })}
          </p>
        ) : null}
      </div>

      <section className="rounded-2xl border border-expense/35 bg-expense/5 p-6">
        <h2 className="text-lg font-semibold text-foreground">
          {t("account.deleteTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t("account.deleteIntro")}
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-muted">
          <li>{t("account.deleteItemAuth")}</li>
          <li>{t("account.deleteItemData")}</li>
          <li>{t("account.deleteItemReceipts")}</li>
          <li>{t("account.deleteItemStripe")}</li>
        </ul>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label htmlFor="delete-phrase" className="block text-sm font-medium text-foreground">
              {t("account.phraseLabel")}
            </label>
            <p className="mt-1 text-xs text-muted">
              {locale === "en" ? t("account.phraseHelpEn") : t("account.phraseHelpZh")}
            </p>
            <input
              id="delete-phrase"
              name="phrase"
              type="text"
              autoComplete="off"
              required
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-expense/30"
              placeholder={locale === "en" ? "DELETE MY ACCOUNT" : "刪除我的帳號"}
            />
          </div>

          {errMsg && (
            <p className="rounded-lg bg-expense/15 px-3 py-2 text-sm text-expense">
              {errMsg}
              {state?.detail ? (
                <span className="mt-1 block text-xs opacity-90">{state.detail}</span>
              ) : null}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-expense px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
            >
              {pending ? t("account.pending") : t("account.submitDelete")}
            </button>
            <Link
              href="/app"
              className="text-sm text-muted underline hover:text-foreground"
            >
              {t("account.cancel")}
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
