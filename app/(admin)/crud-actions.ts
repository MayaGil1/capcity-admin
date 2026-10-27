"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { RESOURCES, isResourceKey, type Field } from "@/lib/resources";

export type CrudState = { error?: string; success?: string };

function readField(field: Field, formData: FormData): { value?: unknown; error?: string } {
  if (field.type === "checkbox") return { value: formData.get(field.name) === "on" };

  const raw = String(formData.get(field.name) ?? "").trim();
  if (!raw) return field.required ? { error: `${field.label} is required.` } : { value: field.type === "number" ? 0 : "" };

  if (field.type === "number" || field.type === "select") {
    const n = Number(raw);
    if (!Number.isInteger(n)) return { error: `${field.label} must be a whole number.` };
    if (field.min !== undefined && n < field.min) return { error: `${field.label} must be at least ${field.min}.` };
    if (field.max !== undefined && n > field.max) return { error: `${field.label} must be at most ${field.max}.` };
    return { value: n };
  }
  if (field.max && raw.length > field.max) return { error: `${field.label} must be ${field.max} characters or less.` };
  return { value: field.lower ? raw.toLowerCase() : raw };
}

function friendly(error: { code?: string; message: string }) {
  if (error.code === "23505") return "That already exists.";
  if (error.code === "23503") return "It's still in use (for example, a model uses this provider). Change those first.";
  if (error.code === "23514") return "That value isn't valid here.";
  return error.message;
}

// CREATE (id = null) or UPDATE one row of a configured table.
export async function saveRow(resource: string, id: number | null, _prev: CrudState, formData: FormData): Promise<CrudState> {
  const { db } = await requireAdmin();
  if (!isResourceKey(resource)) return { error: "Unknown table." };
  if (id !== null && !Number.isInteger(id)) return { error: "Invalid id." };
  const config = RESOURCES[resource];

  const values: Record<string, unknown> = {};
  for (const field of config.fields as Field[]) {
    const { value, error } = readField(field, formData);
    if (error) return { error };
    values[field.name] = value;
  }

  const { error } =
    id === null
      ? await db.from(config.table).insert(values)
      : await db
          .from(config.table)
          .update(config.hasUpdatedAt ? { ...values, updated_at: new Date().toISOString() } : values)
          .eq("id", id);
  if (error) return { error: friendly(error) };

  revalidatePath(config.path);
  return { success: id === null ? "Added." : "Saved." };
}

export async function deleteRow(resource: string, id: number): Promise<CrudState> {
  const { db } = await requireAdmin();
  if (!isResourceKey(resource) || !Number.isInteger(id)) return { error: "Invalid request." };
  const config = RESOURCES[resource];
  const { error } = await db.from(config.table).delete().eq("id", id);
  if (error) return { error: friendly(error) };
  revalidatePath(config.path);
  return {};
}
