import type { Market } from "@/lib/market";
import type { Locale, MessageTree } from "./messages";
import { hkMessages } from "./messages";
import { marketPatches } from "./market-overrides";

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
    return deepMergeMessageTree(
      hkMessages.zh,
      marketPatches.tw.zh as unknown
    ) as MessageTree;
  }
  if (market === "sg") {
    if (locale === "en") {
      return deepMergeMessageTree(
        hkMessages.en,
        marketPatches.sg.en as unknown
      ) as MessageTree;
    }
    return deepMergeMessageTree(
      hkMessages.zh,
      marketPatches.sg.zh as unknown
    ) as MessageTree;
  }
  return hkMessages[locale] as MessageTree;
}
