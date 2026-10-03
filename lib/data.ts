import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { Activity, Company, Contact, Deal, DealLabel, type Ctx } from "./types";
import { TODAY } from "./today";

const DATA_DIR = join(process.cwd(), "data");
const read = <T extends z.ZodType>(file: string, schema: T): z.infer<T> =>
  schema.parse(JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")));

export type Dataset = {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
};

let cached: Dataset | undefined;

export function loadData(): Dataset {
  return (cached ??= {
    companies: read("companies.json", z.array(Company)),
    contacts: read("contacts.json", z.array(Contact)),
    deals: read("deals.json", z.array(Deal)),
    activities: read("activities.json", z.array(Activity)),
  });
}

// Kept apart from loadData so nothing that builds a prompt can reach the answers.
export const loadLabels = () => read("labels.json", z.array(DealLabel));

export function getDeal(id: string) {
  const data = loadData();
  const deal = data.deals.find((d) => d.id === id);
  if (!deal) return null;
  const company = data.companies.find((c) => c.id === deal.companyId);
  if (!company) throw new Error(`Deal ${id} points at a missing company`);
  const ctx: Ctx = { today: TODAY, company, contacts: data.contacts.filter((c) => c.companyId === deal.companyId) };
  return { deal, activities: data.activities.filter((a) => a.dealId === id), ctx };
}
