// Small, dependency-free charts. Single-series bars use one hue (--series-1);
// signed values use the blue <-> red diverging pair around a gray zero line.
// Every mark has a hover tooltip, and values are printed in text colors, never the series color.

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-black/[.07] bg-[var(--surface-1)] p-5 dark:border-white/[.08] ${className}`}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatTile({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-2xl border border-black/[.07] bg-[var(--surface-1)] p-4 dark:border-white/[.08]">
      <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {detail && <p className="mt-1 text-xs text-[var(--text-secondary)]">{detail}</p>}
    </div>
  );
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus:block dark:bg-zinc-100 dark:text-zinc-900">
      {children}
    </span>
  );
}

// Vertical columns for change over time.
export function ColumnChart({
  data,
  unit,
  height = 160,
}: {
  data: { label: string; shortLabel: string; value: number }[];
  unit: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const ticks = [max, Math.round(max / 2), 0].filter((t, i, all) => all.indexOf(t) === i);

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between text-right text-[10px] tabular-nums text-[var(--text-secondary)]" style={{ height }}>
        {ticks.map((t) => (
          <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
            {t}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="relative flex items-end gap-[2px] border-b border-[var(--grid)]"
          style={{ height }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--grid)]" />
          {data.map((d) => (
            <div
              key={d.label}
              tabIndex={0}
              className="group relative flex h-full flex-1 items-end outline-none"
              aria-label={`${d.label}: ${d.value} ${unit}`}
            >
              <div
                className="w-full rounded-t-[4px] bg-[var(--series-1)] transition-opacity group-hover:opacity-80"
                style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}
              />
              <Tooltip>
                {d.label}: <strong>{d.value}</strong> {unit}
              </Tooltip>
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-[2px] text-[10px] text-[var(--text-secondary)]">
          {data.map((d, i) => (
            <span key={d.label} className="flex-1 text-center">
              {i % 2 === 0 || data.length <= 8 ? d.shortLabel : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Horizontal bars for ranking / magnitude, labels on the left, values direct-labeled.
export function BarList({
  rows,
  format = (v) => String(v),
}: {
  rows: { label: string; value: number; detail?: string }[];
  format?: (v: number) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <li key={row.label} tabIndex={0} className="group relative outline-none">
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-medium">{row.label}</span>
            <span className="shrink-0 tabular-nums text-[var(--text-secondary)]">{format(row.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--neutral)]">
            <div
              className="h-2 rounded-full bg-[var(--series-1)] transition-opacity group-hover:opacity-80"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          {row.detail && <Tooltip>{row.detail}</Tooltip>}
        </li>
      ))}
    </ul>
  );
}

// Signed values around a zero line: blue right for positive, red left for negative.
export function DivergingBars({
  rows,
  format = (v) => v.toFixed(2),
}: {
  rows: { label: string; value: number; detail?: string }[];
  format?: (v: number) => string;
}) {
  const max = Math.max(0.01, ...rows.map((r) => Math.abs(r.value)));
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => {
        const pct = (Math.abs(row.value) / max) * 50;
        return (
          <li
            key={row.label}
            tabIndex={0}
            className="group relative grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 text-xs outline-none sm:grid-cols-[9rem_1fr_3rem]"
          >
            <span className="truncate font-medium">{row.label}</span>
            <div className="relative h-5">
              <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--text-secondary)] opacity-40" />
              <div
                className="absolute inset-y-1 transition-opacity group-hover:opacity-80"
                style={{
                  width: `${pct}%`,
                  left: row.value >= 0 ? "50%" : `${50 - pct}%`,
                  background: row.value >= 0 ? "var(--series-1)" : "var(--negative)",
                  borderRadius: row.value >= 0 ? "0 4px 4px 0" : "4px 0 0 4px",
                }}
              />
            </div>
            <span className="text-right tabular-nums">
              {row.value > 0 ? "+" : ""}
              {format(row.value)}
            </span>
            {row.detail && <Tooltip>{row.detail}</Tooltip>}
          </li>
        );
      })}
    </ul>
  );
}
