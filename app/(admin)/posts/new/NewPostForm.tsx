"use client";

import { useState } from "react";
import { buttonPrimary, input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { createPost } from "../actions";

async function toJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.85),
  );
}

export default function NewPostForm({ userId, defaultTheme }: { userId: string; defaultTheme: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [theme, setTheme] = useState(defaultTheme);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "generating">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setStatus("uploading");
    let jpeg: Blob;
    try {
      jpeg = await toJpeg(file);
    } catch {
      setError("Unsupported image. Try a JPG or PNG.");
      setStatus("idle");
      return;
    }
    const path = `${userId}/${Date.now()}.jpg`;
    const { error: uploadError } = await createClient()
      .storage.from("posts")
      .upload(path, jpeg, { contentType: "image/jpeg" });
    if (uploadError) {
      setError(uploadError.message);
      setStatus("idle");
      return;
    }
    setStatus("generating");
    const result = await createPost(path, theme, note);
    if (result?.error) {
      setError(result.error);
      setStatus("idle");
    }
  }

  const busy = status !== "idle";

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/[.15] bg-[var(--surface-1)] text-sm text-[var(--text-secondary)] dark:border-white/[.2]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-contain" />
        ) : (
          "Click to choose a photo"
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f);
              setPreview(URL.createObjectURL(f));
            }
          }}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Theme
        <input value={theme} onChange={(e) => setTheme(e.target.value)} maxLength={60} className={input} disabled={busy} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Context for the AI (optional)
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className={input} disabled={busy} />
      </label>
      {error && <p className="text-sm text-[var(--negative)]">{error}</p>}
      <button type="submit" disabled={!file || busy} className={`${buttonPrimary} self-start`}>
        {status === "uploading" ? "Uploading…" : status === "generating" ? "Gemini is writing captions…" : "Generate post"}
      </button>
    </form>
  );
}
