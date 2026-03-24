import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountDeletePanel } from "@/components/app/AccountDeletePanel";

export const metadata = {
  title: "帳號",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/account");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <AccountDeletePanel email={user.email ?? ""} />
    </div>
  );
}
