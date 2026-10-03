import { loadData, loadLabels } from "./data";
import { readRuns, readScoreboard } from "./results";

// Server only: everything the UI shows comes from the fixtures and the committed eval run.
export function appData() {
  const data = loadData();
  return { ...data, runs: readRuns() ?? {}, scoreboard: readScoreboard() };
}

export type AppData = ReturnType<typeof appData>;
export { loadLabels };
