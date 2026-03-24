"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { getPrivacy } from "@/lib/i18n/legal-content";

export function PrivacyPageBody() {
  const { locale, t } = useI18n();
  const doc = getPrivacy(locale);

  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-sm leading-relaxed text-muted sm:text-base">
      <h1 className="text-2xl font-semibold text-foreground">{doc.title}</h1>
      <p className="text-sm text-muted">{doc.lastUpdated}</p>
      {doc.sections.map((section, i) => (
        <section key={i} className="scroll-mt-8">
          <h2
            className={`text-lg font-semibold text-foreground ${i === 0 ? "mt-6" : "mt-10"}`}
          >
            {section.title}
          </h2>
          {section.paragraphs.map((p, j) => (
            <p key={j} className="mt-3">
              {p}
            </p>
          ))}
        </section>
      ))}
      <p className="pt-8">
        <Link href="/" className="text-brand hover:underline">
          {t("privacy.back")}
        </Link>
      </p>
    </article>
  );
}
