"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { FIELD_LABEL, longDay, show } from "../../lib/format";
import { TODAY } from "../../lib/today";
import type { Field } from "../../lib/types";
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
    { n: withChanges.size, label: "deals with proposed changes", href: "#changes" },
    { n: atRisk.length, label: "deals at risk", href: "/app/pipeline" },
    { n: needsReply.length, label: "deals waiting on your reply", href: "/app/deals" },
  ];

  return (
    <div className="max-w-4xl">
      <p className="text-[13px] text-muted">{longDay(TODAY)}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Bonjour, Alex.</h1>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ink-2">
        Bonjour read {activityCount} emails, calls and notes across your {data.deals.length} deals. Here is what it thinks changed.
      </p>

      <dl className="mt-8 grid grid-cols-1 divide-y divide-line rounded-xl border border-line bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group px-5 py-4 transition-colors hover:bg-surface-2/60">
            <dt className="sr-only">{s.label}</dt>
            <dd className="text-3xl font-semibold tabular-nums tracking-tight text-ink">{s.n}</dd>
            <dd className="mt-0.5 text-[13px] text-muted group-hover:text-ink-2">{s.label}</dd>
          </Link>
        ))}
      </dl>

      <section id="changes" className="mt-10 scroll-mt-20">
        <h2 className="text-[15px] font-semibold text-ink">Top changes to review</h2>
        {changes.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
            <p className="text-sm text-ink">You are all caught up.</p>
            <p className="mt-1 text-[13px] text-muted">Every supported change has been approved or rejected. Reset the demo from the account menu to start over.</p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {changes.slice(0, 8).map(({ change, deal, key }) => {
              const contacts = data.contacts.filter((c) => c.companyId === deal.companyId);
              const before = show(change.field, change.from, contacts);
              return (
                <li key={key}>
                  <Link href={`/app/deals/${deal.id}`} className="group grid gap-1 px-4 py-3 transition-colors hover:bg-surface-2/60 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">{company(deal.companyId)}</span>
                      <span className="block text-xs text-muted">{FIELD_LABEL[change.field]}</span>
                    </span>
                    <span className="min-w-0 text-[13px] leading-snug">
                      {before && <span className="text-muted line-through decoration-line-strong">{before}</span>}
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
          <p className="mt-2 text-[13px] text-muted">
            {changes.length - 8} more on the{" "}
            <Link href="/app/pipeline" className="text-accent hover:underline">
              pipeline
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
