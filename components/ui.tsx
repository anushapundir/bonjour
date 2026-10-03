import { STAGES } from "../lib/stages";
import type { Verdict } from "../lib/score";

export function StageBadge({ stage }: { stage: string }) {
  const color = STAGES.find((s) => s.name === stage)?.color ?? "var(--muted)";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-line bg-surface px-1.5 py-0.5 text-xs text-ink-2">
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {stage}
    </span>
  );
}

const VERDICT: Record<Verdict, { label: string; className: string }> = {
  correct: { label: "Correct", className: "text-good bg-good-soft" },
  optional: { label: "Acceptable", className: "text-ink-2 bg-surface-2" },
  wrong: { label: "Wrong value", className: "text-bad bg-bad-soft" },
  spurious: { label: "Not needed", className: "text-bad bg-bad-soft" },
};

export function VerdictTag({ verdict }: { verdict: Verdict }) {
  const v = VERDICT[verdict];
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${v.className}`}>{v.label}</span>;
}

export function PageHeader({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export const btn = {
  primary:
    "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-accent px-3 text-[13px] font-medium text-accent-ink transition active:translate-y-px disabled:opacity-50 hover:opacity-90",
  secondary:
    "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-ink transition hover:bg-surface-2 active:translate-y-px disabled:opacity-50",
  ghost:
    "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[13px] font-medium text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-50",
};
