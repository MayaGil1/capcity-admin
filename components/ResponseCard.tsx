import Link from "next/link";
import { formatDate } from "@/lib/data";

export type ResponseRow = {
  id: number;
  generation_request_id: number;
  provider_model_id: string;
  system_prompt: string;
  user_prompt: string;
  temperature: number | null;
  response: string | null;
  http_status: number | null;
  error: string | null;
  duration_ms: number;
  created_at: string;
  prompt_chains: { slug: string } | null;
  prompt_chain_steps: { order_by: number; description: string } | null;
};

export const RESPONSE_SELECT =
  "id, generation_request_id, provider_model_id, system_prompt, user_prompt, temperature, response, http_status, error, duration_ms, created_at, prompt_chains(slug), prompt_chain_steps(order_by, description)";

const pre = "mt-1 max-h-72 overflow-auto rounded-lg bg-[var(--neutral)] p-3 text-xs whitespace-pre-wrap break-words";

function pretty(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

// One model call: what was sent, what came back, how long it took.
export default function ResponseCard({ r, showRequest = false }: { r: ResponseRow; showRequest?: boolean }) {
  const failed = Boolean(r.error);
  return (
    <li className="rounded-2xl border border-black/[.07] bg-[var(--surface-1)] p-4 dark:border-white/[.08]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">
          {r.prompt_chains?.slug ?? "deleted chain"} · step {r.prompt_chain_steps?.order_by ?? "?"}
          {r.prompt_chain_steps ? `: ${r.prompt_chain_steps.description}` : ""}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          {formatDate(r.created_at)}
          {showRequest && (
            <>
              {" · "}
              <Link href={`/requests/${r.generation_request_id}`} className="underline-offset-2 hover:underline">
                request #{r.generation_request_id}
              </Link>
            </>
          )}
        </p>
      </div>
      <p className={`mt-1 text-xs ${failed ? "text-[var(--negative)]" : "text-[var(--text-secondary)]"}`}>
        {failed ? "✕ Failed" : "✓ OK"} · {r.provider_model_id} · HTTP {r.http_status ?? "—"} · {(r.duration_ms / 1000).toFixed(1)}s ·
        temperature {r.temperature ?? "default"}
      </p>
      {r.error && <pre className={pre}>{r.error}</pre>}
      {r.response && (
        <>
          <p className="mt-3 text-xs font-medium">Response</p>
          <pre className={pre}>{pretty(r.response)}</pre>
        </>
      )}
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-[var(--text-secondary)]">Prompts sent</summary>
        <p className="mt-2 text-xs font-medium">System</p>
        <pre className={pre}>{r.system_prompt}</pre>
        <p className="mt-2 text-xs font-medium">User</p>
        <pre className={pre}>{r.user_prompt}</pre>
      </details>
    </li>
  );
}
