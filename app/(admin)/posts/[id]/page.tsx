import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/charts";
import { displayName, requireAdmin } from "@/lib/admin";
import type { CaptionRow, PostRow } from "@/lib/data";
import { formatDate } from "@/lib/data";
import { CaptionEditor, DeletePostButton, GenerateMoreButton, PostEditor } from "./editors";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { db } = await requireAdmin();
  const { id } = await params;

  const { data: post } = await db
    .from("posts")
    .select("id, user_id, image_url, image_path, theme, note, score, created_at")
    .eq("id", Number(id))
    .maybeSingle<PostRow>();
  if (!post) notFound();

  const [{ data: captions }, { data: author }, { count: voteCount }] = await Promise.all([
    db
      .from("captions")
      .select("id, post_id, text, style, model, prompt, upvotes, downvotes, score, created_at")
      .eq("post_id", post.id)
      .order("score", { ascending: false })
      .order("id"),
    db.from("profiles").select("first_name, last_name, email").eq("id", post.user_id).maybeSingle(),
    db.from("votes").select("id, captions!inner(post_id)", { count: "exact", head: true }).eq("captions.post_id", post.id),
  ]);
  const caps = (captions ?? []) as CaptionRow[];
  const prompts = [...new Set(caps.map((c) => c.prompt))];

  return (
    <>
      <Link href="/posts" className="text-sm text-[var(--text-secondary)] hover:underline">← AI media</Link>
      <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Post #{post.id}</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {author ? displayName(author) : "Deleted user"} · {formatDate(post.created_at)} · {voteCount ?? 0} votes · net {post.score}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`https://hello-world-iota-gilt.vercel.app/p/${post.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:underline">
            View on CapCity ↗
          </a>
          <DeletePostButton postId={post.id} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="" className="w-full rounded-2xl bg-zinc-100 object-contain dark:bg-zinc-800" />
          <Card title="Post details">
            <PostEditor postId={post.id} theme={post.theme} note={post.note} />
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card title={`AI captions (${caps.length})`} subtitle="Sorted by net score">
            <ul>
              {caps.map((c) => (
                <CaptionEditor key={c.id} caption={c} />
              ))}
            </ul>
            <div className="mt-4">
              <GenerateMoreButton postId={post.id} />
            </div>
          </Card>
          <Card title="Prompt sent to the AI" subtitle={prompts.length > 1 ? `${prompts.length} different prompts used` : undefined}>
            {prompts.map((p) => (
              <pre key={p} className="mb-2 max-h-64 overflow-auto rounded-lg bg-[var(--neutral)] p-3 text-xs whitespace-pre-wrap">{p}</pre>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
