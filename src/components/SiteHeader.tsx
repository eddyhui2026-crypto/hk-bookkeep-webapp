"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/env";
import { useI18n } from "@/components/I18nProvider";

export function SiteHeader() {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          {SITE_NAME}
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-base text-muted sm:text-sm">
          <Link href="/articles" className="hover:text-foreground">
            {t("nav.articles")}
          </Link>
          <Link href="/tools" className="hover:text-foreground">
            {t("nav.tools")}
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            {t("nav.contact")}
          </Link>
          <button
            type="button"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="rounded-full border border-border px-3 py-1 text-foreground hover:bg-brand/10"
          >
            {t("localeSwitch")}
          </button>
          <Link
            href="/login"
            className="rounded-full bg-brand px-3 py-1.5 text-white shadow-sm hover:bg-brand-hover"
          >
            {t("nav.login")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
