import CrudTable from "@/components/CrudTable";
import { PageHeader, SearchForm } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { RESOURCES, type Field, type ResourceKey } from "@/lib/resources";

// Server wrapper: loads a table from lib/resources.ts, filters by ?q, renders the CRUD table.
export default async function ResourcePage({
  resource,
  title,
  description,
  q,
  options = {},
  notice,
  extraColumns,
}: {
  resource: ResourceKey;
  title: string;
  description: string;
  q?: string;
  options?: Record<string, { value: number; label: string }[]>;
  notice?: React.ReactNode;
  extraColumns?: (rows: { id: number }[]) => { label: string; values: Record<number, React.ReactNode> }[];
}) {
  const { db } = await requireAdmin();
  const config = RESOURCES[resource];

  let query = db.from(config.table).select("*").limit(1000);
  for (const o of config.orderBy) query = query.order(o.column, { ascending: o.ascending });
  const { data, error } = await query;
  const all = (data ?? []) as { id: number; [key: string]: unknown }[];

  const fields: Field[] = (config.fields as Field[]).map((f) => (options[f.name] ? { ...f, options: options[f.name] } : f));
  const needle = q?.trim().toLowerCase();
  const rows = needle
    ? all.filter((row) =>
        fields.some((f) => typeof row[f.name] === "string" && (row[f.name] as string).toLowerCase().includes(needle)),
      )
    : all;

  return (
    <>
      <PageHeader
        title={title}
        description={`${description} · ${all.length} total`}
        action={<SearchForm q={q} placeholder={`Search ${title.toLowerCase()}`} />}
      />
      {notice}
      {error && <p className="mb-4 text-sm text-[var(--negative)]">Couldn&apos;t load: {error.message}</p>}
      <CrudTable
        resource={resource}
        singular={config.singular}
        fields={fields}
        rows={rows}
        extraColumns={extraColumns?.(rows)}
      />
    </>
  );
}
