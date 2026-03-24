"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export function ToolsIndexClient() {
  const { t } = useI18n();
  const tools = [
    { href: "/tools/profits-tax-estimator", key: "toolsIndex.t1" as const },
    { href: "/tools/freelance-rate", key: "toolsIndex.t2" as const },
    { href: "/tools/ad-spend-ratio", key: "toolsIndex.t3" as const },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("toolsIndex.title")}
      </h1>
      <ul className="mt-8 space-y-3">
        {tools.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-border bg-card px-4 py-4 text-foreground shadow-sm hover:border-brand/40"
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
