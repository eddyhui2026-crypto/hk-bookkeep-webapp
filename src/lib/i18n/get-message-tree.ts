import type { Market } from "@/lib/market";
import type { Locale, MessageTree } from "./messages";
import { hkMessages } from "./messages";
import { sgEnPatchForms } from "./sg-en-patch-forms";
import { sgEnPatchLedger } from "./sg-en-patch-ledger";
import { sgEnPatchMarketing } from "./sg-en-patch-marketing";
import { sgZhPatchForms } from "./sg-zh-patch-forms";
import { sgZhPatchLedger } from "./sg-zh-patch-ledger";
import { sgZhPatchMarketing } from "./sg-zh-patch-marketing";
import { twI18nPatchForms } from "./tw-i18n-patch-forms";
import { twI18nPatchLedger } from "./tw-i18n-patch-ledger";
import { twI18nPatchMarketing } from "./tw-i18n-patch-marketing";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function deepMergeMessageTree(base: unknown, patch: unknown): unknown {
  if (!isPlainObject(patch)) return patch ?? base;
  if (!isPlainObject(base)) return patch;
  const out: Record<string, unknown> = { ...base };
  for (const [k, pv] of Object.entries(patch)) {
    if (pv === undefined) continue;
    const bv = out[k];
    if (isPlainObject(pv) && isPlainObject(bv)) {
      out[k] = deepMergeMessageTree(bv, pv);
    } else {
      out[k] = pv;
    }
  }
  return out;
}

export function getMessageTree(market: Market, locale: Locale): MessageTree {
  if (market === "tw") {
    let tree: unknown = deepMergeMessageTree(hkMessages.zh, twI18nPatchMarketing);
    tree = deepMergeMessageTree(tree, twI18nPatchForms);
    tree = deepMergeMessageTree(tree, twI18nPatchLedger);
    return tree as MessageTree;
  }
  if (market === "sg") {
    if (locale === "en") {
      let tree: unknown = deepMergeMessageTree(hkMessages.en, sgEnPatchMarketing);
      tree = deepMergeMessageTree(tree, sgEnPatchForms);
      tree = deepMergeMessageTree(tree, sgEnPatchLedger);
      return tree as MessageTree;
    }
    let treeZh: unknown = deepMergeMessageTree(hkMessages.zh, sgZhPatchMarketing);
    treeZh = deepMergeMessageTree(treeZh, sgZhPatchForms);
    treeZh = deepMergeMessageTree(treeZh, sgZhPatchLedger);
    return treeZh as MessageTree;
  }
  return hkMessages[locale] as MessageTree;
}
