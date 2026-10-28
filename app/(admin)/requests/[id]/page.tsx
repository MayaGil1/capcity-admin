import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/charts";
import ResponseCard, { RESPONSE_SELECT, type ResponseRow } from "@/components/ResponseCard";
import StatusBadge, { effectiveStatus } from "@/components/StatusBadge";
import { displayName, requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/data";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { db } = await requireAdmin();
  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId)) notFound();

  const { data: request } = await db
    .from("generation_requests")
    .select("*, profiles(first_name, last_name, email)")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) notFound();

  const [{ data: responses }, { data: captions }] = await Promise.all([
    db.from("llm_responses").select(RESPONSE_SELECT).eq("generation_request_id", requestId).order("created_at"),
    db.from("captions").select("id, text, style, score, prompt_chains(slug)").eq("generation_request_id", requestId).order("id"),
  ]);
  const imageUrl = db.storage.from("posts").getPublicUrl(request.image_path).data.publicUrl;
  const calls = (responses ?? []) as unknown as ResponseRow[];

  return (
    <>
      <Link href="/requests" className="text-sm text-[var(--text-secondary)] hover:underline">
        ← Generation requests
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Request #{request.id}</h1>
        <StatusBadge status={effectiveStatus(request.status, request.created_at)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="w-full rounded-2xl bg-zinc-100 object-contain dark:bg-zinc-800" />
          <Card title="Details">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-[var(--text-secondary)]">User</dt>
              <dd>{request.profiles ? displayName(request.profiles) : "Deleted user"}</dd>
              <dt className="text-[var(--text-secondary)]">Source</dt>
              <dd>{request.source}</dd>
              <dt className="text-[var(--text-secondary)]">Theme</dt>
              <dd>{request.theme}</dd>
              <dt className="text-[var(--text-secondary)]">Note</dt>
              <dd>{request.note ?? "—"}</dd>
              <dt className="text-[var(--text-secondary)]">Started</dt>
              <dd>{formatDate(request.created_at)}</dd>
              <dt className="text-[var(--text-secondary)]">Took</dt>
              <dd>{request.duration_ms !== null ? `${(request.duration_ms / 1000).toFixed(1)}s` : "—"}</dd>
              <dt className="text-[var(--text-secondary)]">Post</dt>
              <dd>
                {request.post_id ? (
                  <Link href={`/posts/${request.post_id}`} className="hover:underline">
                    #{request.post_id}
                  </Link>
                ) : (
                  "Not saved"
                )}
              </dd>
            </dl>
            {request.error && <p className="mt-3 text-sm text-[var(--negative)]">{request.error}</p>}
          </Card>
          <Card title={`Captions (${captions?.length ?? 0})`}>
            <ul className="flex flex-col gap-2 text-sm">
              {(captions ?? []).map((c) => (
                <li key={c.id}>
                  “{c.text}”
                  <span className="block text-xs text-[var(--text-secondary)]">
                    {c.style} · {(c.prompt_chains as unknown as { slug: string } | null)?.slug ?? "—"} · net {c.score}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">LLM calls ({calls.length})</h2>
          <ol className="flex flex-col gap-3">
            {calls.map((r) => (
              <ResponseCard key={r.id} r={r} />
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
