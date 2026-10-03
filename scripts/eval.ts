import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { bonjour, naive } from "../lib/agent";
import { checkLabels } from "../lib/check";
import { totals } from "../lib/cost";
import { getDeal, loadData, loadLabels } from "../lib/data";
import { env, hasAgentKey } from "../lib/env";
import { RUNS_PATH, SCOREBOARD_PATH, readRuns, readScoreboard, type Run, type Runs, type Scoreboard } from "../lib/results";
import { rules } from "../lib/rules";
import { aggregate, scoreDeal } from "../lib/score";
import { TODAY } from "../lib/today";
import type { Recommender, RecommenderId } from "../lib/types";
import { verify, type VerifiedChange } from "../lib/verify";

const CONCURRENCY = 4;

const data = loadData();
const labels = loadLabels();
const problems = checkLabels(data, labels);
if (problems.length) {
  console.error(`Fixture problems:\n${problems.join("\n")}`);
  process.exit(1);
}

async function runAll(recommend: Recommender, model: string) {
  const changes: VerifiedChange[][] = [];
  for (let i = 0; i < data.deals.length; i += CONCURRENCY) {
    const batch = data.deals.slice(i, i + CONCURRENCY).map(async (d) => {
      const { deal, activities, ctx } = getDeal(d.id)!;
      return verify(await recommend(deal, activities, ctx), activities);
    });
    changes.push(...(await Promise.all(batch)));
  }
  const perDeal = data.deals.map((d, i) => {
    const label = labels.find((l) => l.dealId === d.id)!;
    return scoreDeal(label, changes[i]!, getDeal(d.id)!.ctx.contacts);
  });
  const run: Run = { status: "ran", model, ranAt: new Date().toISOString().slice(0, 10), aggregate: aggregate(perDeal), perDeal };
  return { run, changes };
}

const ran: Partial<Record<RecommenderId, Awaited<ReturnType<typeof runAll>>>> = { rules: await runAll(rules, "keyword rules") };
if (hasAgentKey) {
  ran.naive = await runAll(naive, env.BONJOUR_MODEL);
  ran.bonjour = await runAll(bonjour, env.BONJOUR_MODEL);
}

// Without a key, keep earlier LLM results instead of replacing a paid run with "not run yet".
const previousBoard = readScoreboard();
const previousRuns = readRuns();
const notRun: Run = { status: "not_run", reason: "not run yet (ANTHROPIC_API_KEY not set)" };
const pick = (id: RecommenderId): Run => ran[id]?.run ?? (previousBoard?.recommenders[id]?.status === "ran" ? previousBoard.recommenders[id] : notRun);

const board: Scoreboard = { today: TODAY, recommenders: { rules: pick("rules"), naive: pick("naive"), bonjour: pick("bonjour") } };
const runs: Runs = Object.fromEntries(
  data.deals.map((d, i) => {
    const entry: Runs[string] = {};
    for (const id of ["rules", "naive", "bonjour"] as const) {
      const changes = ran[id]?.changes[i] ?? (board.recommenders[id].status === "ran" ? previousRuns?.[d.id]?.[id] : undefined);
      if (changes) entry[id] = changes;
    }
    return [d.id, entry];
  }),
);

mkdirSync(dirname(SCOREBOARD_PATH), { recursive: true });
writeFileSync(SCOREBOARD_PATH, JSON.stringify(board, null, 2) + "\n");
writeFileSync(RUNS_PATH, JSON.stringify(runs, null, 2) + "\n");

for (const [id, run] of Object.entries(board.recommenders)) {
  if (run.status === "not_run") {
    console.log(`${id}: ${run.reason}`);
    continue;
  }
  const a = run.aggregate;
  const recall = a.riskRecall === null ? "n/a" : `${Math.round(a.riskRecall * 100)}%`;
  console.log(
    `${id} (${run.model}): correct ${a.correct}/${a.expected} (cited ${a.correctCited}), wrong value ${a.wrongValue}, missed ${a.missed}, spurious ${a.spurious}, unsupported ${a.unsupported}/${a.proposed}, risk recall ${recall}, no-change deals untouched ${a.noChangeDealsUntouched}/${a.noChangeDeals}`,
  );
}
if (totals.calls) console.log(`API calls ${totals.calls}, tokens in ${totals.inputTokens}, out ${totals.outputTokens}, ~$${totals.usd.toFixed(4)}${totals.unpriced ? ` (+${totals.unpriced} calls at unknown price)` : ""}`);
