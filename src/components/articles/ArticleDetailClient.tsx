"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import type { ArticleDetail } from "@/lib/articles/types";

export function ArticleDetailClient({ article }: { article: ArticleDetail }) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/articles"
        className="text-sm text-muted hover:text-foreground"
      >
        {t("articlesDetail.back")}
      </Link>

      <article className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {article.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t("articlesDetail.published")} {article.datePublished}
          {article.dateModified ? (
            <>
              {" · "}
              {t("articlesDetail.updated")} {article.dateModified}
            </>
          ) : null}
        </p>
        <p className="mt-4 text-sm text-muted">{article.description}</p>

        <div
          className="article-body mt-10 space-y-4 text-[15px] leading-relaxed text-foreground [&_a]:text-brand [&_a]:underline-offset-2 [&_a:hover]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-8 [&_hr]:border-border [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/20 [&_pre]:p-4 [&_pre]:text-sm [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6"
          /* 文章為 repo 內 Markdown，非用戶輸入 */
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
        />
      </article>
    </div>
  );
}
