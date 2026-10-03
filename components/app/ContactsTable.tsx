"use client";

import Link from "next/link";
import { initials, dealTitle } from "../../lib/format";
import { PageHeader } from "../ui";
import { useDemo } from "./DemoState";

export function ContactsTable() {
  const { data, liveDeal } = useDemo();
  const live = data.deals.map((d) => liveDeal(d.id)!);
  const rows = data.contacts.map((c) => {
    const deals = live.filter((d) => d.contactIds.includes(c.id));
    const left = c.status === "left" || live.some((d) => d.leftContactIds.includes(c.id));
    return { ...c, left, company: data.companies.find((x) => x.id === c.companyId)?.name ?? "", deals };
  });

  return (
    <div>
      <PageHeader title="Contacts" sub={`${rows.length} people, ${rows.filter((r) => r.left).length} marked as left`} />
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Deals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} id={r.id} className="scroll-mt-24 target:bg-accent-soft hover:bg-surface-2/60">
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-ink-2">{initials(r.name)}</span>
                    <span>
                      <span className={`block font-medium ${r.left ? "text-muted line-through decoration-line-strong" : "text-ink"}`}>{r.name}</span>
                      <span className="block text-xs text-muted">{r.title}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-ink-2">{r.company}</td>
                <td className="px-3 py-2.5 text-ink-2">{r.email}</td>
                <td className="px-3 py-2.5">
                  {r.left ? (
                    <span className="rounded bg-bad-soft px-1.5 py-0.5 text-xs font-medium text-bad">Left</span>
                  ) : (
                    <span className="text-xs text-muted">Active</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {r.deals.map((d) => (
                    <Link key={d.id} href={`/app/deals/${d.id}`} className="block text-ink-2 hover:text-accent hover:underline">
                      {dealTitle(d.name)}
                    </Link>
                  ))}
                  {r.deals.length === 0 && <span className="text-muted">None</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
