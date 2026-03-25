import type { Market } from "@/lib/market";
import { getServerEnv } from "@/lib/env";

type ServerEnv = ReturnType<typeof getServerEnv>;

export function stripePriceIdForPlan(
  market: Market,
  plan: "monthly" | "yearly",
  env: ServerEnv
): string | undefined {
  const y = plan === "yearly";
  if (market === "tw") {
    const id = y ? env.STRIPE_PRICE_YEARLY_TW : env.STRIPE_PRICE_MONTHLY_TW;
    return id || undefined;
  }
  if (market === "sg") {
    const id = y ? env.STRIPE_PRICE_YEARLY_SG : env.STRIPE_PRICE_MONTHLY_SG;
    return id || undefined;
  }
  const id = y ? env.STRIPE_PRICE_YEARLY : env.STRIPE_PRICE_MONTHLY;
  return id || undefined;
}
