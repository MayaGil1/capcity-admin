import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_superadmin: boolean;
  created_at: string;
};
export type PostRow = {
  id: number;
  user_id: string;
  image_url: string;
  image_path: string;
  theme: string;
  note: string | null;
  score: number;
  created_at: string;
};
export type CaptionRow = {
  id: number;
  post_id: number;
  text: string;
  style: string;
  model: string;
  prompt: string;
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
};
export type VoteRow = {
  id: number;
  caption_id: number;
  user_id: string;
  value: 1 | -1;
  created_at: string;
  updated_at: string;
};

// Admin client only (bypasses RLS). Fine at CapCity's size; paginate if it grows past a few thousand rows.
export async function loadAll(db: SupabaseClient) {
  const [profiles, posts, captions, votes] = await Promise.all([
    db.from("profiles").select("id, email, first_name, last_name, avatar_url, is_superadmin, created_at").limit(5000),
    db.from("posts").select("id, user_id, image_url, image_path, theme, note, score, created_at").limit(5000),
    db.from("captions").select("id, post_id, text, style, model, prompt, upvotes, downvotes, score, created_at").limit(5000),
    db.from("votes").select("id, caption_id, user_id, value, created_at, updated_at").limit(5000),
  ]);
  return {
    profiles: (profiles.data ?? []) as ProfileRow[],
    posts: (posts.data ?? []) as PostRow[],
    captions: (captions.data ?? []) as CaptionRow[],
    votes: (votes.data ?? []) as VoteRow[],
  };
}

export function nyDay(iso: string | Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
