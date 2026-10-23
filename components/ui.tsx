export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-[var(--text-secondary)]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/[.07] bg-[var(--surface-1)] dark:border-white/[.08]">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export const th = "px-4 py-3 text-xs font-medium text-[var(--text-secondary)]";
export const td = "border-t border-black/[.05] px-4 py-3 align-middle dark:border-white/[.06]";

export const buttonPrimary =
  "inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50";
export const buttonSecondary =
  "inline-flex h-9 items-center rounded-full border border-black/[.12] px-4 text-sm font-medium hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.2] dark:hover:bg-white/[.06]";
export const input =
  "w-full rounded-lg border border-black/[.12] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--series-1)] dark:border-white/[.2] dark:bg-zinc-900";

export function SearchForm({ q, placeholder }: { q?: string; placeholder: string }) {
  return (
    <form className="w-full sm:w-72">
      <input name="q" defaultValue={q} placeholder={placeholder} className={input} />
    </form>
  );
}
