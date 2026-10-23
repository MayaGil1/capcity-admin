"use client";

import { useActionState, useState, useTransition } from "react";
import ConfirmButton from "@/components/ConfirmButton";
import { buttonPrimary, buttonSecondary, input } from "@/components/ui";
import {
  deleteCaption,
  deletePost,
  generateMoreCaptions,
  updateCaption,
  updatePost,
  type ActionState,
} from "../actions";

function Status({ state }: { state: ActionState }) {
  if (state.error) return <span className="text-xs text-[var(--negative)]">{state.error}</span>;
  if (state.success) return <span className="text-xs text-[var(--text-secondary)]">✓ {state.success}</span>;
  return null;
}

export function PostEditor({ postId, theme, note }: { postId: number; theme: string; note: string | null }) {
  const [state, action, pending] = useActionState(updatePost.bind(null, postId), {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
        Theme
        <input name="theme" defaultValue={theme} maxLength={60} required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
        Uploader&apos;s context for the AI
        <input name="note" defaultValue={note ?? ""} maxLength={200} className={input} />
      </label>
      <div className="flex items-center gap-3">
        <button className={buttonSecondary} disabled={pending}>{pending ? "Saving…" : "Save post"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function DeletePostButton({ postId }: { postId: number }) {
  return <ConfirmButton label="Delete post" confirmLabel="Delete post + votes" onConfirm={() => deletePost(postId)} />;
}

export function GenerateMoreButton({ postId }: { postId: number }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ActionState>({});
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setState(await generateMoreCaptions(postId)))}
        className={buttonPrimary}
      >
        {pending ? "Gemini is writing…" : "✨ Generate 5 more"}
      </button>
      <Status state={state} />
    </span>
  );
}

export function CaptionEditor({
  caption,
}: {
  caption: { id: number; text: string; style: string; upvotes: number; downvotes: number; score: number; model: string };
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateCaption.bind(null, caption.id), {});

  return (
    <li className="border-t border-black/[.05] py-3 first:border-t-0 dark:border-white/[.06]">
      {editing ? (
        <form
          action={async (fd) => {
            await action(fd);
            setEditing(false);
          }}
          className="flex flex-col gap-2"
        >
          <textarea name="text" defaultValue={caption.text} maxLength={200} rows={2} required className={input} />
          <div className="flex flex-wrap items-center gap-2">
            <input name="style" defaultValue={caption.style} maxLength={40} required className={`${input} w-48`} />
            <button className={buttonPrimary} disabled={pending}>{pending ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => setEditing(false)} className={buttonSecondary}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-4">
          <div className="w-14 shrink-0 text-center">
            <p className="text-lg font-semibold tabular-nums">{caption.score}</p>
            <p className="text-[10px] text-[var(--text-secondary)] tabular-nums">
              {caption.upvotes}▲ {caption.downvotes}▼
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm">{caption.text}</p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {caption.style} · {caption.model}
            </p>
            <Status state={state} />
          </div>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="h-7 rounded-full px-3 text-xs font-medium hover:bg-black/[.04] dark:hover:bg-white/[.06]"
            >
              Edit
            </button>
            <ConfirmButton small label="Delete" onConfirm={() => deleteCaption(caption.id)} />
          </div>
        </div>
      )}
    </li>
  );
}
