import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSnapProvider } from "@/components/app/AppSnapContext";
import { AppReceiptSnapFab } from "@/components/app/AppReceiptSnapFab";
import {
  canWriteSubscription,
  type ProfileRow,
} from "@/lib/access";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let snapEnabled = false;
  let defaultLedgerId: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "subscription_status, trial_ends_at, current_period_end, stripe_customer_id"
      )
      .eq("id", user.id)
      .maybeSingle();

    const p = profile as ProfileRow | null;
    const canWrite = canWriteSubscription(p);

    const { data: ledgers } = await supabase
      .from("ledgers")
      .select("id")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1);

    defaultLedgerId = ledgers?.[0]?.id ?? null;
    snapEnabled = canWrite && !!defaultLedgerId;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={user?.email} />
      <AppSnapProvider
        snapEnabled={snapEnabled}
        defaultLedgerId={defaultLedgerId}
      >
        {children}
        <Suspense fallback={null}>
          <AppReceiptSnapFab />
        </Suspense>
      </AppSnapProvider>
    </div>
  );
}
