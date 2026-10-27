import Link from "next/link";
import { StatTile } from "@/components/charts";
import StatusBadge from "@/components/StatusBadge";
import { PageHeader, TableWrap, td, th } from "@/components/ui";
import { displayName, requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/data";

type RequestRow = {
  id: number;
  user_id: string | null;
  post_id: number | null;
  theme: string;
  source: string;
  status: string;
  error: string | null;
  caption_count: number;
  duration_ms: number | null;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null; email: string | null } | null;
};

const FILTERS = ["all", "succeeded", "failed", "running"] as const;

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { db } = await requireAdmin();
  const { status: rawStatus } = await searchParams;
  const status = FILTERS.find((f) => f === rawStatus) ?? "all";

  const { data } = await db
    .from("generation_requests")
    .select("id, user_id, post_id, theme, source, status, error, caption_count, duration_ms, created_at, profiles(first_name, last_name, email)")
    .order("created_at", { ascending: false })
    .limit(500);
  const all = (data ?? []) as unknown as RequestRow[];
  const rows = status === "all" ? all : all.filter((r) => r.status === status);

  const done = all.filter((r) => r.status !== "running");
  const ok = done.filter((r) => r.status === "succeeded");
  const avgSeconds = ok.length ? ok.reduce((s, r) => s + (r.duration_ms ?? 0), 0) / ok.length / 1000 : 0;

  return (
    <>
      <PageHeader title="Generation requests" description="Every time CapCity or an admin asked the AI for captions · read-only" />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatTile label="Requests (last 500)" value={all.length.toLocaleString()} />
        <StatTile label="Success rate" value={done.length ? `${Math.round((ok.length / done.length) * 100)}%` : "—"} />
        <StatTile label="Avg time to captions" value={ok.length ? `${avgSeconds.toFixed(1)}s` : "—"} />
      </div>
      <nav className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/requests" : `/requests?status=${f}`}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
              f === status ? "bg-foreground text-background" : "text-[var(--text-secondary)] hover:bg-black/[.05] dark:hover:bg-white/[.08]"
            }`}
          >
            {f}
          </Link>
        ))}
      </nav>
      <TableWrap>
        <thead>
          <tr>
            <th className={th}>#</th>
            <th className={th}>When</th>
            <th className={th}>User</th>
            <th className={th}>Source</th>
            <th className={th}>Status</th>
            <th className={`${th} text-right`}>Captions</th>
            <th className={`${th} text-right`}>Time</th>
            <th className={th}>Post</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={td}>
                <Link href={`/requests/${r.id}`} className="font-medium underline-offset-2 hover:underline">
                  {r.id}
                </Link>
              </td>
              <td className={`${td} whitespace-nowrap`}>{formatDate(r.created_at)}</td>
              <td className={td}>{r.profiles ? displayName(r.profiles) : "Deleted user"}</td>
              <td className={td}>{r.source}</td>
              <td className={td}>
                <StatusBadge status={r.status} />
                {r.error && <p className="mt-1 line-clamp-1 max-w-xs text-xs text-[var(--text-secondary)]">{r.error}</p>}
              </td>
              <td className={`${td} text-right tabular-nums`}>{r.caption_count}</td>
              <td className={`${td} text-right tabular-nums`}>{r.duration_ms !== null ? `${(r.duration_ms / 1000).toFixed(1)}s` : "—"}</td>
              <td className={td}>
                {r.post_id ? (
                  <Link href={`/posts/${r.post_id}`} className="hover:underline">
                    #{r.post_id}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className={`${td} text-center text-[var(--text-secondary)]`}>
                No requests yet. Post a photo in CapCity to create one.
              </td>
            </tr>
          )}
        </tbody>
      </TableWrap>
    </>
  );
}
