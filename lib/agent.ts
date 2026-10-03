import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { logUsage } from "./cost";
import { env } from "./env";
import { STAGE_NAMES } from "./stages";
import { ProposedChange, type Activity, type Ctx, type Deal, type Recommender } from "./types";

const Output = z.object({ changes: z.array(ProposedChange) });

// The naive baseline gets the same shape without being asked to cite anything.
const NaiveOutput = z.object({
  changes: z.array(
    ProposedChange.extend({
      evidence: z.object({ activityId: z.string(), quote: z.string() }).describe("Optional. Leave both empty if you like."),
    }),
  ),
});

let client: Anthropic | undefined;
export const anthropic = () => (client ??= new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    defaultHeaders: env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": env.ANTHROPIC_WORKSPACE_ID } : undefined,
  }));

async function ask(step: string, system: string, prompt: string, schema: typeof Output | typeof NaiveOutput = Output): Promise<ProposedChange[]> {
  const res = await anthropic().messages.parse({
    model: env.BONJOUR_MODEL,
    max_tokens: 8000,
    output_config: { format: zodOutputFormat(schema) },
    system,
    messages: [{ role: "user", content: prompt }],
  });
  logUsage(step, env.BONJOUR_MODEL, res.usage);
  if (!res.parsed_output) throw new Error(`No parsed output for ${step} (stop_reason: ${res.stop_reason})`);
  return res.parsed_output.changes;
}

const record = (deal: Deal, ctx: Ctx) => ({
  ...deal,
  company: ctx.company.name,
  contacts: ctx.contacts.map(({ id, name, title, email, status }) => ({ id, name, title, email, status, onDeal: deal.contactIds.includes(id) })),
});

// Stable but not chronological, so reruns of the naive baseline are comparable.
const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

export const naive: Recommender = (deal, activities, ctx) => {
  const shuffled = [...activities].sort((a, b) => hash(a.id) - hash(b.id));
  return ask(
    `naive ${deal.id}`,
    "You update CRM deal records.",
    `Here is the deal and its activity. Return updated fields.\n\nDeal:\n${JSON.stringify(record(deal, ctx), null, 2)}\n\nActivity:\n${JSON.stringify(shuffled, null, 2)}`,
    NaiveOutput,
  );
};

const SYSTEM = `You keep a sales CRM accurate. You read every email, call note and meeting note on one deal and propose updates to the deal record. A person approves or rejects each change, so propose only what the activity actually supports.

Fields you can change:
- stage: one of ${STAGE_NAMES.join(", ")}. Negotiation means the buyer has agreed in principle and paperwork is in motion: order form, contract, security questionnaire, procurement or vendor onboarding. Closed Lost means the buyer said no.
- closeDate: the date the buyer expects to sign, as YYYY-MM-DD.
- amount: annual contract value in USD as a plain number. Compute it from a confirmed seat count times the stated per seat price.
- nextStep: the single next action on the deal, one short sentence.
- addContact: a person who has joined the deal. Use "Full Name, Title, email". If they are already a known contact of the company, include their contact id.
- contactLeft: a contact who is leaving or has left. Use their contact id. Losing a contact who drives the deal is also a risk.
- risk: something that threatens the deal or its timing, one short sentence. Skip risks already in the record.

How to read the activity:
- Activities are in time order. When two activities disagree, the newer one wins.
- Today is given. Resolve relative dates ("next Tuesday", "the 20th", "end of quarter") against today and the activity's own date. "Next <weekday>" means that weekday in the following week. Look dates up in the calendar rather than counting. A date said without a year ("February 1") is the next one after the activity's own date.
- Forwarded or quoted text (below "Forwarded message", "wrote:", or lines starting with ">") is old history. Only the new text above it is news.
- Automatic replies such as out of office messages carry no deal information.
- Questions and hypotheticals ("what if we added a team", "what would it cost") are not decisions. Only a confirmed choice changes the record.
- Read tone. Sarcasm ("oh perfect, love that") is a complaint, not good news.
- Read to the end, including any P.S.
- People can share a first name. Match people by full name, email address and title, not by first name.
- Do not propose a change that repeats what the record already says. If nothing new happened, return no changes. An empty list is a good answer.

Evidence:
- Every change cites exactly one activity by its id and a quote copied character for character from that activity's body. Keep quotes short, one sentence or less, and never quote the forwarded part as evidence of something new.`;

const renderActivity = (a: Activity) =>
  [`[${a.id}] ${a.kind} on ${weekday(a.at)} ${a.at}`, `From: ${a.from}`, a.to && `To: ${a.to}`, a.subject && `Subject: ${a.subject}`].filter(Boolean).join("\n") +
  `\n\n${a.body}`;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekday = (iso: string) => DAYS[new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay()]!;

// Small models slip on date arithmetic, so hand them a calendar instead of asking them to count.
function calendar(today: string, days = 21): string {
  const start = new Date(`${today}T12:00:00Z`);
  return Array.from({ length: days }, (_, i) => {
    const iso = new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    return `${weekday(iso)} ${iso}`;
  }).join("\n");
}

export const bonjour: Recommender = (deal, activities, ctx) => {
  const sorted = [...activities].sort((a, b) => a.at.localeCompare(b.at));
  return ask(
    `bonjour ${deal.id}`,
    SYSTEM,
    `Today is ${weekday(ctx.today)} ${ctx.today}.\n\nCalendar from today:\n${calendar(ctx.today)}\n\nDeal record:\n${JSON.stringify(record(deal, ctx), null, 2)}\n\nActivities, oldest first:\n\n${sorted.map(renderActivity).join("\n\n---\n\n")}`,
  );
};
