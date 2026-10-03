import { z } from "zod";
import { STAGE_NAMES } from "./stages";

export const Company = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  industry: z.string(),
  employees: z.number(),
});
export type Company = z.infer<typeof Company>;

export const Contact = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  title: z.string(),
  email: z.string(),
  status: z.enum(["active", "left"]),
});
export type Contact = z.infer<typeof Contact>;

export const Deal = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  stage: z.enum(STAGE_NAMES),
  amount: z.number(),
  closeDate: z.string(),
  nextStep: z.string(),
  ownerName: z.string(),
  contactIds: z.array(z.string()),
  risks: z.array(z.string()),
});
export type Deal = z.infer<typeof Deal>;

export const Activity = z.object({
  id: z.string(),
  dealId: z.string(),
  kind: z.enum(["email", "call", "note", "meeting"]),
  at: z.string(),
  from: z.string(),
  to: z.string().optional(),
  subject: z.string().optional(),
  body: z.string(),
});
export type Activity = z.infer<typeof Activity>;

export const FIELDS = ["stage", "closeDate", "amount", "nextStep", "addContact", "contactLeft", "risk"] as const;
export type Field = (typeof FIELDS)[number];

// Values stay strings so the model never fails a parse; the scorer normalizes them.
export const ProposedChange = z.object({
  field: z.enum(FIELDS),
  from: z.string().describe("Current value in the record, or empty."),
  to: z
    .string()
    .describe(
      "New value. stage: a stage name. closeDate: YYYY-MM-DD. amount: a plain number in USD. nextStep: one short sentence. addContact: 'Full Name, Title, email'. contactLeft: the contact id or full name. risk: one short sentence.",
    ),
  reason: z.string().describe("One sentence explaining the change."),
  evidence: z.object({
    activityId: z.string().describe("Id of the activity this change comes from."),
    quote: z.string().describe("Text copied exactly from that activity's body."),
  }),
});
export type ProposedChange = z.infer<typeof ProposedChange>;

// Ground truth, never shown to a model.
export const ExpectedChange = z.object({
  field: z.enum(FIELDS),
  // stage, closeDate, amount: exact value. addContact, contactLeft: contact id (name also accepted).
  value: z.string().optional(),
  // nextStep and risk: any one keyword match counts. With neither value nor keywords, any value counts.
  keywords: z.array(z.string()).optional(),
  // Acceptable but not required: never missed, never spurious.
  optional: z.boolean().optional(),
});
export type ExpectedChange = z.infer<typeof ExpectedChange>;

export const DealLabel = z.object({ dealId: z.string(), trap: z.string(), expected: z.array(ExpectedChange) });
export type DealLabel = z.infer<typeof DealLabel>;

export type Ctx = { today: string; contacts: Contact[]; company: Company };
export type Recommender = (deal: Deal, activities: Activity[], ctx: Ctx) => Promise<ProposedChange[]>;
export const RECOMMENDERS = ["rules", "naive", "bonjour"] as const;
export type RecommenderId = (typeof RECOMMENDERS)[number];
