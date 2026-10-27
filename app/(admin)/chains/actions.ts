"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export type MixState = { error?: string; success?: string };

// UPDATE how many captions per post come from one prompt chain.
export async function updateMix(chainId: number, _prev: MixState, formData: FormData): Promise<MixState> {
  const { user, db } = await requireAdmin();
  const count = Number(formData.get("caption_count"));
  if (!Number.isInteger(chainId)) return { error: "Invalid chain." };
  if (!Number.isInteger(count) || count < 0 || count > 10) return { error: "Use a whole number from 0 to 10." };

  if (count === 0) {
    const { data: others } = await db.from("prompt_chain_mix").select("caption_count").neq("prompt_chain_id", chainId);
    if (!(others ?? []).some((m) => m.caption_count > 0)) {
      return { error: "At least one chain needs captions, or CapCity can't generate anything." };
    }
  }

  const { error } = await db
    .from("prompt_chain_mix")
    .upsert(
      { prompt_chain_id: chainId, caption_count: count, updated_at: new Date().toISOString(), updated_by: user.id },
      { onConflict: "prompt_chain_id" },
    );
  if (error) return { error: error.message };
  revalidatePath("/chains");
  return { success: "Saved." };
}
