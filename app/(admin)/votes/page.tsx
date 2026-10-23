import Link from "next/link";
import { StatTile } from "@/components/charts";
import { PageHeader, TableWrap, td, th } from "@/components/ui";
import { displayName, requireAdmin } from "@/lib/admin";
import { formatDate, loadAll } from "@/lib/data";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "up", label: "Upvotes ▲" },
  { key: "down", label: "Downvotes ▼" },
] as const;

export default async function VotesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { db } = await requireAdmin();
  const { filter = "all" } = await searchParams;
  const { profiles, posts, captions, votes } = await loadAll(db);

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const captionById = new Map(captions.map((c) => [c.id, c]));
  const postById = new Map(posts.map((p) => [p.id, p]));
  const up = votes.filter((v) => v.value === 1).length;

  const rows = votes
    .filter((v) => filter === "all" || (filter === "up" ? v.value === 1 : v.value === -1))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 300);

  return (
    <>
      <PageHeader title="Votes" description="Every upvote and downvote · read-only" />
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile label="Total votes" value={votes.length} />
        <StatTile label="Upvotes" value={up} />
        <StatTile label="Downvotes" value={votes.length - up} />
      </div>
      <nav className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/votes" : `/votes?filter=${f.key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === f.key ? "bg-foreground text-background" : "text-[var(--text-secondary)] hover:bg-black/[.05] dark:hover:bg-white/[.08]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      <TableWrap>
        <thead>
          <tr>
            <th className={th}>Vote</th>
            <th className={th}>Voter</th>
            <th className={th}>Caption</th>
            <th className={th}>Photo</th>
            <th className={th}>When</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => {
            const caption = captionById.get(v.caption_id);
            const post = caption && postById.get(caption.post_id);
            const voter = profileById.get(v.user_id);
            return (
              <tr key={v.id}>
                <td className={td}>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      color: v.value === 1 ? "var(--series-1)" : "var(--negative)",
                      background: "var(--neutral)",
                    }}
                  >
                    {v.value === 1 ? "▲ Up" : "▼ Down"}
                  </span>
                </td>
                <td className={td}>{voter ? displayName(voter) : "Deleted user"}</td>
                <td className={`${td} max-w-sm`}>
                  <p className="line-clamp-2">{caption?.text}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{caption?.style}</p>
                </td>
                <td className={td}>
                  {post && (
                    <Link href={`/posts/${post.id}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                    </Link>
                  )}
                </td>
                <td className={`${td} whitespace-nowrap text-[var(--text-secondary)]`}>{formatDate(v.updated_at)}</td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className={`${td} text-center text-[var(--text-secondary)]`}>No votes yet.</td>
            </tr>
          )}
        </tbody>
      </TableWrap>
    </>
  );
}
