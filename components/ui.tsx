import type { Verdict } from "../lib/score";

// Warm stage tones for the UI, from cool grey morning to full sun. lib/stages.ts keeps the order.
export const STAGE_TONE: Record<string, string> = {
  Lead: "#a59c90",
  Discovery: "#8f9a86",
  Demo: "#c9a15a",
  Proposal: "#e3964f",
  Negotiation: "#e8743b",
  "Closed Won": "#5e8a64",
  "Closed Lost": "#b0614c",
};
export const stageTone = (stage: string) => STAGE_TONE[stage] ?? "var(--muted)";

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-2 py-0.5 text-xs text-ink-2">
      <span className="size-1.5 rounded-full" style={{ background: stageTone(stage) }} />
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
  return <span className={`rounded-full px-2 py-0.5 font-mono text-[10.5px] font-medium ${v.className}`}>{v.label}</span>;
}

// A company monogram on a warm tone picked from its name, so the same company always gets the same chip.
const TONES = ["#e9c9a8", "#dcc7b0", "#e7b79b", "#cfd2b8", "#e4d3a6", "#d9bfb6", "#c9d0c4", "#ecc28f"];
export function Monogram({ name, className = "size-7 text-[11px]" }: { name: string; className?: string }) {
  const n = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const letters = name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-[9px] font-serif font-medium text-[#3a2b1e] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),inset_0_0_0_1px_rgb(58_43_30/0.08)] ${className}`}
      style={{ background: TONES[n % TONES.length] }}
    >
      {letters}
    </span>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-serif text-[32px] font-normal leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export const btn = {
  primary: "key key-ink",
  secondary: "key key-light",
  ghost: "key key-ghost",
};
