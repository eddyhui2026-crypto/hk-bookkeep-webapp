"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import { getSiteName } from "@/lib/market";

export function SiteHeader() {
  const market = useMarket();
  const { locale, setLocale, t } = useI18n();
  const siteName = getSiteName(market);

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          {siteName}
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
          {market !== "tw" ? (
          <button
            type="button"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="rounded-full border border-border px-3 py-1 text-foreground hover:bg-brand/10"
          >
            {t("localeSwitch")}
          </button>
          ) : null}
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
