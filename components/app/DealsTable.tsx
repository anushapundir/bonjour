"use client";

import { CaretDown, CaretUp, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";
import { day, money, dealTitle } from "../../lib/format";
import { STAGES } from "../../lib/stages";
import { PageHeader, StageBadge } from "../ui";
import { useDemo } from "./DemoState";

type Key = "name" | "company" | "stage" | "amount" | "closeDate" | "owner" | "pending";
const COLS: { key: Key; label: string; num?: boolean }[] = [
  { key: "name", label: "Deal" },
  { key: "company", label: "Company" },
  { key: "stage", label: "Stage" },
  { key: "amount", label: "Amount", num: true },
  { key: "closeDate", label: "Close" },
  { key: "owner", label: "Owner" },
  { key: "pending", label: "To review", num: true },
];

export function DealsTable() {
  const { data, liveDeal, pending } = useDemo();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "closeDate", dir: 1 });

  const rows = data.deals.map((d) => {
    const live = liveDeal(d.id)!;
    return {
      id: d.id,
      name: dealTitle(d.name),
      company: data.companies.find((c) => c.id === d.companyId)?.name ?? "",
      stage: live.stage,
      amount: live.amount,
      closeDate: live.closeDate,
      owner: d.ownerName,
      pending: pending(d.id).length,
    };
  });
  const t = q.trim().toLowerCase();
  const stageOrder = (s: string) => STAGES.findIndex((x) => x.name === s);
  const shown = rows
    .filter((r) => !t || `${r.name} ${r.company} ${r.stage} ${r.owner}`.toLowerCase().includes(t))
    .sort((a, b) => {
      const x = sort.key === "stage" ? stageOrder(a.stage) : a[sort.key];
      const y = sort.key === "stage" ? stageOrder(b.stage) : b[sort.key];
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });

  return (
    <div>
      <PageHeader title="Deals" sub={`${rows.length} deals, ${money(rows.reduce((n, r) => n + r.amount, 0))} total`}>
        <div className="relative w-full sm:w-64">
          <MagnifyingGlass size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <label htmlFor="deal-filter" className="sr-only">
            Filter deals
          </label>
          <input
            id="deal-filter"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by deal, company, stage"
            className="h-8 w-full rounded-md border border-line bg-surface pl-8 pr-2 text-[13px] text-ink placeholder:text-muted focus:border-line-strong focus:outline-none"
          />
        </div>
      </PageHeader>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line">
              {COLS.map((c) => {
                const on = sort.key === c.key;
                return (
                  <th key={c.key} aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={`px-3 py-2 font-medium text-muted ${c.num ? "text-right" : ""}`}>
                    <button
                      onClick={() => setSort({ key: c.key, dir: on ? (-sort.dir as 1 | -1) : 1 })}
                      className={`inline-flex items-center gap-1 text-xs hover:text-ink ${on ? "text-ink" : ""}`}
                    >
                      {c.label}
                      {on && (sort.dir === 1 ? <CaretUp size={11} weight="bold" /> : <CaretDown size={11} weight="bold" />)}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((r) => (
              <tr key={r.id} className="group hover:bg-surface-2/60">
                <td className="px-3 py-2.5">
                  <Link href={`/app/deals/${r.id}`} className="font-medium text-ink group-hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-ink-2">{r.company}</td>
                <td className="px-3 py-2.5">
                  <StageBadge stage={r.stage} />
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-2">{money(r.amount)}</td>
                <td className="px-3 py-2.5 tabular-nums text-ink-2">{day(r.closeDate)}</td>
                <td className="px-3 py-2.5 text-ink-2">{r.owner}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {r.pending > 0 ? <span className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent">{r.pending}</span> : <span className="text-muted">0</span>}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="px-3 py-8 text-center text-muted">
                  No deals match &ldquo;{q}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
