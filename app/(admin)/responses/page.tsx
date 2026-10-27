import Link from "next/link";
import ResponseCard, { RESPONSE_SELECT, type ResponseRow } from "@/components/ResponseCard";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";

const PAGE = 25;

export default async function ResponsesPage({ searchParams }: { searchParams: Promise<{ failed?: string; page?: string }> }) {
  const { db } = await requireAdmin();
  const { failed, page: rawPage } = await searchParams;
  const onlyFailed = failed === "1";
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  let query = db
    .from("llm_responses")
    .select(RESPONSE_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (onlyFailed) query = query.not("error", "is", null);
  const { data, count } = await query;
  const rows = (data ?? []) as unknown as ResponseRow[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const href = (p: number) => `/responses?${onlyFailed ? "failed=1&" : ""}page=${p}`;

  return (
    <>
      <PageHeader
        title="LLM responses"
        description={`Every model call with its prompt, output and timing · ${count ?? 0} ${onlyFailed ? "failed" : "total"} · read-only`}
        action={
          <Link href={onlyFailed ? "/responses" : "/responses?failed=1"} className="text-sm text-[var(--text-secondary)] hover:underline">
            {onlyFailed ? "Show all" : "Show failures only"}
          </Link>
        }
      />
      <ol className="flex flex-col gap-3">
        {rows.map((r) => (
          <ResponseCard key={r.id} r={r} showRequest />
        ))}
      </ol>
      {rows.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No LLM calls yet.</p>}
      {pages > 1 && (
        <nav className="mt-6 flex items-center gap-3 text-sm">
          {page > 1 && <Link href={href(page - 1)} className="hover:underline">← Newer</Link>}
          <span className="text-[var(--text-secondary)]">
            Page {page} of {pages}
          </span>
          {page < pages && <Link href={href(page + 1)} className="hover:underline">Older →</Link>}
        </nav>
      )}
    </>
  );
}
