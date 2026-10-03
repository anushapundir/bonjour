"use client";

import Link from "next/link";
import { day, money, dealTitle } from "../../lib/format";
import { STAGES, type Stage } from "../../lib/stages";
import { PageHeader } from "../ui";
import { useDemo } from "./DemoState";

export function Pipeline() {
  const { data, liveDeal, pending, setStage } = useDemo();
  const deals = data.deals.map((d) => liveDeal(d.id)!);
  const company = (id: string) => data.companies.find((c) => c.id === id)?.name ?? "";
  const open = deals.filter((d) => !d.stage.startsWith("Closed")).reduce((n, d) => n + d.amount, 0);

  return (
    <div>
      <PageHeader title="Pipeline" sub={`${money(open)} open across ${deals.length} deals`}>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span className="size-1.5 rounded-full bg-accent" /> Bonjour has changes for you to review
        </p>
      </PageHeader>
      <div className="relative -mx-4 overflow-x-auto px-4 pb-4 lg:-mx-8 lg:px-8">
        <div className="grid auto-cols-[248px] grid-flow-col gap-3">
          {STAGES.map((s) => {
            const col = deals.filter((d) => d.stage === s.name);
            return (
              <section key={s.name} aria-label={s.name} className="flex flex-col rounded-xl bg-surface-2/60 p-2">
                <header className="flex items-center gap-2 px-1.5 pb-2 pt-1">
                  <span className="size-2 rounded-full" style={{ background: s.color }} />
                  <h2 className="text-[13px] font-medium text-ink">{s.name}</h2>
                  <span className="text-xs tabular-nums text-muted">{col.length}</span>
                  <span className="ml-auto text-xs tabular-nums text-muted">{col.length ? money(col.reduce((n, d) => n + d.amount, 0)) : ""}</span>
                </header>
                <ul className="flex min-h-24 flex-col gap-2">
                  {col.map((d) => {
                    const n = pending(d.id).length;
                    return (
                      <li key={d.id} className="rounded-lg border border-line bg-surface p-3 shadow-[0_1px_0_var(--line)] transition-colors hover:border-line-strong">
                        <Link href={`/app/deals/${d.id}`} className="block">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-[13px] font-medium leading-snug text-ink">{company(d.companyId)}</span>
                            {n > 0 && (
                              <span title={`${n} proposed ${n === 1 ? "change" : "changes"}`} className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent">
                                <span className="sr-only">{n} proposed changes</span>
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted">{dealTitle(d.name)}</span>
                          <span className="mt-2.5 flex items-center justify-between text-xs tabular-nums">
                            <span className="font-medium text-ink-2">{money(d.amount)}</span>
                            <span className="text-muted">Close {day(d.closeDate)}</span>
                          </span>
                        </Link>
                        <label className="sr-only" htmlFor={`stage-${d.id}`}>
                          Stage for {d.name}
                        </label>
                        <select
                          id={`stage-${d.id}`}
                          value={d.stage}
                          onChange={(e) => setStage(d.id, e.target.value as Stage)}
                          className="mt-2.5 h-7 w-full rounded-md border border-line bg-surface-2 px-1.5 text-xs text-ink-2 focus:border-line-strong focus:outline-none"
                        >
                          {STAGES.map((o) => (
                            <option key={o.name}>{o.name}</option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
                  {col.length === 0 && <li className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-muted">No deals</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
