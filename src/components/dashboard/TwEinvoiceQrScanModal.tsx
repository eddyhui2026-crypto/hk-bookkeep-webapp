"use client";

import { useEffect, useId, useRef } from "react";
import {
  parseTaiwanEInvoiceLeftQr,
  type TaiwanEInvoiceLeftQrParsed,
} from "@/lib/tw-einvoice-qr";

type Props = {
  open: boolean;
  onClose: () => void;
  onParsed: (data: TaiwanEInvoiceLeftQrParsed) => void;
  title: string;
  hint: string;
  scanning: string;
  closeLabel: string;
  errStart: string;
  onStartError: (message: string) => void;
};

export function TwEinvoiceQrScanModal({
  open,
  onClose,
  onParsed,
  title,
  hint,
  scanning,
  closeLabel,
  errStart,
  onStartError,
}: Props) {
  const reactId = useId().replace(/:/g, "");
  const readerId = `tw-einv-${reactId}`;
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const lockedRef = useRef(false);
  const onParsedRef = useRef(onParsed);
  const onCloseRef = useRef(onClose);
  const onStartErrorRef = useRef(onStartError);

  onParsedRef.current = onParsed;
  onCloseRef.current = onClose;
  onStartErrorRef.current = onStartError;

  useEffect(() => {
    if (!open) return;
    lockedRef.current = false;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const qr = new Html5Qrcode(readerId, /* verbose */ false);
        scannerRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 280, height: 280 } },
          (decodedText) => {
            if (lockedRef.current) return;
            const parsed = parseTaiwanEInvoiceLeftQr(decodedText);
            if (!parsed) return;
            lockedRef.current = true;
            void qr
              .stop()
              .then(() => qr.clear())
              .catch(() => {})
              .finally(() => {
                scannerRef.current = null;
                onParsedRef.current(parsed);
                onCloseRef.current();
              });
          },
          () => {}
        );
      } catch {
        if (!cancelled) onStartErrorRef.current(errStart);
        onCloseRef.current();
      }
    })();

    return () => {
      cancelled = true;
      const q = scannerRef.current as
        | { stop: () => Promise<void>; clear?: () => void }
        | null;
      scannerRef.current = null;
      if (!q) return;
      void q
        .stop()
        .then(() => q.clear?.())
        .catch(() => {});
    };
  }, [open, readerId, errStart]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby={`${readerId}-title`}
    >
      <div className="max-h-[min(92vh,640px)] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              id={`${readerId}-title`}
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h3>
            <p className="mt-1 text-xs text-muted">{hint}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-brand/10"
            onClick={() => onClose()}
          >
            {closeLabel}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">{scanning}</p>
        <div
          id={readerId}
          className="mt-3 min-h-[240px] w-full overflow-hidden rounded-xl bg-black/5"
        />
      </div>
    </div>
  );
}
