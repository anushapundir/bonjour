import type { Activity, ProposedChange } from "./types";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

// Supported means the quote is non-empty and appears verbatim in a real activity of this deal.
export function isSupported(change: ProposedChange, activities: Activity[]): boolean {
  const quote = norm(change.evidence.quote);
  if (!quote) return false;
  const activity = activities.find((a) => a.id === change.evidence.activityId);
  return Boolean(activity && norm(activity.body).includes(quote));
}

export type VerifiedChange = ProposedChange & { supported: boolean };
export const verify = (changes: ProposedChange[], activities: Activity[]): VerifiedChange[] =>
  changes.map((c) => ({ ...c, supported: isSupported(c, activities) }));
