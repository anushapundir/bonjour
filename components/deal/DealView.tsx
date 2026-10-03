"use client";

import { ArrowClockwise, CheckCircle, Lightning, Warning } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useState } from "react";
import { findQuote } from "../../lib/apply";
import { FIELD_LABEL, day, money } from "../../lib/format";
import type { Verdict } from "../../lib/score";
import type { Activity, Company, Contact, Deal, Field, RecommenderId } from "../../lib/types";
import type { VerifiedChange } from "../../lib/verify";
import { useDemo, useUpdatedFields } from "../app/DemoState";
import { StageBadge, btn } from "../ui";
import { ActivityItem } from "./ActivityItem";
import { ChangeCard } from "./ChangeCard";

export type Compare = Record<
  RecommenderId,
  { ran: true; model: string; changes: VerifiedChange[]; verdicts: Verdict[]; missed: number } | { ran: false; reason: string }
>;

type Props = { deal: Deal; company: Company; contacts: Contact[]; activities: Activity[]; compare: Compare; trap?: string };

const TABS: { id: RecommenderId; label: string }[] = [
  { id: "bonjour", label: "Bonjour" },
  { id: "naive", label: "Naive LLM" },
  { id: "rules", label: "Rules" },
];

export function DealView({ deal: base, company, contacts, activities, compare, trap }: Props) {
  const demo = useDemo();
  const deal = demo.liveDeal(base.id) ?? { ...base, newContacts: [], leftContactIds: [] };
  const updated = useUpdatedFields(base.id);
  const [tab, setTab] = useState<RecommenderId>("bonjour");
  const [active, setActive] = useState<{ key: string; activityId: string; quote: string } | null>(null);

  const sourceOf = (c: VerifiedChange) => {
    const a = activities.find((x) => x.id === c.evidence.activityId);
    return a ? `${a.kind[0]!.toUpperCase()}${a.kind.slice(1)}, ${day(a.at)}` : "Unknown source";
  };

  const showEvidence = (key: string, c: VerifiedChange) =>
    setActive((cur) => (cur?.key === key ? null : { key, activityId: c.evidence.activityId, quote: c.evidence.quote }));

  // Bring the cited line into view once its highlight has rendered.
  useEffect(() => {
    if (!active) return;
    const el = document.getElementById(`mark-${active.activityId}`) ?? document.getElementById(active.activityId);
    el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }, [active]);

  // `k` changes with the value, so an updated field remounts and plays its highlight once.
  const field = (f: Field, value: React.ReactNode, k: string, label = FIELD_LABEL[f]) => (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd
        key={`${updated.has(f)}:${k}`}
        className={`-mx-1.5 rounded px-1.5 py-0.5 text-[13px] text-ink ${updated.has(f) ? "flash" : ""}`}
      >
        {value}
      </dd>
    </div>
  );

  const people = [
    ...contacts
      .filter((c) => deal.contactIds.includes(c.id) || deal.leftContactIds.includes(c.id))
      .map((c) => ({ id: c.id, name: c.name, title: c.title, left: c.status === "left" || deal.leftContactIds.includes(c.id), added: !base.contactIds.includes(c.id) })),
    ...deal.newContacts.map((c) => ({ id: c.email || c.name, name: c.name, title: c.title, left: false, added: true })),
  ];

  return (
    <div>
      <nav className="mb-3 text-xs text-muted">
        <Link href="/app/deals" className="hover:text-ink">
          Deals
        </Link>
        <span className="mx-1.5">/</span>
        <span>{company.name}</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{base.name}</h1>
        <StageBadge stage={deal.stage} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[260px_minmax(0,1fr)_minmax(340px,400px)]">
        {/* Record */}
        <section aria-labelledby="record" className="xl:sticky xl:top-20 xl:self-start">
          <h2 id="record" className="mb-1 text-[13px] font-semibold text-ink">
            Record
          </h2>
          <dl className="divide-y divide-line">
            {field("stage", deal.stage, deal.stage)}
            {field("amount", <span className="tabular-nums">{money(deal.amount)}</span>, String(deal.amount))}
            {field("closeDate", <span className="tabular-nums">{day(deal.closeDate)}</span>, deal.closeDate)}
            {field("nextStep", deal.nextStep, deal.nextStep)}
            <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 py-2">
              <dt className="text-xs text-muted">Owner</dt>
              <dd className="text-[13px] text-ink">{deal.ownerName}</dd>
            </div>
            {field(
              updated.has("addContact") ? "addContact" : "contactLeft",
              <ul className="space-y-1.5">
                {people.map((p) => (
                  <li key={p.id} className="leading-snug">
                    <span className={p.left ? "text-muted line-through decoration-line-strong" : ""}>{p.name}</span>
                    {p.left && <span className="ml-1.5 rounded bg-bad-soft px-1 py-px text-[11px] font-medium text-bad">Left</span>}
                    {p.added && !p.left && <span className="ml-1.5 rounded bg-accent-soft px-1 py-px text-[11px] font-medium text-accent">New</span>}
                    <span className="block text-xs text-muted">{p.title}</span>
                  </li>
                ))}
              </ul>,
              people.map((p) => `${p.id}${p.left}`).join(),
              "Contacts",
            )}
            {field(
              "risk",
              deal.risks.length ? (
                <ul className="space-y-1.5">
                  {deal.risks.map((r) => (
                    <li key={r} className="flex gap-1.5 leading-snug">
                      <Warning size={14} weight="fill" className="mt-0.5 shrink-0 text-bad" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted">None recorded</span>
              ),
              deal.risks.join(),
              "Risks",
            )}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            {company.name}, {company.industry}, {company.employees} employees
          </p>
        </section>

        {/* Proposals: second on small screens, right column on wide ones */}
        <section aria-labelledby="proposals" className="xl:order-last xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto xl:pb-4">
          <Proposals
            deal={base}
            contacts={contacts}
            compare={compare}
            tab={tab}
            setTab={setTab}
            trap={trap}
            activeKey={active?.key}
            onEvidence={showEvidence}
            sourceOf={sourceOf}
            onTab={() => setActive(null)}
          />
        </section>

        {/* Timeline */}
        <section aria-labelledby="timeline" className="min-w-0">
          <h2 id="timeline" className="mb-3 text-[13px] font-semibold text-ink">
            Activity <span className="font-normal text-muted">{activities.length}</span>
          </h2>
          <ol className="space-y-3">
            {activities.map((a) => {
              const mine = active?.activityId === a.id;
              return (
                <li key={a.id} className={`rounded-lg transition-shadow ${mine ? "ring-2 ring-mark" : ""}`}>
                  <ActivityItem activity={a} highlight={mine ? findQuote(a.body, active.quote) : null} />
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}

type ProposalsProps = {
  deal: Deal;
  contacts: Contact[];
  compare: Compare;
  tab: RecommenderId;
  setTab: (t: RecommenderId) => void;
  trap?: string;
  activeKey?: string;
  onEvidence: (key: string, c: VerifiedChange) => void;
  sourceOf: (c: VerifiedChange) => string;
  onTab: () => void;
};

function Proposals({ deal, contacts, compare, tab, setTab, trap, activeKey, onEvidence, sourceOf, onTab }: ProposalsProps) {
  const demo = useDemo();
  const mine = demo.proposals(deal.id);
  const pending = demo.pending(deal.id);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<{ message: string; needsToken?: boolean } | null>(null);
  const [token, setToken] = useState("");

  async function runLive() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${deal.id}/run`, { method: "POST", headers: token ? { "x-demo-token": token } : {} });
      const body = (await res.json().catch(() => ({}))) as { changes?: VerifiedChange[]; error?: string };
      if (res.status === 403)
        setError({ message: "Live runs are turned off on this deployment. Run the app locally with npm run dev, or enter the access token.", needsToken: true });
      else if (!res.ok || !body.changes) setError({ message: `${body.error ?? `The run failed (HTTP ${res.status})`}. The committed run is still shown below.` });
      else {
        demo.setLive(deal.id, body.changes);
        setTab("bonjour");
      }
    } catch {
      setError({ message: "Could not reach the server. Check your connection and try again." });
    } finally {
      setRunning(false);
    }
  }

  const view = compare[tab];
  const isMine = tab === "bonjour";
  const changes = isMine ? mine.changes : view.ran ? view.changes : [];
  const committed = !isMine || mine.source === "committed";

  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-3">
      <div className="flex items-center justify-between gap-2 px-1 pb-3">
        <h2 id="proposals" className="text-[13px] font-semibold text-ink">
          Proposed changes
        </h2>
        <button onClick={runLive} disabled={running} className={btn.secondary}>
          {running ? <ArrowClockwise size={14} className="animate-spin" /> : <Lightning size={14} weight="fill" className="text-accent" />}
          {running ? "Reading activity" : "Run Bonjour"}
        </button>
      </div>

      <div role="tablist" aria-label="Compare recommenders" className="mb-3 grid grid-cols-3 gap-0.5 rounded-lg border border-line bg-surface p-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              onTab();
            }}
            className={`h-7 rounded-md text-xs font-medium transition-colors ${tab === t.id ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mb-3 px-1 text-xs leading-relaxed text-muted">
        {isMine && mine.source === "live"
          ? "From a live run just now. "
          : view.ran
            ? `From the committed eval run (${view.model}). `
            : ""}
        {!isMine && "Read only, graded against the hand-written answer key."}
        {isMine && mine.source === "live" && (
          <button onClick={() => demo.setLive(deal.id, null)} className="font-medium text-accent hover:underline">
            Show committed run
          </button>
        )}
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-line bg-surface p-3 text-[12.5px] leading-relaxed text-ink-2" role="alert">
          {error.message}
          {error.needsToken && (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                runLive();
              }}
            >
              <label htmlFor="token" className="sr-only">
                Access token
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Access token"
                className="h-8 min-w-0 flex-1 rounded-md border border-line bg-surface px-2 text-[13px] text-ink placeholder:text-muted"
              />
              <button className={btn.secondary}>Retry</button>
            </form>
          )}
        </div>
      )}

      {!view.ran && !isMine && <p className="px-1 py-6 text-center text-[13px] text-muted">This baseline has not been run yet.</p>}

      {isMine && pending.length > 1 && (
        <button
          onClick={() => pending.forEach(({ change, key }) => demo.decide(deal.id, key, change, "approved"))}
          className={`${btn.primary} mb-3 w-full`}
        >
          <CheckCircle size={15} weight="fill" />
          Approve all supported ({pending.length})
        </button>
      )}

      <div className="space-y-2">
        {changes.length === 0 && (view.ran || isMine) && (
          <div className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-muted">
            No changes proposed. Nothing in the activity changes this record.
          </div>
        )}
        {changes.map((c, i) => {
          const key = isMine ? mine.keys[i]! : `${deal.id}:${tab}:${i}`;
          const status = isMine ? demo.state.decisions[key] : undefined;
          return (
            <ChangeCard
              key={key}
              change={c}
              contacts={contacts}
              source={sourceOf(c)}
              verdict={committed && view.ran ? view.verdicts[i] : undefined}
              status={status}
              active={activeKey === key}
              onEvidence={() => onEvidence(key, c)}
              actions={
                isMine && c.supported ? (
                  status ? (
                    <button onClick={() => demo.decide(deal.id, key, c, null)} className={btn.ghost}>
                      Undo
                    </button>
                  ) : (
                    <span className="flex gap-1.5">
                      <button onClick={() => demo.decide(deal.id, key, c, "rejected")} className={btn.secondary}>
                        Reject
                      </button>
                      <button onClick={() => demo.decide(deal.id, key, c, "approved")} className={btn.primary}>
                        Approve
                      </button>
                    </span>
                  )
                ) : null
              }
            />
          );
        })}
      </div>

      {committed && view.ran && view.missed > 0 && (
        <p className="mt-3 rounded-lg bg-bad-soft px-3 py-2 text-[12.5px] text-bad">
          Missed {view.missed} expected {view.missed === 1 ? "change" : "changes"} on this deal.
        </p>
      )}

      {trap && !isMine && (
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted">
          <span className="font-medium text-ink-2">What makes this deal tricky: </span>
          {trap}
        </p>
      )}
    </div>
  );
}

