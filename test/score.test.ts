import assert from "node:assert/strict";
import { test } from "node:test";
import { checkLabels } from "../lib/check";
import { loadData, loadLabels } from "../lib/data";
import { aggregate, scoreDeal } from "../lib/score";
import type { Activity, Contact, DealLabel, ProposedChange } from "../lib/types";
import { isSupported, verify } from "../lib/verify";

const activity: Activity = {
  id: "a-1",
  dealId: "d-1",
  kind: "email",
  at: "2026-10-01T10:00:00Z",
  from: "x@example.com",
  body: "Thanks!\n\nWe will sign by   January 15.\nP.S. Sam Kowalski joins the review.",
};
const contacts: Contact[] = [
  { id: "ct-sam-r", companyId: "co", name: "Sam Reyes", title: "Ops", email: "r@x", status: "active" },
  { id: "ct-sam-k", companyId: "co", name: "Sam Kowalski", title: "IT", email: "k@x", status: "active" },
];
const change = (field: ProposedChange["field"], to: string, quote = "We will sign by January 15.", activityId = "a-1"): ProposedChange => ({
  field,
  from: "",
  to,
  reason: "",
  evidence: { activityId, quote },
});

test("citations must be a non-empty verbatim quote from a real activity", () => {
  assert.equal(isSupported(change("closeDate", "2027-01-15"), [activity]), true); // whitespace differs only
  assert.equal(isSupported(change("closeDate", "2027-01-15", "We will sign by Jan 15."), [activity]), false);
  assert.equal(isSupported(change("closeDate", "2027-01-15", "   "), [activity]), false);
  assert.equal(isSupported(change("closeDate", "2027-01-15", "We will sign", "a-404"), [activity]), false);
});

const label: DealLabel = {
  dealId: "d-1",
  trap: "test",
  expected: [
    { field: "closeDate", value: "2027-01-15" },
    { field: "amount", value: "17280" },
    { field: "addContact", value: "ct-sam-k" },
    { field: "risk", keywords: ["budget", "freeze"] },
    { field: "nextStep", keywords: ["legal"], optional: true },
  ],
};

test("scores correct, wrong, missed, spurious and unsupported separately", () => {
  const proposed = verify(
    [
      change("closeDate", "2027-01-15"),
      change("amount", "$21,600", "made up"),
      change("addContact", "Sam Reyes, Ops"),
      change("addContact", "Sam Kowalski, IT Director"),
      change("stage", "Closed Won"),
      change("nextStep", "Wait for legal review"),
    ],
    [activity],
  );
  const s = scoreDeal(label, proposed, contacts);
  assert.deepEqual(s.verdicts, ["correct", "wrong", "spurious", "correct", "spurious", "optional"]);
  assert.equal(s.correct, 2);
  assert.equal(s.correctCited, 2);
  assert.equal(s.wrongValue, 1);
  assert.equal(s.missed, 1); // the risk
  assert.equal(s.spurious, 2);
  assert.equal(s.unsupported, 1);
  assert.equal(s.risksFound, 0);
  assert.equal(s.expected, 4);
});

test("a bare first name does not match a contact; amounts and risks normalize", () => {
  const s = scoreDeal(
    label,
    verify([change("addContact", "Sam"), change("amount", "17,280.00"), change("risk", "Budget freeze until January")], [activity]),
    contacts,
  );
  assert.deepEqual(s.verdicts, ["wrong", "correct", "correct"]);
  assert.equal(s.risksFound, 1);
});

test("no-change deals count as untouched only with zero proposals", () => {
  const empty: DealLabel = { dealId: "d-2", trap: "none", expected: [] };
  const a = aggregate([scoreDeal(empty, [], contacts), scoreDeal(empty, verify([change("stage", "Demo")], [activity]), contacts)]);
  assert.equal(a.noChangeDeals, 2);
  assert.equal(a.noChangeDealsUntouched, 1);
  assert.equal(a.spurious, 1);
  assert.equal(a.riskRecall, null);
});

test("fixtures and labels agree", () => {
  assert.deepEqual(checkLabels(loadData(), loadLabels()), []);
});
