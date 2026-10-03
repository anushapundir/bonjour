import type Anthropic from "@anthropic-ai/sdk";

// USD per million tokens. ponytail: hand-copied list prices, update when pricing changes.
const PRICES: Record<string, { input: number; output: number; cacheRead: number }> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5, cacheRead: 0.1 },
};

export function estimateCost(model: string, usage: Anthropic.Usage): number | null {
  const p = PRICES[model];
  if (!p) return null;
  const tokens =
    usage.input_tokens * p.input +
    (usage.cache_creation_input_tokens ?? 0) * p.input * 1.25 +
    (usage.cache_read_input_tokens ?? 0) * p.cacheRead +
    usage.output_tokens * p.output;
  return tokens / 1_000_000;
}

// Running totals so a script can print what a whole run cost.
export const totals = { calls: 0, inputTokens: 0, outputTokens: 0, usd: 0, unpriced: 0 };

// One line per API call, so a run's cost can be added up from the log.
export function logUsage(step: string, model: string, usage: Anthropic.Usage): number | null {
  const cost = estimateCost(model, usage);
  console.log(
    `[bonjour cost] ${step} ${model}: in ${usage.input_tokens} (cache read ${usage.cache_read_input_tokens ?? 0}, write ${usage.cache_creation_input_tokens ?? 0}), out ${usage.output_tokens}, ~${cost === null ? "unknown price" : `$${cost.toFixed(4)}`}`,
  );
  totals.calls++;
  totals.inputTokens += usage.input_tokens + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0);
  totals.outputTokens += usage.output_tokens;
  if (cost === null) totals.unpriced++;
  else totals.usd += cost;
  return cost;
}
