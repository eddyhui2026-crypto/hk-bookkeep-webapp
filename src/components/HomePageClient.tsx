"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import { getSiteName } from "@/lib/market";
import { HomePhoneMockup } from "@/components/HomePhoneMockup";
import { HomeAddToHomeSection } from "@/components/HomeAddToHomeSection";

const TOOL_LINKS = [
  { href: "/tools/profits-tax-estimator", key: "home.toolCard1" as const },
  { href: "/tools/freelance-rate", key: "home.toolCard2" as const },
  { href: "/tools/ad-spend-ratio", key: "home.toolCard3" as const },
];

const AUDIENCE_FIT_KEYS = [
  "home.audienceFit1",
  "home.audienceFit2",
  "home.audienceFit3",
  "home.audienceFit4",
  "home.audienceFit5",
  "home.audienceFit6",
  "home.audienceFit7",
  "home.audienceFit8",
] as const;

const AUDIENCE_NOT_KEYS = [
  "home.audienceNot1",
  "home.audienceNot2",
  "home.audienceNot3",
  "home.audienceNot4",
  "home.audienceNot5",
  "home.audienceNot6",
] as const;

export function HomePageClient() {
  const { t } = useI18n();
  const market = useMarket();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="lg:grid lg:grid-cols-[1fr_auto] lg:items-start lg:gap-x-10 xl:gap-x-14">
        <div className="min-w-0">
          <p className="text-base font-medium text-brand sm:text-sm">{t("home.tag")}</p>
          <h1 className="mt-3 text-[2.35rem] font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            {t("home.titleLine1")}
            <br />
            {t("home.titleLine2")}
          </h1>
          <div className="mt-6 max-w-2xl space-y-4 text-muted lg:max-w-none">
            <p className="text-lg leading-relaxed">{t("home.lead")}</p>
            <p className="text-lg leading-relaxed">{t("home.intro")}</p>
            <p className="text-base leading-relaxed">{t("home.valueBlurb")}</p>
            <p className="text-base leading-relaxed">{t("home.mobileBlurb")}</p>
          </div>
        </div>
        <div className="mt-10 flex shrink-0 justify-center lg:mt-0 lg:block lg:justify-self-end lg:pt-1">
          <HomePhoneMockup
            appTitle={getSiteName(market)}
            appSubtitle={t("home.mockupAppSubtitle")}
            receiptLabel={t("home.mockupReceipt")}
            expenseLabel={t("home.mockupExpense")}
            categorySample={t("home.mockupCategorySample")}
            submitLabel={t("home.mockupSubmit")}
            hintLabel={t("home.mockupHint")}
          />
        </div>
      </div>

      <ul className="mt-10 grid gap-3 text-base text-foreground/90 sm:grid-cols-2 sm:text-sm lg:grid-cols-3">
        <li className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          {t("home.li1")}
        </li>
        <li className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          {t("home.li2")}
        </li>
        <li className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          {t("home.li3")}
        </li>
        <li className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          {t("home.li4")}
        </li>
        <li className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          {t("home.li5")}
        </li>
      </ul>

      <section className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="rounded-2xl border border-brand/35 bg-brand/5 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {t("home.audienceFitTitle")}
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2.5 text-sm leading-relaxed text-foreground/90">
            {AUDIENCE_FIT_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {t("home.audienceNotTitle")}
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2.5 text-sm leading-relaxed text-muted">
            {AUDIENCE_NOT_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
      </section>

      <HomeAddToHomeSection />

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-foreground">
          {t("home.toolsHeading")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t("home.toolsIntro")}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {TOOL_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-brand/50 hover:shadow-md"
              >
                <span className="font-medium text-foreground">{t(item.key)}</span>
                <span className="mt-2 text-xs text-brand">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            href="/tools"
            className="text-sm font-medium text-brand hover:underline"
          >
            {t("home.allTools")}
          </Link>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/login"
          className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white shadow-md hover:bg-brand-hover"
        >
          {t("home.ctaLogin")}
        </Link>
        <Link
          href="/tools/profits-tax-estimator"
          className="rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-brand/10"
        >
          {t("home.ctaTools")}
        </Link>
      </div>
    </div>
  );
}
