import { Quotes, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { FIELD_LABEL, show } from "../../lib/format";
import type { Verdict } from "../../lib/score";
import type { Contact } from "../../lib/types";
import type { VerifiedChange } from "../../lib/verify";
import { VerdictTag } from "../ui";

type Props = {
  change: VerifiedChange;
  contacts: Contact[];
  source?: string;
  verdict?: Verdict;
  status?: "approved" | "rejected";
  active?: boolean;
  onEvidence?: () => void;
  actions?: React.ReactNode;
};

// One proposed change as a before and after, with the reason and the line it came from.
export function ChangeCard({ change, contacts, source, verdict, status, active, onEvidence, actions }: Props) {
  const before = show(change.field, change.from, contacts);
  const after = show(change.field, change.to, contacts);
  const unsupported = !change.supported;
  const dim = status === "rejected";

  return (
    <div
      className={`rounded-[14px] border bg-surface p-4 shadow-panel transition-[border-color,box-shadow,opacity] ${
        active ? "border-accent shadow-[0_0_0_3px_var(--accent-soft),var(--shadow)]" : "border-line"
      } ${dim ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">{FIELD_LABEL[change.field]}</span>
        <span className="flex items-center gap-1.5">
          {verdict && <VerdictTag verdict={verdict} />}
          {status === "approved" && <span className="font-mono text-[11px] font-medium text-good">Approved</span>}
          {status === "rejected" && <span className="font-mono text-[11px] font-medium text-muted">Rejected</span>}
        </span>
      </div>

      <div className="mt-2.5 space-y-1 text-[14px] leading-snug">
        {before && (
          <p className="flex gap-2 text-muted">
            <span className="w-3 shrink-0 select-none text-center" aria-label="Before">−</span>
            <span className="min-w-0 break-words line-through decoration-line-strong">{before}</span>
          </p>
        )}
        <p className={`flex gap-2 ${unsupported ? "text-muted" : "text-ink"}`}>
          {change.field === "contactLeft" ? (
            <span className={`w-3 shrink-0 select-none text-center ${unsupported ? "" : "text-bad"}`} aria-label="Leaving">−</span>
          ) : (
            <span className={`w-3 shrink-0 select-none text-center ${unsupported ? "" : "text-good"}`} aria-label="After">+</span>
          )}
          <span className={`min-w-0 break-words font-medium ${unsupported ? "line-through decoration-bad" : ""}`}>{after}</span>
        </p>
      </div>

      <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">{change.reason}</p>

      {unsupported && (
        <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-bad">
          <WarningCircle size={14} weight="fill" />
          No source found, can&apos;t approve
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onEvidence}
          aria-pressed={active}
          title={change.evidence.quote || "No quote given"}
          className={`flex min-w-0 max-w-full items-center gap-1.5 rounded-full border py-1 pl-2 pr-2.5 text-left text-xs transition-colors ${
            active ? "border-accent/60 bg-accent-soft text-ink" : "border-line bg-surface-2/70 text-ink-2 hover:border-line-strong"
          }`}
        >
          <Quotes size={13} weight="fill" className={unsupported ? "shrink-0 text-bad" : "shrink-0 text-accent"} />
          {source && <span className="shrink-0 font-mono text-[11px] text-ink-2">{source}</span>}
          <span className="truncate font-serif text-[13px] italic text-muted">{change.evidence.quote ? `“${change.evidence.quote}”` : "no quote"}</span>
        </button>
        {actions}
      </div>
    </div>
  );
}
