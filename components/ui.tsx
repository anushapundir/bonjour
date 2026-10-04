import type { Verdict } from "../lib/score";

// The small set of colors that label things: deals, stages, sections. Dark enough for a white letter on top.
export const HUES = {
  violet: "#7c3aed",
  pink: "#db2777",
  blue: "#2563eb",
  green: "#16a34a",
  orange: "#ea580c",
  teal: "#0d9488",
  amber: "#d97706",
  red: "#dc2626",
  slate: "#525252",
} as const;

// lib/stages.ts keeps the order; this only picks a color per stage.
export const STAGE_TONE: Record<string, string> = {
  Lead: HUES.slate,
  Discovery: HUES.blue,
  Demo: HUES.violet,
  Proposal: HUES.amber,
  Negotiation: HUES.orange,
  "Closed Won": HUES.green,
  "Closed Lost": HUES.red,
};
export const stageTone = (stage: string) => STAGE_TONE[stage] ?? "var(--muted)";

// A small rounded square in one color, the way the app labels things.
export function Square({ color, className = "size-3.5", children }: { color: string; className?: string; children?: React.ReactNode }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-[4px] text-white ${className}`} style={{ background: color }}>
      {children}
    </span>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-line bg-surface px-2 text-xs text-ink-2">
      <Square color={stageTone(stage)} className="size-2 rounded-[2px]" />
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
  return <span className={`rounded-[4px] px-1.5 py-0.5 font-mono text-[10.5px] font-medium ${v.className}`}>{v.label}</span>;
}

// A company mark: its initials on a color picked from its name, so the same company always gets the same square.
const TONES = [HUES.violet, HUES.pink, HUES.blue, HUES.green, HUES.orange, HUES.teal, HUES.amber, HUES.red];
export const toneOf = (name: string) => TONES[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % TONES.length]!;

export function Monogram({ name, className = "size-7 text-[11px]" }: { name: string; className?: string }) {
  const letters = name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-[6px] font-medium text-white ${className}`} style={{ background: toneOf(name) }}>
      {letters}
    </span>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-medium leading-tight tracking-[-0.025em] text-ink">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
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
