"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { attachPostToRequest, runCaptionPipeline, type GeneratedCaption } from "@/lib/pipeline";

export type ActionState = { error?: string; success?: string };

const captionRows = (postId: number, requestId: number, captions: GeneratedCaption[]) =>
  captions.map((c) => ({
    post_id: postId,
    text: c.text,
    style: c.style,
    prompt: c.prompt,
    model: c.model,
    prompt_chain_id: c.prompt_chain_id,
    generation_request_id: requestId,
  }));

const clean = (formData: FormData, field: string, max = 300) =>
  String(formData.get(field) ?? "").trim().slice(0, max);

// CREATE: the browser uploaded a photo into the admin's own storage folder; Gemini captions it.
export async function createPost(imagePath: string, theme: string, note: string): Promise<ActionState> {
  const { user, db } = await requireAdmin();
  if (!imagePath.startsWith(`${user.id}/`)) return { error: "Invalid upload." };

  const { data: file, error: downloadError } = await db.storage.from("posts").download(imagePath);
  if (downloadError || !file) return { error: "Could not read the uploaded photo." };

  const cleanTheme = theme.trim().slice(0, 60) || "Admin post";
  const cleanNote = note.trim().slice(0, 200) || null;

  let result;
  try {
    result = await runCaptionPipeline(db, {
      userId: user.id,
      imagePath,
      image: { data: await file.arrayBuffer(), mimeType: file.type || "image/jpeg" },
      theme: cleanTheme,
      note: cleanNote,
      source: "admin",
    });
  } catch (error) {
    console.error(error);
    return { error: "The AI couldn't caption that photo. Check Generation requests for the reason." };
  }

  const { data: { publicUrl } } = db.storage.from("posts").getPublicUrl(imagePath);
  const { data: post, error: postError } = await db
    .from("posts")
    .insert({ user_id: user.id, image_path: imagePath, image_url: publicUrl, theme: cleanTheme, note: cleanNote })
    .select("id")
    .single();
  if (postError || !post) return { error: postError?.message ?? "Could not save the post." };

  const { error: captionError } = await db.from("captions").insert(captionRows(post.id, result.requestId, result.captions));
  if (captionError) {
    await db.from("posts").delete().eq("id", post.id);
    return { error: captionError.message };
  }
  await attachPostToRequest(db, result.requestId, post.id);

  revalidatePath("/", "layout");
  redirect(`/posts/${post.id}`);
}

// UPDATE post fields.
export async function updatePost(postId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const theme = clean(formData, "theme", 60);
  if (!theme) return { error: "Theme can't be empty." };
  const { error } = await db
    .from("posts")
    .update({ theme, note: clean(formData, "note", 200) || null })
    .eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: "Saved." };
}

// UPDATE a caption's text/style.
export async function updateCaption(captionId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const text = clean(formData, "text", 200);
  const style = clean(formData, "style", 40);
  if (!text || !style) return { error: "Text and style are required." };
  const { error } = await db.from("captions").update({ text, style }).eq("id", captionId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: "Saved." };
}

// CREATE more AI captions for an existing photo.
export async function generateMoreCaptions(postId: number): Promise<ActionState> {
  const { user, db } = await requireAdmin();
  const { data: post } = await db.from("posts").select("image_path, theme, note").eq("id", postId).single();
  if (!post) return { error: "Post not found." };

  const { data: file } = await db.storage.from("posts").download(post.image_path);
  if (!file) return { error: "Could not read the photo." };

  try {
    const result = await runCaptionPipeline(db, {
      userId: user.id,
      imagePath: post.image_path,
      image: { data: await file.arrayBuffer(), mimeType: file.type || "image/jpeg" },
      theme: post.theme,
      note: post.note,
      source: "admin",
      postId,
    });
    const { error } = await db.from("captions").insert(captionRows(postId, result.requestId, result.captions));
    if (error) return { error: error.message };
  } catch (error) {
    console.error(error);
    return { error: "The AI couldn't write captions. Check Generation requests for the reason." };
  }
  revalidatePath("/", "layout");
  return { success: "Added new captions." };
}

// DELETE one caption (its votes go with it; the trigger keeps the post score correct).
export async function deleteCaption(captionId: number): Promise<ActionState> {
  const { db } = await requireAdmin();
  const { error } = await db.from("captions").delete().eq("id", captionId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

// DELETE a whole post: row (captions and votes cascade) and the photo file.
export async function deletePost(postId: number): Promise<ActionState> {
  const { db } = await requireAdmin();
  const { data: post } = await db.from("posts").select("image_path").eq("id", postId).single();
  const { error } = await db.from("posts").delete().eq("id", postId);
  if (error) return { error: error.message };
  if (post?.image_path) await db.storage.from("posts").remove([post.image_path]);
  revalidatePath("/", "layout");
  redirect("/posts");
}
