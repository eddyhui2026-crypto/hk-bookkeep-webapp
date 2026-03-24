"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useAppSnap } from "@/components/app/AppSnapContext";

function CameraGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4.5 9.5h2l1.5-2.5h8l1.5 2.5h2A1.5 1.5 0 0 1 21 11v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19v-8a1.5 1.5 0 0 1 1.5-1.5Z" />
      <circle cx="12" cy="14" r="3.35" />
    </svg>
  );
}

export function AppReceiptSnapFab() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setPendingReceipt, snapEnabled, defaultLedgerId } = useAppSnap();

  if (!snapEnabled || !defaultLedgerId) return null;

  const isPrintRoute = pathname.includes("/print");
  if (isPrintRoute) return null;

  const rawLedger = searchParams.get("ledger");
  const urlLedger =
    rawLedger && /^[0-9a-f-]{36}$/i.test(rawLedger) ? rawLedger : null;
  const targetLedger = urlLedger ?? defaultLedgerId;

  const onFile = (f: File | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    setPendingReceipt(f);
    const onDashboard = pathname === "/app";
    const ledgerOk = !urlLedger || urlLedger === targetLedger;
    if (!onDashboard || !ledgerOk) {
      router.push(`/app?ledger=${encodeURIComponent(targetLedger)}`);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          e.target.value = "";
          onFile(f);
        }}
      />
      <button
        type="button"
        className="print:hidden fixed z-[45] flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_28px_rgba(147,51,234,0.45)] transition hover:bg-brand-hover hover:shadow-[0_10px_32px_rgba(147,51,234,0.5)] focus-visible:outline focus-visible:ring-4 focus-visible:ring-brand/35 active:scale-[0.97] sm:h-[4.5rem] sm:w-[4.5rem]"
        style={{
          bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
          right: "max(1rem, env(safe-area-inset-right, 0px))",
        }}
        onClick={() => {
          inputRef.current?.click();
        }}
        aria-label={t("dashboard.fabQuickSnapAria")}
        title={t("dashboard.fabQuickSnapHint")}
      >
        <CameraGlyph className="h-[1.85rem] w-[1.85rem] sm:h-8 sm:w-8" />
      </button>
    </>
  );
}
