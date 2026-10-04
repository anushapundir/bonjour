import type { Runs } from "../lib/results";
import type { Activity, Deal } from "../lib/types";

// A deal needs a reply when the newest thing on it is an email from the buyer.
export const needsReply = (deals: Deal[], activities: Activity[]) =>
  deals
    .filter((d) => {
      const last = activities.filter((a) => a.dealId === d.id).sort((a, b) => a.at.localeCompare(b.at)).at(-1);
      return last?.kind === "email" && !last.from.includes(d.ownerName);
    })
    .map((d) => d.id);

// The brief's three counts before anything is approved, plus the run totals, for the landing page.
export function morningCounts(deals: Deal[], activities: Activity[], runs: Runs) {
  const proposed = deals.flatMap((d) => runs[d.id]?.bonjour ?? []);
  const supported = (d: Deal) => (runs[d.id]?.bonjour ?? []).filter((c) => c.supported);
  return {
    activities: activities.length,
    deals: deals.length,
    proposed: proposed.length,
    cited: proposed.filter((c) => c.supported).length,
    withChanges: deals.filter((d) => supported(d).length > 0).length,
    atRisk: deals.filter(
      (d) => !d.stage.startsWith("Closed") && (d.risks.length > 0 || supported(d).some((c) => c.field === "risk" || c.field === "contactLeft")),
    ).length,
    needsReply: needsReply(deals, activities).length,
  };
}
