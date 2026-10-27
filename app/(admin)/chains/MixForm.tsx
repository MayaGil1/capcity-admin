"use client";

import { useActionState } from "react";
import { buttonSecondary, input } from "@/components/ui";
import { updateMix } from "./actions";

export default function MixForm({ chainId, count }: { chainId: number; count: number }) {
  const [state, action, pending] = useActionState(updateMix.bind(null, chainId), {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <label className="text-sm text-[var(--text-secondary)]" htmlFor={`mix-${chainId}`}>
        Captions per post
      </label>
      <input
        id={`mix-${chainId}`}
        name="caption_count"
        type="number"
        min={0}
        max={10}
        defaultValue={count}
        className={`${input} w-20`}
      />
      <button disabled={pending} className={buttonSecondary}>
        {pending ? "Saving…" : "Update mix"}
      </button>
      {state.error && <span className="text-sm text-[var(--negative)]">{state.error}</span>}
      {state.success && <span className="text-sm text-[var(--text-secondary)]">{state.success}</span>}
    </form>
  );
}
