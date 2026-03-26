import type { Market } from "@/lib/market";

/** [香港粵語稿, 台灣繁體稿, 星洲英文稿]；hk 用 [0]，tw 用 [1]，sg 用 [2]。 */
const U = {
  notSignedIn: ["未登入", "尚未登入", "Not signed in."],
  readOnly: [
    "目前為只讀模式，請訂閱或完成付款。",
    "目前為唯讀模式，請訂閱或完成付款。",
    "Read-only mode. Subscribe or complete payment to keep editing.",
  ],
  ledgerNameOrTemplate: [
    "請輸入生意簿名稱或揀範本",
    "請輸入生意簿名稱或選擇範本",
    "Enter a ledger name or pick a template.",
  ],
  createFailed: ["建立失敗", "建立失敗", "Could not create."],
  ledgerNameRequired: [
    "請輸入生意簿名稱",
    "請輸入生意簿名稱",
    "Enter a ledger name.",
  ],
  fxInvalid: [
    "請輸入有效匯率（正數）",
    "請輸入有效匯率（正數）",
    "Enter a valid positive exchange rate.",
  ],
  ledgerNotFound: [
    "找不到生意簿",
    "找不到生意簿",
    "Ledger not found.",
  ],
  currencyUnsupported: [
    "不支援嘅幣種",
    "不支援的幣別",
    "Currency not supported.",
  ],
  invalidAmount: ["請輸入有效金額", "請輸入有效金額", "Enter a valid amount."],
  txNotFound: ["找不到交易", "找不到交易", "Transaction not found."],
  categorySameLedger: [
    "分類必須屬於同一本生意簿",
    "分類必須屬於同一本生意簿",
    "Category must belong to the same ledger.",
  ],
  categoryNameRequired: [
    "請輸入分類名稱",
    "請輸入分類名稱",
    "Enter a category name.",
  ],
  addCategoryFailed: [
    "新增分類失敗",
    "新增分類失敗",
    "Could not add category.",
  ],
} as const;

export type ServerActionUiKey = keyof typeof U;

export function serverActionUiMessage(
  market: Market,
  key: ServerActionUiKey
): string {
  const triple = U[key];
  if (market === "tw") return triple[1];
  if (market === "sg") return triple[2];
  return triple[0];
}

export function serverActionUiLedgerMax(market: Market, max: number): string {
  if (market === "sg") return `You can have at most ${max} ledgers.`;
  if (market === "tw") return `最多 ${max} 本生意簿`;
  return `最多 ${max} 本生意簿`;
}

export function serverActionUiCategoryMax(
  market: Market,
  max: number
): string {
  if (market === "sg") return `Up to ${max} categories per ledger.`;
  if (market === "tw") return `每本生意簿最多 ${max} 個分類`;
  return `每本生意簿最多 ${max} 個分類`;
}
