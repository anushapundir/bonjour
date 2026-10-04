import type { Run, Scoreboard } from "../lib/results";
import type { Aggregate } from "../lib/score";
import { RECOMMENDERS, type RecommenderId } from "../lib/types";

export const REC_LABEL: Record<RecommenderId, string> = { rules: "Keyword rules", naive: "Naive LLM", bonjour: "Bonjour" };

const pct = (x: number | null) => (x === null ? "n/a" : `${Math.round(x * 100)}%`);

// Every number here is read from results/scoreboard.json. Lower is better unless marked.
const METRICS: { label: string; hint: string; value: (a: Aggregate) => string; higherBetter?: boolean }[] = [
  { label: "Correct", hint: "expected changes proposed with the right value", value: (a) => `${a.correct} of ${a.expected}`, higherBetter: true },
  { label: "Wrong value", hint: "right field, wrong value", value: (a) => String(a.wrongValue) },
  { label: "Missed", hint: "expected changes not proposed", value: (a) => String(a.missed) },
  { label: "Spurious", hint: "changes nobody should make", value: (a) => String(a.spurious) },
  { label: "Unsupported citations", hint: "quote not found in the cited activity", value: (a) => `${a.unsupported} of ${a.proposed}` },
  { label: "Risk recall", hint: "real risks that were flagged", value: (a) => pct(a.riskRecall), higherBetter: true },
  { label: "No-change deals untouched", hint: "deals where the right answer is nothing", value: (a) => `${a.noChangeDealsUntouched} of ${a.noChangeDeals}`, higherBetter: true },
];

export function EvalTable({ board, compact }: { board: Scoreboard; compact?: boolean }) {
  const runs = RECOMMENDERS.map((id) => [id, board.recommenders[id]] as [RecommenderId, Run | undefined]);
  return (
    <div className="overflow-x-auto rounded-[12px] border border-line bg-surface shadow-panel">
      <table className="w-full min-w-[560px] text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-3 align-bottom text-[12px] font-normal text-muted">Metric</th>
            {runs.map(([id, run]) => (
              <th key={id} className={`px-4 py-3 text-right align-bottom ${id === "bonjour" ? "bg-canvas" : ""}`}>
                <span className={`block text-[13px] font-medium ${id === "bonjour" ? "text-ink" : "text-muted"}`}>{REC_LABEL[id]}</span>
                {!compact && <span className="block font-mono text-[10.5px] font-normal text-muted">{run?.status === "ran" ? run.model : "not run yet"}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {METRICS.map((m) => (
            <tr key={m.label}>
              <th scope="row" className="px-4 py-2.5 font-normal">
                <span className="block text-ink">{m.label}</span>
                {!compact && <span className="block text-[12px] text-muted">{m.hint}{m.higherBetter ? ", higher is better" : ""}</span>}
              </th>
              {runs.map(([id, run]) => (
                <td key={id} className={`px-4 py-2.5 text-right font-mono text-[13px] tabular-nums ${id === "bonjour" ? "bg-canvas font-medium text-ink" : "text-muted"}`}>
                  {run?.status === "ran" ? m.value(run.aggregate) : <span className="text-muted">not run yet</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const CAVEAT =
  "The Bonjour prompt was tuned while looking at these same deals, so this is an in-sample score. It is one run with no variance measured, and the test set is small and hand-written. The test set is too easy to call this solved; the next step is held-out deals.";
