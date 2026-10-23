"use client";

import { useState, useTransition } from "react";

// Two-step destructive button: first click asks, second click does it.
export default function ConfirmButton({
  label,
  confirmLabel = "Yes, delete",
  onConfirm,
  small = false,
}: {
  label: string;
  confirmLabel?: string;
  onConfirm: () => Promise<{ error?: string } | void>;
  small?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const size = small ? "h-7 px-3 text-xs" : "h-9 px-4 text-sm";

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className={`inline-flex items-center rounded-full font-medium text-[var(--negative)] hover:bg-black/[.04] dark:hover:bg-white/[.06] ${size}`}
      >
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await onConfirm();
            if (result && "error" in result && result.error) setError(result.error);
            setAsking(false);
          })
        }
        className={`inline-flex items-center rounded-full bg-[var(--negative)] font-medium text-white disabled:opacity-60 ${size}`}
      >
        {pending ? "Deleting…" : confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className={`inline-flex items-center rounded-full font-medium text-[var(--text-secondary)] ${size}`}
      >
        Cancel
      </button>
      {error && <span className="text-xs text-[var(--negative)]">{error}</span>}
    </span>
  );
}
