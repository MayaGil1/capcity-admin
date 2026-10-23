import "server-only";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_superadmin: boolean;
};

// Every admin page and server action calls this first. Logged-out visitors go to /login;
// logged-in users without profiles.is_superadmin = true go to /denied.
// Only after that check do we hand out the secret-key client that bypasses RLS.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, avatar_url, is_superadmin")
    .eq("id", user.id)
    .single<AdminProfile>();

  if (!profile?.is_superadmin) redirect("/denied");

  return { user, profile, db: createAdminClient() };
}

export function displayName(p: { first_name: string | null; last_name: string | null; email?: string | null }) {
  return [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email || "Unknown";
}
