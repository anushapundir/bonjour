import { STAGES } from "./stages";
import type { ProposedChange, Recommender } from "./types";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DATE = String.raw`(\d{4}-\d{2}-\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.? \d{1,2})`;

// "November 30" becomes the next such date on or after today.
function toIsoDate(text: string, today: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const m = text.toLowerCase().match(/^([a-z]{3})[a-z]*\.? (\d{1,2})$/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1]!) + 1;
  if (month === 0) return null;
  const year = Number(today.slice(0, 4));
  const iso = (y: number) => `${y}-${String(month).padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
  return iso(year) >= today ? iso(year) : iso(year + 1);
}

function sentenceAt(body: string, index: number): string {
  const start = Math.max(body.lastIndexOf(".", index), body.lastIndexOf("\n", index), body.lastIndexOf("!", index), body.lastIndexOf("?", index)) + 1;
  const ends = [".", "\n", "!", "?"].map((c) => body.indexOf(c, index)).filter((i) => i !== -1);
  const end = ends.length ? Math.min(...ends) + 1 : body.length;
  return body.slice(start, end).trim();
}

// ponytail: keyword rules over the latest email only. This is the baseline the agent has to beat.
export const rules: Recommender = async (deal, activities, ctx) => {
  const latest = activities.filter((a) => a.kind === "email").sort((a, b) => a.at.localeCompare(b.at)).at(-1);
  if (!latest) return [];
  const body = latest.body;
  const changes: ProposedChange[] = [];
  const add = (field: ProposedChange["field"], from: string, to: string, reason: string, match: RegExpMatchArray) =>
    changes.push({ field, from, to, reason, evidence: { activityId: latest.id, quote: sentenceAt(body, match.index ?? 0) } });
  const find = (re: RegExp) => body.match(re);

  const date = find(new RegExp(String.raw`(?:pushed|moved|delayed|slipped|slipping|signed by|sign by|close by|signature around|until)\s+(?:back\s+)?(?:to\s+)?${DATE}`, "i"));
  const iso = date && toIsoDate(date[1]!, ctx.today);
  if (date && iso && iso !== deal.closeDate) add("closeDate", deal.closeDate, iso, "Latest email mentions a new date.", date);

  const lost = find(/another vendor|not moving forward|decided against|going in a different direction/i);
  const positive = find(/\b(great|sounds good|excited|love|approved|signed off|move forward)\b/i);
  const stageIdx = STAGES.findIndex((s) => s.name === deal.stage);
  if (lost) add("stage", deal.stage, "Closed Lost", "Customer said they are not moving forward.", lost);
  else if (positive && stageIdx < 4) add("stage", deal.stage, STAGES[stageIdx + 1]!.name, "Positive reply, advance one stage.", positive);

  const seats = find(/\b(\d+) seats\b/i);
  const price = find(/\$(\d[\d,]*) per seat/i);
  if (seats && price) {
    const amount = Number(seats[1]) * Number(price[1]!.replace(/,/g, ""));
    if (amount !== deal.amount) add("amount", String(deal.amount), String(amount), "Seats times per seat price.", seats);
  }

  const next = find(/security (?:questionnaire|review)|procurement|order form|send over|schedule a call/i);
  if (next) add("nextStep", deal.nextStep, sentenceAt(body, next.index ?? 0), "Latest email asks for something.", next);

  const risk = find(/\b(concern|worried|risk|on hold|freeze|delay)\w*/i);
  if (risk) add("risk", "", sentenceAt(body, risk.index ?? 0), "Latest email raises a concern.", risk);

  const left = find(/last day|leaving the company|no longer with/i);
  const sender = ctx.contacts.find((c) => latest.from.toLowerCase().includes(c.email.toLowerCase()));
  if (left && sender) add("contactLeft", "", sender.id, "Sender says they are leaving.", left);

  return changes;
};
