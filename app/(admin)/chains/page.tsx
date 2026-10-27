import { Card } from "@/components/charts";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import MixForm from "./MixForm";

type Step = {
  id: number;
  order_by: number;
  description: string;
  input_type: string;
  output_type: string;
  temperature: number | null;
  system_prompt: string;
  user_prompt: string;
  llm_models: { name: string; provider_model_id: string } | null;
};
type Chain = {
  id: number;
  slug: string;
  description: string;
  prompt_chain_steps: Step[];
  prompt_chain_mix: { caption_count: number; updated_at: string } | null;
};

const pre = "max-h-60 overflow-auto rounded-lg bg-[var(--neutral)] p-3 text-xs whitespace-pre-wrap";

export default async function ChainsPage() {
  const { db } = await requireAdmin();
  const [{ data }, { data: captions }] = await Promise.all([
    db
      .from("prompt_chains")
      .select(
        "id, slug, description, prompt_chain_mix(caption_count, updated_at), prompt_chain_steps(id, order_by, description, input_type, output_type, temperature, system_prompt, user_prompt, llm_models(name, provider_model_id))",
      )
      .order("id"),
    db.from("captions").select("prompt_chain_id, score").not("prompt_chain_id", "is", null).limit(10000),
  ]);
  const chains = (data ?? []) as unknown as Chain[];

  // Which chain writes funnier captions? Compare the votes their captions got.
  const stats: Record<number, { n: number; score: number }> = {};
  for (const c of captions ?? []) {
    const s = (stats[c.prompt_chain_id] ??= { n: 0, score: 0 });
    s.n += 1;
    s.score += c.score;
  }
  const total = chains.reduce((sum, c) => sum + (c.prompt_chain_mix?.caption_count ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Prompt chains"
        description={`Each new post gets ${total} captions: the mix below says how many come from each chain`}
      />
      <div className="flex flex-col gap-4">
        {chains.map((chain) => {
          const s = stats[chain.id];
          const steps = [...chain.prompt_chain_steps].sort((a, b) => a.order_by - b.order_by);
          return (
            <Card
              key={chain.id}
              title={chain.slug}
              subtitle={`${chain.description} · ${s ? `${s.n} captions so far, avg net score ${(s.score / s.n).toFixed(2)}` : "no captions yet"}`}
            >
              <MixForm chainId={chain.id} count={chain.prompt_chain_mix?.caption_count ?? 0} />
              <ol className="mt-4 flex flex-col gap-3">
                {steps.map((step) => (
                  <li key={step.id} className="rounded-xl border border-black/[.07] p-3 dark:border-white/[.08]">
                    <p className="text-sm font-medium">
                      Step {step.order_by}: {step.description}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      {step.llm_models?.name ?? "Missing model"} ({step.llm_models?.provider_model_id}) · input{" "}
                      {step.input_type.replaceAll("_", " ")} → {step.output_type} · temperature {step.temperature ?? "default"}
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-[var(--text-secondary)]">Prompts</summary>
                      <p className="mt-2 text-xs font-medium">System</p>
                      <pre className={pre}>{step.system_prompt}</pre>
                      <p className="mt-2 text-xs font-medium">User (template)</p>
                      <pre className={pre}>{step.user_prompt}</pre>
                    </details>
                  </li>
                ))}
              </ol>
            </Card>
          );
        })}
        {chains.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">No chains yet. Run supabase/observability.sql in CapCity.</p>
        )}
      </div>
    </>
  );
}
