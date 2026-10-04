"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { FIELD_LABEL, longDay, show } from "../../lib/format";
import { TODAY } from "../../lib/today";
import type { Field } from "../../lib/types";
import { HUES, Monogram, Square } from "../ui";
import { useDemo } from "./DemoState";

const PRIORITY: Field[] = ["closeDate", "contactLeft", "risk", "stage", "amount", "addContact", "nextStep"];
const CLOSED = ["Closed Won", "Closed Lost"];

export function Brief({ needsReply, activityCount }: { needsReply: string[]; activityCount: number }) {
  const { data, pending, liveDeal } = useDemo();
  const company = (id: string) => data.companies.find((c) => c.id === id)?.name ?? "";

  const changes = data.deals
    .flatMap((d) => pending(d.id).map((p) => ({ ...p, deal: d })))
    .sort((a, b) => PRIORITY.indexOf(a.change.field) - PRIORITY.indexOf(b.change.field));
  const withChanges = new Set(changes.map((c) => c.deal.id));
  const atRisk = data.deals.filter((d) => {
    const live = liveDeal(d.id)!;
    if (CLOSED.includes(live.stage)) return false;
    return live.risks.length > 0 || changes.some((c) => c.deal.id === d.id && (c.change.field === "risk" || c.change.field === "contactLeft"));
  });

  const stats = [
    { n: withChanges.size, label: "deals with proposed changes", href: "#changes", color: HUES.blue },
    { n: atRisk.length, label: "deals at risk", href: "/app/pipeline", color: HUES.red },
    { n: needsReply.length, label: "deals waiting on your reply", href: "/app/deals", color: HUES.amber },
  ];

  return (
    <div className="max-w-4xl">
      <p className="font-mono text-xs text-muted">{longDay(TODAY)}</p>
      <h1 className="mt-2 text-[30px] font-medium leading-tight tracking-[-0.035em] text-ink sm:text-[34px]">Bonjour, Alex</h1>
      <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-ink-2">
        Overnight, Bonjour read <span className="font-mono text-[13px] text-ink">{activityCount}</span> emails, calls and meeting notes across your{" "}
        <span className="font-mono text-[13px] text-ink">{data.deals.length}</span> deals. Here is what it thinks changed.
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group flex items-center gap-3 rounded-[12px] border border-line bg-surface px-4 py-3 shadow-panel transition-colors hover:border-line-strong sm:block sm:py-3.5"
          >
            <dt className="sr-only">{s.label}</dt>
            <dd className="flex w-12 shrink-0 items-center gap-2 font-mono text-[24px] font-medium leading-none tracking-[-0.03em] text-ink tabular-nums sm:w-auto"><Square color={s.color} className="size-2.5 rounded-[3px]" />{s.n}</dd>
            <dd className="text-[13px] text-muted group-hover:text-ink-2 sm:mt-2.5">{s.label}</dd>
          </Link>
        ))}
      </dl>

      <section id="changes" className="mt-8 scroll-mt-20">
        <h2 className="text-[15px] font-medium tracking-[-0.01em] text-ink">Top changes to review</h2>
        {changes.length === 0 ? (
          <div className="mt-3 rounded-[12px] border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
            <p className="text-[15px] font-medium text-ink">You are all caught up.</p>
            <p className="mt-1 text-[13px] text-muted">Every supported change has been approved or rejected. Reset the demo from the account menu to start over.</p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-[12px] border border-line bg-surface shadow-panel">
            {changes.slice(0, 8).map(({ change, deal, key }) => {
              const contacts = data.contacts.filter((c) => c.companyId === deal.companyId);
              const before = show(change.field, change.from, contacts);
              return (
                <li key={key}>
                  <Link href={`/app/deals/${deal.id}`} className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 px-4 py-3 transition-colors hover:bg-canvas sm:grid-cols-[auto_200px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                    <Monogram name={company(deal.companyId)} className="row-span-2 size-7 self-start text-[11px] sm:row-span-1 sm:self-center" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium text-ink">{company(deal.companyId)}</span>
                      <span className="block font-mono text-[11px] text-muted">{FIELD_LABEL[change.field]}</span>
                    </span>
                    <span className="min-w-0 text-[13px] leading-snug">
                      {before && <span className="text-muted line-through decoration-faint">{before}</span>}
                      {before && <span className="mx-1.5 text-muted">to</span>}
                      <span className="font-medium text-ink">{show(change.field, change.to, contacts)}</span>
                    </span>
                    <ArrowRight size={14} className="hidden text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {changes.length > 8 && (
          <p className="mt-3 text-[13px] text-muted">
            <span className="font-mono">{changes.length - 8}</span> more on the{" "}
            <Link href="/app/pipeline" className="text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink">
              pipeline
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
