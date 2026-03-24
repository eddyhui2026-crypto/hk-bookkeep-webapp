"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 sm:flex-row sm:justify-between">
        <p>{t("footer.rights", { year })}</p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-foreground">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            {t("footer.privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
