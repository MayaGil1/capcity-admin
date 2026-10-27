import ResourcePage from "@/components/ResourcePage";
import { requireAdmin } from "@/lib/admin";

export default async function ModelsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { db } = await requireAdmin();
  const { q } = await searchParams;
  const [{ data: providers }, { data: steps }, { data: responses }] = await Promise.all([
    db.from("llm_providers").select("id, name").order("name"),
    db.from("prompt_chain_steps").select("llm_model_id"),
    db.from("llm_responses").select("llm_model_id, error, duration_ms").order("created_at", { ascending: false }).limit(2000),
  ]);

  const stepCount: Record<number, number> = {};
  for (const s of steps ?? []) stepCount[s.llm_model_id] = (stepCount[s.llm_model_id] ?? 0) + 1;
  const calls: Record<number, { n: number; failed: number; ms: number }> = {};
  for (const r of responses ?? []) {
    if (r.llm_model_id === null) continue;
    const c = (calls[r.llm_model_id] ??= { n: 0, failed: 0, ms: 0 });
    c.n += 1;
    c.ms += r.duration_ms;
    if (r.error) c.failed += 1;
  }

  return (
    <ResourcePage
      resource="models"
      title="LLM models"
      description="Models the prompt chain steps can use. Inactive models are skipped, even as fallbacks"
      q={q}
      options={{ llm_provider_id: (providers ?? []).map((p) => ({ value: p.id, label: p.name })) }}
      extraColumns={(rows) => [
        { label: "Used by steps", values: Object.fromEntries(rows.map((r) => [r.id, stepCount[r.id] ?? 0])) },
        {
          label: "Recent calls",
          values: Object.fromEntries(
            rows.map((r) => {
              const c = calls[r.id];
              return [r.id, c ? `${c.n} · ${c.failed} failed · avg ${(c.ms / c.n / 1000).toFixed(1)}s` : "None yet"];
            }),
          ),
        },
      ]}
    />
  );
}
