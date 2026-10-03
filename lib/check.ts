import type { Dataset } from "./data";
import type { DealLabel } from "./types";

// A typo in labels.json would quietly skew every score, so fail loudly instead.
export function checkLabels(data: Dataset, labels: DealLabel[]): string[] {
  const problems: string[] = [];
  const contactIds = new Set(data.contacts.map((c) => c.id));
  for (const deal of data.deals) {
    if (!labels.some((l) => l.dealId === deal.id)) problems.push(`No label for ${deal.id}`);
    for (const id of deal.contactIds) if (!contactIds.has(id)) problems.push(`${deal.id} lists unknown contact ${id}`);
  }
  for (const label of labels) {
    if (!data.deals.some((d) => d.id === label.dealId)) problems.push(`Label for unknown deal ${label.dealId}`);
    for (const e of label.expected) {
      if (e.value?.startsWith("ct-") && !contactIds.has(e.value)) problems.push(`${label.dealId} expects unknown contact ${e.value}`);
    }
  }
  for (const a of data.activities) if (!data.deals.some((d) => d.id === a.dealId)) problems.push(`${a.id} points at unknown deal`);
  return problems;
}
