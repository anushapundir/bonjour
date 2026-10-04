import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { ChangeCard } from "../../../components/deal/ChangeCard";
import { CAVEAT, EvalTable, REC_LABEL } from "../../../components/EvalTable";
import { PageHeader } from "../../../components/ui";
import { appData, loadLabels } from "../../../lib/app-data";
import { longDay } from "../../../lib/format";
import { RECOMMENDERS } from "../../../lib/types";

export const metadata = { title: "Eval" };

export default function EvalPage() {
  const { scoreboard: board, deals, contacts, runs } = appData();
  if (!board) {
    return (
      <div>
        <PageHeader title="Eval" />
        <p className="text-sm text-muted">No eval results yet. Run npm run eval to create results/scoreboard.json.</p>
      </div>
    );
  }
  const labels = loadLabels();
  const ran = RECOMMENDERS.map((id) => board.recommenders[id]).filter((r) => r?.status === "ran");
  const models = [...new Set(ran.map((r) => r.status === "ran" && r.model))].filter(Boolean).join(", ");
  const dates = [...new Set(ran.map((r) => r.status === "ran" && r.ranAt))].filter(Boolean) as string[];
  const first = ran.find((r) => r.status === "ran");
  const agg = first?.status === "ran" ? first.aggregate : null;

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Eval"
        sub={`${agg?.deals ?? deals.length} hand-written deals, ${agg?.expected ?? "?"} expected changes. Models: ${models}.${dates.length ? ` Run on ${dates.map(longDay).join(", ")}.` : ""}`}
      />

      <EvalTable board={board} />

      <div className="mt-5 rounded-2xl border border-line bg-surface-2/60 p-5 text-[13.5px] leading-relaxed text-ink-2">
        <p className="font-serif text-lg italic text-ink">Read this before trusting the numbers</p>
        <p className="mt-1">{CAVEAT}</p>
        <p className="mt-2 text-muted">
          Every deal hides one trap a careless reader falls for. A change counts as correct only if it matches the answer key, and a citation counts as supported only if the quote
          appears word for word in the activity it points at.
        </p>
      </div>

      <h2 className="mb-4 mt-12 font-serif text-2xl tracking-[-0.015em] text-ink">Deal by deal</h2>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
        <div className="hidden px-4 py-2.5 font-mono text-[11px] text-muted sm:grid sm:grid-cols-[minmax(0,1fr)_repeat(3,96px)]">
          <span className="pl-5">Deal and its trap</span>
          {RECOMMENDERS.map((id) => (
            <span key={id} className="text-right">
              {REC_LABEL[id]}
            </span>
          ))}
        </div>
        {deals.map((deal) => {
          const label = labels.find((l) => l.dealId === deal.id);
          const own = contacts.filter((c) => c.companyId === deal.companyId);
          return (
            <details key={deal.id} className="group">
              <summary className="grid cursor-pointer list-none gap-2 px-4 py-3 hover:bg-surface-2/60 sm:grid-cols-[minmax(0,1fr)_repeat(3,96px)] sm:items-center [&::-webkit-details-marker]:hidden">
                <span className="flex min-w-0 items-start gap-2">
                  <CaretRight size={13} className="mt-1 shrink-0 text-muted transition-transform group-open:rotate-90" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium text-ink">{deal.name}</span>
                    <span className="block text-xs text-muted">{label?.trap}</span>
                  </span>
                </span>
                {RECOMMENDERS.map((id) => {
                  const run = board.recommenders[id];
                  const s = run?.status === "ran" ? run.perDeal.find((p) => p.dealId === deal.id) : undefined;
                  const bad = s ? s.wrongValue + s.spurious + s.missed : 0;
                  return (
                    <span key={id} className="flex items-center justify-between gap-2 pl-5 font-mono text-[11.5px] sm:block sm:pl-0 sm:text-right">
                      <span className="font-sans text-xs text-muted sm:hidden">{REC_LABEL[id]}</span>
                      {!s ? (
                        <span className="text-muted">not run yet</span>
                      ) : s.noChangeDeal ? (
                        <span className={s.untouched ? "text-good" : "text-bad"}>{s.untouched ? "Left alone" : `${s.verdicts.length} unneeded`}</span>
                      ) : (
                        <span className={bad ? "text-ink-2" : "text-good"}>
                          {s.correct}/{s.expected}
                          {bad > 0 && <span className="ml-1.5 text-bad">{bad} {bad === 1 ? "error" : "errors"}</span>}
                        </span>
                      )}
                    </span>
                  );
                })}
              </summary>
              <div className="grid gap-4 border-t border-line bg-bg/60 p-4 lg:grid-cols-3">
                {RECOMMENDERS.map((id) => {
                  const run = board.recommenders[id];
                  const s = run?.status === "ran" ? run.perDeal.find((p) => p.dealId === deal.id) : undefined;
                  const changes = runs[deal.id]?.[id] ?? [];
                  return (
                    <div key={id} className="min-w-0">
                      <h3 className="mb-2 font-serif text-[15px] text-ink">{REC_LABEL[id]}</h3>
                      {!s ? (
                        <p className="text-xs text-muted">not run yet</p>
                      ) : (
                        <div className="space-y-2">
                          {changes.length === 0 && <p className="text-xs text-muted">Proposed nothing.</p>}
                          {changes.map((c, i) => (
                            <ChangeCard key={i} change={c} contacts={own} verdict={s.verdicts[i]} />
                          ))}
                          {s.missed > 0 && (
                            <p className="rounded-[12px] bg-bad-soft px-3 py-2 text-xs text-bad">
                              Missed {s.missed} expected {s.missed === 1 ? "change" : "changes"}.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
