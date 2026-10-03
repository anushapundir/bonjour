import assert from "node:assert/strict";
import { test } from "node:test";
import { applyChanges, findQuote } from "../lib/apply";
import { getDeal, loadData } from "../lib/data";
import { readRuns } from "../lib/results";

test("applyChanges replays approved changes over the record", () => {
  const { deal, ctx } = getDeal("d-05")!;
  const live = applyChanges(
    deal,
    [
      { field: "amount", to: "$17,280" },
      { field: "stage", to: "Not a stage" },
      { field: "contactLeft", to: "ct-priya-nair" },
      { field: "addContact", to: "Marcus Bell, General Manager, marcus.bell@coastaldoors.example" },
      { field: "risk", to: "Champion leaving" },
      { field: "risk", to: "Champion leaving" },
    ],
    ctx.contacts,
  );
  assert.equal(live.amount, 17280);
  assert.equal(live.stage, deal.stage);
  assert.deepEqual(live.leftContactIds, ["ct-priya-nair"]);
  assert.deepEqual(live.newContacts, [{ name: "Marcus Bell", title: "General Manager", email: "marcus.bell@coastaldoors.example" }]);
  assert.deepEqual(live.risks, ["Champion leaving"]);
  assert.deepEqual(deal.risks, [], "fixture is not mutated");
});

test("findQuote locates every supported committed quote, even across line breaks", () => {
  assert.deepEqual(findQuote("a (b)\n  c.", "(b) c."), { start: 2, end: 10 });
  assert.equal(findQuote("abc", "  "), null);
  const { activities } = loadData();
  for (const [dealId, byRec] of Object.entries(readRuns() ?? {})) {
    for (const change of Object.values(byRec).flat()) {
      const body = activities.find((a) => a.id === change.evidence.activityId)?.body ?? "";
      assert.equal(Boolean(findQuote(body, change.evidence.quote)), change.supported, `${dealId} ${change.evidence.quote}`);
    }
  }
});
