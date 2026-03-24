"use client";

import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export default function ContactPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, message, website }),
    });
    if (r.ok) setStatus("ok");
    else setStatus("err");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">{t("contact.title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("contact.blurb")}</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <input
          className="w-full rounded-xl border border-border px-4 py-3 text-sm"
          placeholder={t("contact.namePh")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          required
          type="email"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm"
          placeholder={t("contact.emailPh")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          required
          rows={5}
          className="w-full rounded-xl border border-border px-4 py-3 text-sm"
          placeholder={t("contact.msgPh")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover"
        >
          {t("contact.submit")}
        </button>
      </form>
      {status === "ok" && (
        <p className="mt-4 text-sm text-income">{t("contact.ok")}</p>
      )}
      {status === "err" && (
        <p className="mt-4 text-sm text-expense">{t("contact.err")}</p>
      )}
    </div>
  );
}
