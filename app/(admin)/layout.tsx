import Avatar from "@/components/Avatar";
import AdminNav from "@/components/AdminNav";
import { displayName, requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  const name = displayName(profile);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
      <aside className="flex flex-col gap-4 border-b border-black/[.08] px-4 py-4 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-r md:border-b-0 md:py-6 dark:border-white/[.1]">
        <div className="flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 text-xs font-bold text-white">
            Cc
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">CapCity</p>
            <p className="text-xs text-[var(--text-secondary)]">Admin</p>
          </div>
        </div>
        <AdminNav />
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 px-2 md:mt-auto md:flex-col md:items-start">
          <a
            href="https://hello-world-iota-gilt.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--text-secondary)] hover:underline"
          >
            Open CapCity ↗
          </a>
          <div className="flex items-center gap-2">
            <Avatar url={profile.avatar_url} name={name} size={28} />
            <span className="truncate text-sm">{name}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-xs text-[var(--text-secondary)] hover:underline">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 md:py-8">{children}</main>
    </div>
  );
}
