"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import type { ArticleListItem } from "@/lib/articles/types";

export function ArticlesIndexClient({
  articles,
}: {
  articles: ArticleListItem[];
}) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("articlesIndex.title")}
      </h1>
      <p className="mt-3 text-sm text-muted">{t("articlesIndex.intro")}</p>

      {articles.length === 0 ? (
        <p className="mt-10 text-sm text-muted">{t("articlesIndex.empty")}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="block rounded-xl border border-border bg-card px-4 py-4 text-left shadow-sm hover:border-brand/40"
              >
                <span className="block font-medium text-foreground">
                  {a.title}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {a.datePublished}
                </span>
                <span className="mt-2 block text-sm text-muted">
                  {a.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
