"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { purgeAuthUserAndRelatedData } from "@/lib/account-purge";

const PHRASE_ZH = "刪除我的帳號";
const PHRASE_EN = "DELETE MY ACCOUNT";

export type DeleteAccountState = { error: string; detail?: string } | null;

export async function deleteMyAccount(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const phrase = String(formData.get("phrase") ?? "").trim();
  const localeRaw = String(formData.get("locale") ?? "zh");
  const locale = localeRaw === "en" ? "en" : "zh";
  const expected = locale === "en" ? PHRASE_EN : PHRASE_ZH;
  if (phrase !== expected) {
    return { error: "phrase" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "auth" };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "config" };
  }

  const purge = await purgeAuthUserAndRelatedData(admin, user.id);
  if (!purge.ok) {
    if (purge.step === "storage") {
      return { error: "storage", detail: purge.message };
    }
    return { error: "delete_user", detail: purge.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}
