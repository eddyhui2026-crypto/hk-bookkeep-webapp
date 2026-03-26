import { RECEIPT_MAX_BYTES } from "@/lib/constants";

/** 副檔名（相機有時 Name 係 image.jpg 或空白） */
const LIKELY_IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|bmp|avif)$/i;

/**
 * 手機相機經 `<input capture>` 回傳嘅 File 間中 `type` 係空字串或 octet-stream；
 * 只用 `startsWith("image/")` 會當唔係相 → 入唔到隊、無任何提示。
 */
export function isLikelyReceiptImageFile(f: File): boolean {
  const t = (f.type ?? "").trim().toLowerCase();
  if (t.startsWith("image/")) return true;

  const name = (f.name ?? "").trim();
  if (name && LIKELY_IMAGE_EXT.test(name)) return true;

  if (t === "application/octet-stream" || t === "") {
    if (f.size > 0 && f.size <= RECEIPT_MAX_BYTES) {
      const minCameraBytes = 2_048;
      if (f.size >= minCameraBytes) return true;
    }
  }

  return false;
}
