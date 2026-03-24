import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={user?.email} />
      {children}
    </div>
  );
}
