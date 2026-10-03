import type { Contact, DealLabel, ExpectedChange } from "./types";
import type { VerifiedChange } from "./verify";

const lower = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const toNumber = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

export function matches(exp: ExpectedChange, change: VerifiedChange, contacts: Contact[]): boolean {
  if (exp.field !== change.field) return false;
  const to = lower(change.to);
  if (exp.keywords) return exp.keywords.some((k) => to.includes(lower(k)));
  if (exp.value === undefined) return true;
  switch (exp.field) {
    case "stage":
      return to === lower(exp.value);
    case "closeDate":
      return to.match(/\d{4}-\d{2}-\d{2}/)?.[0] === exp.value;
    case "amount":
      return toNumber(to) === Number(exp.value);
    case "addContact":
    case "contactLeft": {
      // A label names a known contact by id, or a new person by full name. A bare first name never matches.
      const known = contacts.find((c) => c.id === exp.value);
      const names = known ? [known.id, known.name] : [exp.value];
      return names.some((n) => to.includes(lower(n)));
    }
    default:
      return to.includes(lower(exp.value));
  }
}

export type Verdict = "correct" | "wrong" | "optional" | "spurious";

export type DealScore = {
  dealId: string;
  correct: number;
  correctCited: number;
  wrongValue: number;
  missed: number;
  spurious: number;
  unsupported: number;
  expected: number;
  risksExpected: number;
  risksFound: number;
  noChangeDeal: boolean;
  untouched: boolean;
  verdicts: Verdict[]; // one per proposed change, same order
};

export function scoreDeal(label: DealLabel, proposed: VerifiedChange[], contacts: Contact[]): DealScore {
  const verdicts: (Verdict | undefined)[] = proposed.map(() => undefined);
  const required = label.expected.filter((e) => !e.optional);
  const take = (exp: ExpectedChange, test: (c: VerifiedChange) => boolean) => {
    const i = proposed.findIndex((c, i) => verdicts[i] === undefined && c.field === exp.field && test(c));
    return i === -1 ? null : i;
  };

  let correct = 0, correctCited = 0, wrongValue = 0, missed = 0, risksFound = 0;
  const unmatched: ExpectedChange[] = [];
  // Required expectations pick first so an optional one never steals their match.
  for (const exp of [...required, ...label.expected.filter((e) => e.optional)]) {
    const i = take(exp, (c) => matches(exp, c, contacts));
    if (i === null) {
      if (!exp.optional) unmatched.push(exp);
      continue;
    }
    verdicts[i] = exp.optional ? "optional" : "correct";
    if (exp.optional) continue;
    correct++;
    if (proposed[i]!.supported) correctCited++;
    if (exp.field === "risk") risksFound++;
  }
  // An expected field proposed with the wrong value is one wrong answer, not a miss plus a spurious change.
  for (const exp of unmatched) {
    const i = take(exp, () => true);
    if (i === null) missed++;
    else {
      verdicts[i] = "wrong";
      wrongValue++;
    }
  }

  const final = verdicts.map((v) => v ?? "spurious");
  const noChangeDeal = label.expected.length === 0;
  return {
    dealId: label.dealId,
    correct,
    correctCited,
    wrongValue,
    missed,
    spurious: final.filter((v) => v === "spurious").length,
    unsupported: proposed.filter((c) => !c.supported).length,
    expected: required.length,
    risksExpected: required.filter((e) => e.field === "risk").length,
    risksFound,
    noChangeDeal,
    untouched: noChangeDeal && proposed.length === 0,
    verdicts: final,
  };
}

export type Aggregate = {
  deals: number;
  expected: number;
  proposed: number;
  correct: number;
  correctCited: number;
  wrongValue: number;
  missed: number;
  spurious: number;
  unsupported: number;
  riskRecall: number | null;
  noChangeDeals: number;
  noChangeDealsUntouched: number;
};

export function aggregate(scores: DealScore[]): Aggregate {
  const sum = (k: "correct" | "correctCited" | "wrongValue" | "missed" | "spurious" | "unsupported" | "expected" | "risksExpected" | "risksFound") =>
    scores.reduce((n, s) => n + s[k], 0);
  const risksExpected = sum("risksExpected");
  return {
    deals: scores.length,
    expected: sum("expected"),
    proposed: scores.reduce((n, s) => n + s.verdicts.length, 0),
    correct: sum("correct"),
    correctCited: sum("correctCited"),
    wrongValue: sum("wrongValue"),
    missed: sum("missed"),
    spurious: sum("spurious"),
    unsupported: sum("unsupported"),
    riskRecall: risksExpected ? sum("risksFound") / risksExpected : null,
    noChangeDeals: scores.filter((s) => s.noChangeDeal).length,
    noChangeDealsUntouched: scores.filter((s) => s.untouched).length,
  };
}
