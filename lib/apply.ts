import { STAGE_NAMES, type Stage } from "./stages";
import type { Contact, Deal, Field } from "./types";

export type NewContact = { name: string; title: string; email: string };
export type LiveDeal = Deal & { newContacts: NewContact[]; leftContactIds: string[] };
export type Applied = { field: Field; to: string };

const findContact = (to: string, contacts: Contact[]) => {
  const t = to.toLowerCase();
  return contacts.find((c) => t.includes(c.id) || t.includes(c.name.toLowerCase()));
};

// Approved changes replayed in order over the fixture record, so the last one wins.
export function applyChanges(deal: Deal, changes: Applied[], contacts: Contact[]): LiveDeal {
  const live: LiveDeal = { ...deal, contactIds: [...deal.contactIds], risks: [...deal.risks], newContacts: [], leftContactIds: [] };
  for (const { field, to } of changes) {
    switch (field) {
      case "stage":
        if (STAGE_NAMES.includes(to as Stage)) live.stage = to as Stage;
        break;
      case "closeDate": {
        const date = to.match(/\d{4}-\d{2}-\d{2}/)?.[0];
        if (date) live.closeDate = date;
        break;
      }
      case "amount": {
        const n = Number(to.replace(/[^0-9.]/g, ""));
        if (n) live.amount = n;
        break;
      }
      case "nextStep":
        live.nextStep = to;
        break;
      case "risk":
        if (!live.risks.includes(to)) live.risks.push(to);
        break;
      case "addContact": {
        const known = findContact(to, contacts);
        if (known) {
          if (!live.contactIds.includes(known.id)) live.contactIds.push(known.id);
        } else {
          const [name = to, title = "", email = ""] = to.split(",").map((s) => s.trim());
          live.newContacts.push({ name, title, email });
        }
        break;
      }
      case "contactLeft": {
        const known = findContact(to, contacts);
        if (known && !live.leftContactIds.includes(known.id)) live.leftContactIds.push(known.id);
        break;
      }
    }
  }
  return live;
}

// Same whitespace-insensitive match as the citation check, but returns where the quote sits.
export function findQuote(body: string, quote: string): { start: number; end: number } | null {
  const words = quote.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const re = new RegExp(words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+"));
  const m = re.exec(body);
  return m ? { start: m.index, end: m.index + m[0].length } : null;
}
