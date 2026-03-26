"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useI18n } from "@/components/I18nProvider";
import { useMarket } from "@/components/MarketProvider";
import { TwEinvoiceQrScanModal } from "@/components/dashboard/TwEinvoiceQrScanModal";
import type { TaiwanEInvoiceLeftQrParsed } from "@/lib/tw-einvoice-qr";

type OnParsedFn = (p: TaiwanEInvoiceLeftQrParsed) => void;
type RegisterFn = (fn: OnParsedFn) => () => void;

export type TwEinvoiceScanContextValue = {
  openTwEinvoiceScan: () => void;
  registerTwEinvoiceOnParsed: RegisterFn;
  scanStartError: string | null;
};

const TwEinvoiceScanContext = createContext<TwEinvoiceScanContextValue | null>(
  null
);

export function useTwEinvoiceScan(): TwEinvoiceScanContextValue | null {
  return useContext(TwEinvoiceScanContext);
}

export function TwEinvoiceScanProvider({ children }: { children: ReactNode }) {
  const market = useMarket();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scanStartError, setScanStartError] = useState<string | null>(null);
  const consumerRef = useRef<OnParsedFn | null>(null);

  useEffect(() => {
    if (!scanStartError) return;
    const id = window.setTimeout(() => setScanStartError(null), 4500);
    return () => window.clearTimeout(id);
  }, [scanStartError]);

  const registerTwEinvoiceOnParsed = useCallback<RegisterFn>((fn) => {
    consumerRef.current = fn;
    return () => {
      consumerRef.current = null;
    };
  }, []);

  const openTwEinvoiceScan = useCallback(() => {
    setScanStartError(null);
    setOpen(true);
  }, []);

  const handleParsed = useCallback((p: TaiwanEInvoiceLeftQrParsed) => {
    consumerRef.current?.(p);
    setOpen(false);
  }, []);

  const value = useMemo<TwEinvoiceScanContextValue | null>(() => {
    if (market !== "tw") return null;
    return {
      openTwEinvoiceScan,
      registerTwEinvoiceOnParsed,
      scanStartError,
    };
  }, [
    market,
    openTwEinvoiceScan,
    registerTwEinvoiceOnParsed,
    scanStartError,
  ]);

  if (market !== "tw") {
    return (
      <TwEinvoiceScanContext.Provider value={null}>
        {children}
      </TwEinvoiceScanContext.Provider>
    );
  }

  return (
    <TwEinvoiceScanContext.Provider value={value}>
      {children}
      <TwEinvoiceQrScanModal
        open={open}
        onClose={() => setOpen(false)}
        onParsed={handleParsed}
        title={t("dashboard.twEinvoiceModalTitle")}
        hint={t("dashboard.twEinvoiceModalHint")}
        scanning={t("dashboard.twEinvoiceScanning")}
        closeLabel={t("dashboard.twEinvoiceClose")}
        errStart={t("dashboard.twEinvoiceErrStart")}
        onStartError={(msg) => setScanStartError(msg)}
      />
    </TwEinvoiceScanContext.Provider>
  );
}
