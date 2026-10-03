import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Aggregate, DealScore } from "./score";
import type { RecommenderId } from "./types";
import type { VerifiedChange } from "./verify";

export type Run =
  | { status: "ran"; model: string; aggregate: Aggregate; perDeal: DealScore[] }
  | { status: "not_run"; reason: string };

export type Scoreboard = { today: string; recommenders: Record<RecommenderId, Run> };
export type Runs = Record<string, Partial<Record<RecommenderId, VerifiedChange[]>>>;

const DIR = join(process.cwd(), "results");
export const SCOREBOARD_PATH = join(DIR, "scoreboard.json");
export const RUNS_PATH = join(DIR, "runs.json");

// Our own output, written by scripts/eval.ts, so it is trusted without a schema.
function read<T>(path: string): T | null {
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : null;
}

export const readScoreboard = () => read<Scoreboard>(SCOREBOARD_PATH);
export const readRuns = () => read<Runs>(RUNS_PATH);
