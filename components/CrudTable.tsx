"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteRow, saveRow } from "@/app/(admin)/crud-actions";
import ConfirmButton from "@/components/ConfirmButton";
import { buttonPrimary, buttonSecondary, input, td, th } from "@/components/ui";
import type { Field } from "@/lib/resources";

type Row = { id: number; [key: string]: unknown };

// Generic list + inline create/edit/delete for one table from lib/resources.ts.
export default function CrudTable({
  resource,
  singular,
  fields,
  rows,
  extraColumns = [],
}: {
  resource: string;
  singular: string;
  fields: Field[];
  rows: Row[];
  extraColumns?: { label: string; values: Record<number, React.ReactNode> }[];
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const colSpan = fields.length + extraColumns.length + 1;

  return (
    <div className="flex flex-col gap-4">
      {editing === "new" ? (
        <div className="rounded-2xl border border-black/[.07] bg-[var(--surface-1)] p-4 dark:border-white/[.08]">
          <p className="mb-3 text-sm font-semibold">New {singular}</p>
          <RowForm resource={resource} fields={fields} id={null} onDone={() => setEditing(null)} />
        </div>
      ) : (
        <div>
          <button type="button" className={buttonPrimary} onClick={() => setEditing("new")}>
            + New {singular}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/[.07] bg-[var(--surface-1)] dark:border-white/[.08]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f.name} className={th}>
                  {f.label}
                </th>
              ))}
              {extraColumns.map((c) => (
                <th key={c.label} className={th}>
                  {c.label}
                </th>
              ))}
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
              editing === row.id ? (
                <tr key={row.id}>
                  <td colSpan={colSpan} className={td}>
                    <RowForm resource={resource} fields={fields} id={row.id} row={row} onDone={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={row.id}>
                  {fields.map((f) => (
                    <td key={f.name} className={`${td} max-w-xs`}>
                      <Cell field={f} value={row[f.name]} />
                    </td>
                  ))}
                  {extraColumns.map((c) => (
                    <td key={c.label} className={td}>
                      {c.values[row.id] ?? "—"}
                    </td>
                  ))}
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <button
                      type="button"
                      onClick={() => setEditing(row.id)}
                      className="inline-flex h-7 items-center rounded-full px-3 text-xs font-medium hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                    >
                      Edit
                    </button>
                    <ConfirmButton small label="Delete" onConfirm={() => deleteRow(resource, row.id)} />
                  </td>
                </tr>
              ),
            )}
            {rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className={`${td} text-center text-[var(--text-secondary)]`}>
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ field, value }: { field: Field; value: unknown }) {
  if (field.type === "checkbox") return <span>{value ? "Yes" : "No"}</span>;
  if (field.type === "select") return <span>{field.options?.find((o) => o.value === value)?.label ?? String(value ?? "—")}</span>;
  if (field.type === "number") return <span className="tabular-nums">{String(value ?? 0)}</span>;
  return <span className="line-clamp-3 whitespace-pre-wrap">{String(value ?? "") || "—"}</span>;
}

function RowForm({
  resource,
  fields,
  id,
  row,
  onDone,
}: {
  resource: string;
  fields: Field[];
  id: number | null;
  row?: Row;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(saveRow.bind(null, resource, id), {});

  useEffect(() => {
    if (state.success) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {fields.map((f) => {
        const value = row?.[f.name];
        const wide = f.type === "textarea" ? "sm:col-span-2" : "";
        if (f.type === "checkbox") {
          return (
            <label key={f.name} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={f.name} defaultChecked={row ? Boolean(value) : true} />
              {f.label}
            </label>
          );
        }
        return (
          <label key={f.name} className={`flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)] ${wide}`}>
            {f.label}
            {f.type === "textarea" ? (
              <textarea name={f.name} defaultValue={String(value ?? "")} required={f.required} maxLength={f.max} rows={3} className={input} />
            ) : f.type === "select" ? (
              <select name={f.name} defaultValue={value === undefined ? "" : String(value)} required={f.required} className={input}>
                <option value="" disabled>
                  Choose…
                </option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={f.name}
                type={f.type === "number" ? "number" : "text"}
                defaultValue={value === undefined || value === null ? (f.type === "number" ? 0 : "") : String(value)}
                required={f.required}
                maxLength={f.type === "text" ? f.max : undefined}
                min={f.min}
                max={f.type === "number" ? f.max : undefined}
                placeholder={f.placeholder}
                className={input}
              />
            )}
          </label>
        );
      })}
      <div className="flex items-center gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Saving…" : id === null ? "Add" : "Save"}
        </button>
        <button type="button" onClick={onDone} className={buttonSecondary}>
          Cancel
        </button>
        {state.error && <span className="text-sm text-[var(--negative)]">{state.error}</span>}
      </div>
    </form>
  );
}
