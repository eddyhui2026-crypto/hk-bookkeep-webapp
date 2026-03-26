/**
 * 台灣紙本電子發票「左方二維條碼」純字串解析（財政部公開欄位）。
 * 無需 API：掃碼後取得嘅字串喺前端拆解即可。
 *
 * @see 財政部電子發票證明聯二維條碼記載事項（77 碼固定欄 + 冒號延伸）
 */

export type TaiwanEInvoiceLeftQrParsed = {
  invoiceNumber: string;
  /** 民國年 7 碼 YYYMMDD */
  rocDateRaw: string;
  /** 西元 yyyy-mm-dd */
  gregorianDateIso: string;
  randomCode: string;
  /** 未稅總額（十六進位欄位解出） */
  salesAmount: number;
  /** 含稅總額（十六進位欄位解出）— 記帳一般用此金額 */
  totalAmount: number;
  buyerBan: string;
  sellerBan: string;
  /** 冒號延伸區第一筆品名（如有且可辨識） */
  firstItemName?: string;
};

const INVOICE_RE = /^[A-Z]{2}\d{8}$/;

function rocYmdToGregorianIso(rocYmd: string): string | null {
  if (!/^\d{7}$/.test(rocYmd)) return null;
  const rocY = parseInt(rocYmd.slice(0, 3), 10);
  const m = parseInt(rocYmd.slice(3, 5), 10);
  const d = parseInt(rocYmd.slice(5, 7), 10);
  if (
    !Number.isFinite(rocY) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d) ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > 31
  ) {
    return null;
  }
  const gy = rocY + 1911;
  const iso = `${gy}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const check = new Date(`${iso}T12:00:00`);
  if (
    check.getFullYear() !== gy ||
    check.getMonth() + 1 !== m ||
    check.getDate() !== d
  ) {
    return null;
  }
  return iso;
}

function parseHexUint(s: string): number | null {
  if (!/^[0-9A-Fa-f]{8}$/.test(s)) return null;
  const n = parseInt(s, 16);
  return Number.isFinite(n) ? n : null;
}

const BAN_RE = /^\d{8}$/;
const RANDOM_RE = /^[0-9A-Za-z]{4}$/;
/** 左欄 AES+Base64 驗證資訊 24 碼（字元集略寬鬆） */
const CRYPTO24_RE = /^[A-Za-z0-9+/=]{24}$/;

/**
 * 從掃描結果拆解左方 QR。若格式不符（例如只掃到右方延續碼）則回傳 null。
 */
export function parseTaiwanEInvoiceLeftQr(raw: string): TaiwanEInvoiceLeftQrParsed | null {
  const s = raw.replace(/^\uFEFF/, "").trim();
  if (s.length < 77) return null;

  const firstColon = s.indexOf(":");
  const header = (firstColon === -1 ? s : s.slice(0, firstColon)).slice(0, 77);
  if (header.length !== 77) return null;

  const invoiceNumber = header.slice(0, 10).toUpperCase();
  const rocDateRaw = header.slice(10, 17);
  const randomCode = header.slice(17, 21);
  const salesHex = header.slice(21, 29);
  const totalHex = header.slice(29, 37);
  const buyerBan = header.slice(37, 45);
  const sellerBan = header.slice(45, 53);
  const crypto = header.slice(53, 77);

  if (!INVOICE_RE.test(invoiceNumber)) return null;
  const gregorianDateIso = rocYmdToGregorianIso(rocDateRaw);
  if (!gregorianDateIso) return null;
  if (!RANDOM_RE.test(randomCode)) return null;
  const salesAmount = parseHexUint(salesHex);
  const totalAmount = parseHexUint(totalHex);
  if (salesAmount === null || totalAmount === null) return null;
  if (!BAN_RE.test(buyerBan) || !BAN_RE.test(sellerBan)) return null;
  if (!CRYPTO24_RE.test(crypto)) return null;

  let firstItemName: string | undefined;
  if (firstColon !== -1) {
    const tail = s.slice(firstColon + 1);
    const parts = tail.split(":");
    if (parts.length >= 5) {
      const enc = Number(parts[3]);
      if (enc === 0 || enc === 1 || enc === 2) {
        const name = parts[4]?.trim();
        if (name) firstItemName = name;
      }
    }
  }

  return {
    invoiceNumber,
    rocDateRaw,
    gregorianDateIso,
    randomCode,
    salesAmount,
    totalAmount,
    buyerBan,
    sellerBan,
    firstItemName,
  };
}

/** 產生「快速記一筆」備註用字串 */
export function taiwanEInvoiceNoteFromParsed(p: TaiwanEInvoiceLeftQrParsed): string {
  const parts = [
    `發票 ${p.invoiceNumber}`,
    `賣方 ${p.sellerBan}`,
    p.firstItemName ? p.firstItemName : null,
  ].filter(Boolean);
  return parts.join(" · ");
}
