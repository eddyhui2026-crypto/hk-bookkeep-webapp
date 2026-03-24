import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const env = getServerEnv();
  const whSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
  }

  const body = await request.text();
  const h = await headers();
  const sig = h.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        const s = sub as unknown as {
          trial_end: number | null;
          current_period_end: number;
        };
        const trialEnd = s.trial_end
          ? new Date(s.trial_end * 1000).toISOString()
          : null;
        const periodEnd = s.current_period_end
          ? new Date(s.current_period_end * 1000).toISOString()
          : null;

        const status =
          event.type === "customer.subscription.deleted"
            ? "canceled"
            : sub.status;

        await admin
          .from("profiles")
          .update({
            subscription_status: status,
            trial_ends_at: trialEnd,
            current_period_end: periodEnd,
            stripe_customer_id: sub.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        if (uid && typeof session.customer === "string") {
          await admin
            .from("profiles")
            .update({
              stripe_customer_id: session.customer,
              updated_at: new Date().toISOString(),
            })
            .eq("id", uid);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
