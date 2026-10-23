import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DeniedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white p-8 text-center shadow-sm dark:border-white/[.12] dark:bg-zinc-900">
        <p className="text-4xl" aria-hidden>🔒</p>
        <h1 className="mt-3 text-2xl font-semibold text-black dark:text-zinc-50">Admins only</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You&apos;re signed in as <strong>{user.email}</strong>, but this account isn&apos;t a CapCity
          administrator.
        </p>
        <form action="/auth/signout" method="post" className="mt-6">
          <button className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background">
            Sign in with a different account
          </button>
        </form>
      </div>
    </main>
  );
}
