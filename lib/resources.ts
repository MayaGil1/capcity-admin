// Tables the admin can create/read/update/delete through the shared CrudTable.
// The server action reads this config (never the browser's) to decide which columns may be written.

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select";
  required?: boolean;
  max?: number; // max length for text, max value for numbers
  min?: number;
  lower?: boolean;
  placeholder?: string;
  options?: { value: number; label: string }[]; // filled in by the page for selects
};

export type Resource = {
  table: string;
  path: string;
  singular: string;
  orderBy: { column: string; ascending: boolean }[];
  hasUpdatedAt: boolean;
  fields: Field[];
};

export const RESOURCES = {
  terms: {
    table: "terms",
    path: "/terms",
    singular: "term",
    orderBy: [{ column: "priority", ascending: false }, { column: "term", ascending: true }],
    hasUpdatedAt: true,
    fields: [
      { name: "term", label: "Term", type: "text", required: true, max: 80, placeholder: "Butler" },
      { name: "definition", label: "Definition", type: "textarea", required: true, max: 500 },
      { name: "example", label: "Example", type: "textarea", max: 300 },
      { name: "priority", label: "Priority", type: "number", min: -100, max: 100 },
    ],
  },
  examples: {
    table: "caption_examples",
    path: "/examples",
    singular: "example",
    orderBy: [{ column: "priority", ascending: false }, { column: "id", ascending: false }],
    hasUpdatedAt: true,
    fields: [
      { name: "image_description", label: "Photo description", type: "textarea", required: true, max: 500 },
      { name: "caption", label: "Caption", type: "textarea", required: true, max: 200 },
      { name: "explanation", label: "Why it works", type: "textarea", max: 500 },
      { name: "priority", label: "Priority", type: "number", min: -100, max: 100 },
    ],
  },
  providers: {
    table: "llm_providers",
    path: "/providers",
    singular: "provider",
    orderBy: [{ column: "name", ascending: true }],
    hasUpdatedAt: true,
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 80, placeholder: "Google Gemini" },
      { name: "slug", label: "Slug", type: "text", required: true, max: 40, lower: true, placeholder: "google" },
    ],
  },
  models: {
    table: "llm_models",
    path: "/models",
    singular: "model",
    orderBy: [{ column: "name", ascending: true }],
    hasUpdatedAt: true,
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 80, placeholder: "Gemini 3.5 Flash" },
      { name: "llm_provider_id", label: "Provider", type: "select", required: true },
      { name: "provider_model_id", label: "API model id", type: "text", required: true, max: 120, placeholder: "gemini-3.5-flash" },
      { name: "is_temperature_supported", label: "Temperature", type: "checkbox" },
      { name: "is_active", label: "Active", type: "checkbox" },
    ],
  },
  "signup-domains": {
    table: "allowed_signup_domains",
    path: "/signup-domains",
    singular: "domain",
    orderBy: [{ column: "apex_domain", ascending: true }],
    hasUpdatedAt: false,
    fields: [{ name: "apex_domain", label: "Domain", type: "text", required: true, max: 120, lower: true, placeholder: "columbia.edu" }],
  },
  whitelist: {
    table: "whitelist_email_addresses",
    path: "/whitelist",
    singular: "email",
    orderBy: [{ column: "email_address", ascending: true }],
    hasUpdatedAt: false,
    fields: [
      { name: "email_address", label: "Email", type: "text", required: true, max: 200, lower: true, placeholder: "friend@gmail.com" },
    ],
  },
} satisfies Record<string, Resource>;

export type ResourceKey = keyof typeof RESOURCES;

export function isResourceKey(key: string): key is ResourceKey {
  return Object.hasOwn(RESOURCES, key);
}
