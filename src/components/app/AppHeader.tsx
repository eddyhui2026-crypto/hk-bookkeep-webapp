"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/env";
import { signOut } from "@/app/auth/actions";
import { useI18n } from "@/components/I18nProvider";

export function AppHeader({ email }: { email?: string | null }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <header
      data-app-header
      className="border-b border-border bg-card print:hidden"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/app" className="font-semibold text-foreground">
          {SITE_NAME}
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {email && (
            <span className="hidden text-muted sm:inline">{email}</span>
          )}
          <button
            type="button"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="rounded-full border border-border px-3 py-1 text-foreground hover:bg-brand/10"
          >
            {t("localeSwitch")}
          </button>
          <Link href="/" className="text-muted hover:text-foreground">
            {t("app.home")}
          </Link>
          <Link
            href="/app/account"
            className="text-muted hover:text-foreground"
          >
            {t("app.accountNav")}
          </Link>
          <Link
            href="/app/invoices"
            className="text-muted hover:text-foreground"
          >
            {t("invoice.navLink")}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-border px-3 py-1 hover:bg-brand/10"
            >
              {t("app.signOut")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
