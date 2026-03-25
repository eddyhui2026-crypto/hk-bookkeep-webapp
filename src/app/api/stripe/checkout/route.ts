import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";
import { getMarketFromEnv, marketFromHost, type Market } from "@/lib/market";
import { getOriginFromApiRequest } from "@/lib/request-site";
import { stripePriceIdForPlan } from "@/lib/stripe-prices";

export async function POST(request: Request) {
  try {
    const { price } = (await request.json()) as { price?: "monthly" | "yearly" };
    const env = getServerEnv();
    const reqUrl = new URL(request.url);
    const market: Market = marketFromHost(reqUrl.host) ?? getMarketFromEnv();
    const plan = price === "yearly" ? "yearly" : "monthly";
    const priceId = stripePriceIdForPlan(market, plan, env);
    if (!priceId) {
      const hint =
        market === "hk"
          ? "未設定 STRIPE_PRICE_MONTHLY / STRIPE_PRICE_YEARLY"
          : market === "tw"
            ? "未設定 STRIPE_PRICE_MONTHLY_TW / STRIPE_PRICE_YEARLY_TW"
            : "未設定 STRIPE_PRICE_MONTHLY_SG / STRIPE_PRICE_YEARLY_SG";
      return NextResponse.json({ error: hint }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id as string | undefined;
    const stripe = getStripe();

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    const origin = getOriginFromApiRequest(request);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=cancel`,
      client_reference_id: user.id,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      payment_method_collection: "if_required",
    });

    if (!session.url) {
      return NextResponse.json({ error: "無法建立結帳連結" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "錯誤" },
      { status: 500 }
    );
  }
}
