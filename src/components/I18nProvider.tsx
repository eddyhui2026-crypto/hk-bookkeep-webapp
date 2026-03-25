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
import { getPublicHtmlLang, type Market } from "@/lib/market";
import { getMessageTree } from "@/lib/i18n/get-message-tree";
import {
  LOCALE_STORAGE_KEY,
  type Locale,
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

function subscribeLocale(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LOCALE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCALE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function I18nProvider({
  children,
  market,
}: {
  children: ReactNode;
  market: Market;
}) {
  const readStored = useCallback((): Locale => {
    if (market === "tw") return "zh";
    if (typeof window === "undefined") {
      return market === "sg" ? "en" : "zh";
    }
    try {
      const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (v === "en" || v === "zh") return v;
    } catch {
      /* ignore */
    }
    return market === "sg" ? "en" : "zh";
  }, [market]);

  const serverSnapshot = useCallback((): Locale => {
    if (market === "tw") return "zh";
    if (market === "sg") return "en";
    return "zh";
  }, [market]);

  const locale = useSyncExternalStore(
    subscribeLocale,
    readStored,
    serverSnapshot
  );

  const setLocale = useCallback(
    (l: Locale) => {
      if (market === "tw") return;
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event(LOCALE_EVENT));
    },
    [market]
  );

  useEffect(() => {
    if (market === "tw" && locale !== "zh") {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, "zh");
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event(LOCALE_EVENT));
    }
  }, [market, locale]);

  useEffect(() => {
    document.documentElement.lang = getPublicHtmlLang(market, locale);
  }, [market, locale]);

  const tree = useMemo(
    () => getMessageTree(market, locale),
    [market, locale]
  ) as MessageTree;

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
