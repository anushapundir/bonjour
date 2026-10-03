import { notFound } from "next/navigation";
import { DealView, type Compare } from "../../../../components/deal/DealView";
import { appData, loadLabels } from "../../../../lib/app-data";
import { RECOMMENDERS } from "../../../../lib/types";

export async function generateMetadata(props: PageProps<"/app/deals/[id]">) {
  const { id } = await props.params;
  return { title: appData().deals.find((d) => d.id === id)?.name ?? "Deal" };
}

export default async function DealPage(props: PageProps<"/app/deals/[id]">) {
  const { id } = await props.params;
  const { deals, companies, contacts, activities, runs, scoreboard } = appData();
  const deal = deals.find((d) => d.id === id);
  if (!deal) notFound();

  const compare = Object.fromEntries(
    RECOMMENDERS.map((rec) => {
      const run = scoreboard?.recommenders[rec];
      if (!run || run.status !== "ran") return [rec, { ran: false, reason: run?.reason ?? "not run yet" }];
      const score = run.perDeal.find((s) => s.dealId === id);
      return [rec, { ran: true, model: run.model, changes: runs[id]?.[rec] ?? [], verdicts: score?.verdicts ?? [], missed: score?.missed ?? 0 }];
    }),
  ) as Compare;

  return (
    <DealView
      deal={deal}
      company={companies.find((c) => c.id === deal.companyId)!}
      contacts={contacts.filter((c) => c.companyId === deal.companyId)}
      activities={activities.filter((a) => a.dealId === id).sort((a, b) => b.at.localeCompare(a.at))}
      compare={compare}
      trap={loadLabels().find((l) => l.dealId === id)?.trap}
    />
  );
}
