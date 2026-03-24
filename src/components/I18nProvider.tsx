"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  LOCALE_STORAGE_KEY,
  type Locale,
  messages,
  translate,
  type MessageTree,
} from "@/lib/i18n/messages";

const LOCALE_EVENT = "harbix-locale";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  try {
    const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (v === "en" || v === "zh") return v;
  } catch {
    /* ignore */
  }
  return "zh";
}

function subscribeLocale(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LOCALE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCALE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getLocaleSnapshot(): Locale {
  return readStoredLocale();
}

function getServerLocaleSnapshot(): Locale {
  return "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  );

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "zh-HK";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const tree = messages[locale] as MessageTree;

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(tree, key, vars),
    [tree]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
