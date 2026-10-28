const STYLES: Record<string, string> = {
  succeeded: "✓ Succeeded",
  failed: "✕ Failed",
  running: "… Running",
  stalled: "✕ Timed out",
};

// A request still "running" after the 5-minute function limit was cut off before it could log a result.
export function effectiveStatus(status: string, createdAt: string) {
  return status === "running" && Date.parse(createdAt) < Date.now() - 6 * 60_000 ? "stalled" : status;
}

// Status is shown as icon + word, never color alone.
export default function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "failed" || status === "stalled"
      ? "border-[var(--negative)] text-[var(--negative)]"
      : "border-black/[.12] text-[var(--text-secondary)] dark:border-white/[.2]";
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}>
      {STYLES[status] ?? status}
    </span>
  );
}
