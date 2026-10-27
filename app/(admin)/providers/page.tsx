import ResourcePage from "@/components/ResourcePage";
import { requireAdmin } from "@/lib/admin";

export default async function ProvidersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { db } = await requireAdmin();
  const { q } = await searchParams;
  const { data: models } = await db.from("llm_models").select("llm_provider_id");
  const modelCount: Record<number, number> = {};
  for (const m of models ?? []) modelCount[m.llm_provider_id] = (modelCount[m.llm_provider_id] ?? 0) + 1;

  return (
    <ResourcePage
      resource="providers"
      title="LLM providers"
      description="Companies whose models CapCity can call. The code supports the slug “google”"
      q={q}
      extraColumns={(rows) => [
        { label: "Models", values: Object.fromEntries(rows.map((r) => [r.id, modelCount[r.id] ?? 0])) },
      ]}
    />
  );
}
