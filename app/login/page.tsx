import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GoogleSignInButton from "./GoogleSignInButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.12] dark:bg-zinc-900">
        <p className="text-sm font-semibold tracking-wide text-[var(--series-1)] uppercase">CapCity</p>
        <h1 className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">Admin panel</h1>
        <p className="mt-2 mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Restricted to CapCity administrators. Sign in with your Google account.
        </p>
        {error && (
          <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            Sign-in failed. Please try again.
          </p>
        )}
        <GoogleSignInButton />
      </div>
    </main>
  );
}
