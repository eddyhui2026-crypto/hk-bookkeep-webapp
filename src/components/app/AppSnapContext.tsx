"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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
  /** 同步佇列長度，避免 setState updater 回傳值喺某啲情況唔可靠 */
  const queueRef = useRef<File[]>([]);

  const enqueueReceipt = useCallback((f: File) => {
    const q = queueRef.current;
    if (q.length >= RECEIPT_SNAP_QUEUE_MAX) return false;
    const next = [...q, f];
    queueRef.current = next;
    setReceiptQueue(next);
    return true;
  }, []);

  const dequeueReceipt = useCallback((): File | null => {
    const q = queueRef.current;
    if (q.length === 0) return null;
    const head = q[0] ?? null;
    const rest = q.slice(1);
    queueRef.current = rest;
    setReceiptQueue(rest);
    return head;
  }, []);

  const clearReceiptQueue = useCallback(() => {
    queueRef.current = [];
    setReceiptQueue([]);
  }, []);

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
