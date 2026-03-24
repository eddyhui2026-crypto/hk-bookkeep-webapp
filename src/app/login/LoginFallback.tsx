"use client";

import { useI18n } from "@/components/I18nProvider";

export function LoginFallback() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted">
      {t("login.loading")}
    </div>
  );
}
