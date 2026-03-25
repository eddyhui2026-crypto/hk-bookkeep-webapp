"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { RECEIPT_SNAP_QUEUE_MAX } from "@/lib/constants";

type AppSnapContextValue = {
  /** 已影、未 attach 到表單嘅相（ FIFO） */
  receiptQueue: File[];
  /** @returns 是否成功入隊（超過上限會失敗） */
  enqueueReceipt: (f: File) => boolean;
  /** 拎隊頭一張（如有）；一般用喺「快速記一筆」自動補相 */
  dequeueReceipt: () => File | null;
  clearReceiptQueue: () => void;
  snapEnabled: boolean;
  defaultLedgerId: string | null;
};

const AppSnapContext = createContext<AppSnapContextValue | null>(null);

export function AppSnapProvider({
  children,
  snapEnabled,
  defaultLedgerId,
}: {
  children: ReactNode;
  snapEnabled: boolean;
  defaultLedgerId: string | null;
}) {
  const [receiptQueue, setReceiptQueue] = useState<File[]>([]);

  const enqueueReceipt = useCallback((f: File) => {
    let ok = false;
    setReceiptQueue((q) => {
      if (q.length >= RECEIPT_SNAP_QUEUE_MAX) {
        ok = false;
        return q;
      }
      ok = true;
      return [...q, f];
    });
    return ok;
  }, []);

  const dequeueReceipt = useCallback((): File | null => {
    let out: File | null = null;
    setReceiptQueue((q) => {
      if (q.length === 0) return q;
      out = q[0] ?? null;
      return q.slice(1);
    });
    return out;
  }, []);

  const clearReceiptQueue = useCallback(() => setReceiptQueue([]), []);

  const value = useMemo(
    () => ({
      receiptQueue,
      enqueueReceipt,
      dequeueReceipt,
      clearReceiptQueue,
      snapEnabled,
      defaultLedgerId,
    }),
    [
      receiptQueue,
      enqueueReceipt,
      dequeueReceipt,
      clearReceiptQueue,
      snapEnabled,
      defaultLedgerId,
    ]
  );

  return (
    <AppSnapContext.Provider value={value}>{children}</AppSnapContext.Provider>
  );
}

export function useAppSnap() {
  const ctx = useContext(AppSnapContext);
  if (!ctx) {
    throw new Error("useAppSnap must be used within AppSnapProvider");
  }
  return ctx;
}
