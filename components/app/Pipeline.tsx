"use client";

import Link from "next/link";
import { day, money, dealTitle } from "../../lib/format";
import { STAGES, type Stage } from "../../lib/stages";
import { Monogram, PageHeader, Square, stageTone } from "../ui";
import { useDemo } from "./DemoState";

export function Pipeline() {
  const { data, liveDeal, pending, setStage } = useDemo();
  const deals = data.deals.map((d) => liveDeal(d.id)!);
  const company = (id: string) => data.companies.find((c) => c.id === id)?.name ?? "";
  const open = deals.filter((d) => !d.stage.startsWith("Closed")).reduce((n, d) => n + d.amount, 0);

  return (
    <div>
      <PageHeader
        title="Pipeline"
        sub={
          <>
            <span className="font-mono text-[13px] text-ink-2">{money(open)}</span> open across <span className="font-mono text-[13px] text-ink-2">{deals.length}</span> deals
          </>
        }
      >
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span className="size-2 rounded-full bg-[#eab308]" /> Bonjour has changes for you to review
        </p>
      </PageHeader>
      <div className="relative -mx-4 overflow-x-auto px-4 pb-4 lg:-mx-8 lg:px-8">
        <div className="grid auto-cols-[248px] grid-flow-col gap-3">
          {STAGES.map((s) => {
            const col = deals.filter((d) => d.stage === s.name);
            return (
              <section key={s.name} aria-label={s.name} className="flex flex-col rounded-[12px] bg-surface-2 p-1.5">
                <header className="flex items-center gap-2 px-2 pb-2 pt-1.5">
                  <Square color={stageTone(s.name)} className="size-2.5 rounded-[3px]" />
                  <h2 className="text-[13px] font-medium text-ink">{s.name}</h2>
                  <span className="font-mono text-[11px] text-muted">{col.length}</span>
                  <span className="ml-auto font-mono text-[11px] text-muted">{col.length ? money(col.reduce((n, d) => n + d.amount, 0)) : ""}</span>
                </header>
                <ul className="flex min-h-24 flex-col gap-2">
                  {col.map((d) => {
                    const n = pending(d.id).length;
                    return (
                      <li key={d.id} className="rounded-[10px] border border-line bg-surface p-3 shadow-panel transition-colors duration-150 hover:border-line-strong">
                        <Link href={`/app/deals/${d.id}`} className="block">
                          <span className="flex items-start gap-2.5">
                            <Monogram name={company(d.companyId)} />
                            <span className="min-w-0 flex-1 text-[13.5px] font-medium leading-snug text-ink">{company(d.companyId)}</span>
                            {n > 0 && (
                              <span title={`${n} proposed ${n === 1 ? "change" : "changes"}`} className="mt-1.5 size-2 shrink-0 rounded-full bg-[#eab308]">
                                <span className="sr-only">{n} proposed changes</span>
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block pl-[38px] text-xs leading-snug text-muted">{dealTitle(d.name)}</span>
                          <span className="mt-3 flex items-center justify-between font-mono text-[11.5px]">
                            <span className="text-ink">{money(d.amount)}</span>
                            <span className="text-muted">close {day(d.closeDate)}</span>
                          </span>
                        </Link>
                        <label className="sr-only" htmlFor={`stage-${d.id}`}>
                          Stage for {d.name}
                        </label>
                        <select
                          id={`stage-${d.id}`}
                          value={d.stage}
                          onChange={(e) => setStage(d.id, e.target.value as Stage)}
                          className="mt-3 h-7 w-full rounded-[6px] border border-line bg-canvas px-2 text-xs text-ink-2 focus:border-line-strong focus:outline-none"
                        >
                          {STAGES.map((o) => (
                            <option key={o.name}>{o.name}</option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
                  {col.length === 0 && <li className="rounded-[10px] border border-dashed border-line-strong px-3 py-5 text-center text-[12.5px] text-muted">No deals here yet</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
