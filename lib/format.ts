import type { Contact, Field } from "./types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const money = (n: number) => usd.format(n);

// Fixed time zone so the server and browser render the same string.
const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const dayYearFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const stampFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });
const longFmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

const asDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
export const day = (iso: string) => (iso.startsWith("2026") ? dayFmt : dayYearFmt).format(asDate(iso));
export const stamp = (iso: string) => stampFmt.format(asDate(iso));
export const longDay = (iso: string) => longFmt.format(asDate(iso));

export const FIELD_LABEL: Record<Field, string> = {
  stage: "Stage",
  closeDate: "Close date",
  amount: "Amount",
  nextStep: "Next step",
  addContact: "New contact",
  contactLeft: "Contact leaving",
  risk: "Risk",
};

// Turns a raw proposed value into what a person would write in the record.
export function show(field: Field, value: string, contacts: Contact[]): string {
  if (!value) return "";
  if (field === "amount") {
    const n = Number(value.replace(/[^0-9.]/g, ""));
    return n ? money(n) : value;
  }
  if (field === "closeDate") {
    const d = value.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    return d ? day(d) : value;
  }
  if (field === "contactLeft" || field === "addContact") {
    const c = contacts.find((c) => value.includes(c.id));
    return c ? `${c.name}, ${c.title}` : value;
  }
  return value;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// "Ironwood: starter plan" reads as "Starter plan" next to the company name.
export const dealTitle = (name: string) => {
  const s = name.split(": ")[1] ?? name;
  return s.charAt(0).toUpperCase() + s.slice(1);
};
