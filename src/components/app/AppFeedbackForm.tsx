"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

const KINDS = [
  "bug",
  "confusion",
  "billing",
  "suggestion",
  "other",
] as const;

type Kind = (typeof KINDS)[number];

export function AppFeedbackForm() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [kind, setKind] = useState<Kind>("bug");
  const [message, setMessage] = useState("");
  const [pageHint, setPageHint] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errDetail, setErrDetail] = useState<string | null>(null);
  const pageHintPrimed = useRef(false);

  useEffect(() => {
    if (!pathname || pageHintPrimed.current) return;
    setPageHint(pathname);
    pageHintPrimed.current = true;
  }, [pathname]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setErrDetail(null);
    const r = await fetch("/api/app-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        message,
        pageHint: pageHint.trim() || undefined,
        website: honeypot,
      }),
    });
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    if (r.ok) setStatus("ok");
    else {
      setStatus("err");
      setErrDetail(typeof j.error === "string" && j.error ? j.error : null);
    }
  }

  function kindLabel(k: Kind): string {
    const keys: Record<Kind, string> = {
      bug: "appFeedback.kindBug",
      confusion: "appFeedback.kindConfusion",
      billing: "appFeedback.kindBilling",
      suggestion: "appFeedback.kindSuggestion",
      other: "appFeedback.kindOther",
    };
    return t(keys[k]);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link
        href="/app"
        className="text-sm text-brand hover:underline"
      >
        {t("appFeedback.backApp")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        {t("appFeedback.title")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("appFeedback.blurb")}</p>

      {status === "ok" ? (
        <p className="mt-8 text-sm text-income">{t("appFeedback.ok")}</p>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
          <input
            type="text"
            name="website"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-foreground">
              {t("appFeedback.kindLabel")}
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {kindLabel(k)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              {t("appFeedback.pageHintLabel")}
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              value={pageHint}
              onChange={(e) => setPageHint(e.target.value)}
              placeholder={t("appFeedback.pageHintPh")}
            />
            <p className="mt-1 text-xs text-muted">{t("appFeedback.pageHintHelp")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              {t("appFeedback.messageLabel")}
            </label>
            <textarea
              required
              rows={6}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("appFeedback.messagePh")}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover"
          >
            {t("appFeedback.submit")}
          </button>
        </form>
      )}

      {status === "err" && (
        <div className="mt-4 space-y-1 text-sm text-expense">
          <p>{t("appFeedback.err")}</p>
          {errDetail && <p className="text-xs opacity-90">{errDetail}</p>}
        </div>
      )}
    </div>
  );
}
