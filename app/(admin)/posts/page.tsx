import Link from "next/link";
import { PageHeader, SearchForm, buttonPrimary } from "@/components/ui";
import { displayName, requireAdmin } from "@/lib/admin";
import { formatDate, loadAll } from "@/lib/data";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { db } = await requireAdmin();
  const { q } = await searchParams;
  const { profiles, posts, captions } = await loadAll(db);

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const captionsByPost = new Map<number, typeof captions>();
  for (const c of captions) captionsByPost.set(c.post_id, [...(captionsByPost.get(c.post_id) ?? []), c]);

  const needle = q?.trim().toLowerCase();
  const rows = posts
    .filter((p) => {
      if (!needle) return true;
      const text = (captionsByPost.get(p.id) ?? []).map((c) => c.text).join(" ");
      return `${p.theme} ${p.note ?? ""} ${text}`.toLowerCase().includes(needle);
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <>
      <PageHeader
        title="AI media"
        description={`${posts.length} photos · ${captions.length} AI captions`}
        action={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <SearchForm q={q} placeholder="Search captions or themes" />
            <Link href="/posts/new" className={buttonPrimary}>
              + New post
            </Link>
          </div>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((post) => {
          const caps = [...(captionsByPost.get(post.id) ?? [])].sort((a, b) => b.score - a.score);
          const author = profileById.get(post.user_id);
          return (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="block overflow-hidden rounded-2xl border border-black/[.07] bg-[var(--surface-1)] hover:border-black/[.2] dark:border-white/[.08] dark:hover:border-white/[.25]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt="" className="aspect-[4/3] w-full bg-zinc-100 object-cover dark:bg-zinc-800" />
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-medium">“{caps[0]?.text ?? "No captions"}”</p>
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    {post.theme} · {caps.length} captions · net {post.score}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {author ? displayName(author) : "Deleted user"} · {formatDate(post.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No posts found.</p>}
    </>
  );
}
