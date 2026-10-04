import Link from "next/link";
import { Monogram, PageHeader } from "../../../components/ui";
import { appData } from "../../../lib/app-data";
import { money, dealTitle } from "../../../lib/format";

export const metadata = { title: "Companies" };

export default function CompaniesPage() {
  const { companies, deals, contacts } = appData();
  return (
    <div>
      <PageHeader title="Companies" sub={`${companies.length} accounts, all field service businesses`} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-panel">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] text-muted">
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Industry</th>
              <th className="px-3 py-2 text-right font-medium">Employees</th>
              <th className="px-3 py-2 text-right font-medium">Contacts</th>
              <th className="px-3 py-2 font-medium">Deal</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {companies.map((c) => {
              const own = deals.filter((d) => d.companyId === c.id);
              return (
                <tr key={c.id} className="hover:bg-surface-2/60">
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2.5">
                      <Monogram name={c.name} />
                      <span>
                        <span className="block font-medium text-ink">{c.name}</span>
                        <span className="block font-mono text-[11px] text-muted">{c.domain}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-ink-2">{c.industry}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-[12.5px] text-ink-2">{c.employees}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-[12.5px] text-ink-2">{contacts.filter((x) => x.companyId === c.id).length}</td>
                  <td className="px-3 py-2.5">
                    {own.map((d) => (
                      <Link key={d.id} href={`/app/deals/${d.id}`} className="block text-ink-2 hover:text-accent-text hover:underline">
                        {dealTitle(d.name)}
                      </Link>
                    ))}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[12.5px] text-ink">{money(own.reduce((n, d) => n + d.amount, 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
