"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AppSnapContextValue = {
  pendingReceipt: File | null;
  setPendingReceipt: (f: File | null) => void;
  clearPendingReceipt: () => void;
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
  const [pendingReceipt, setPendingReceipt] = useState<File | null>(null);
  const clearPendingReceipt = useCallback(() => setPendingReceipt(null), []);

  const value = useMemo(
    () => ({
      pendingReceipt,
      setPendingReceipt,
      clearPendingReceipt,
      snapEnabled,
      defaultLedgerId,
    }),
    [
      pendingReceipt,
      clearPendingReceipt,
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
