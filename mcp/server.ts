import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { bonjour } from "../lib/agent";
import { getDeal, loadData } from "../lib/data";
import { hasAgentKey } from "../lib/env";
import { verify } from "../lib/verify";

// Stdout is the protocol channel, so log lines go to stderr.
console.log = console.error;

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});
const fail = (message: string) => ({ ...text(message), isError: true });

const server = new McpServer({ name: "bonjour", version: "0.1.0" });

server.registerTool("list_deals", { description: "List deals (id, name, company, stage, amount, close date)." }, async () => {
  const { deals, companies } = loadData();
  return text(
    deals.map(({ id, name, companyId, stage, amount, closeDate }) => ({
      id,
      name,
      company: companies.find((c) => c.id === companyId)?.name,
      stage,
      amount,
      closeDate,
    })),
  );
});

server.registerTool(
  "get_deal",
  { description: "Get one deal record with its company, contacts and activities.", inputSchema: { id: z.string() } },
  async ({ id }) => {
    const found = getDeal(id);
    return found ? text(found) : fail(`Unknown deal: ${id}`);
  },
);

server.registerTool(
  "propose_updates",
  {
    description:
      "Read a deal's activity and propose record updates. Every change cites an activity and a quote; 'supported' is true only when the quote appears verbatim in that activity.",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const found = getDeal(id);
    if (!found) return fail(`Unknown deal: ${id}`);
    if (!hasAgentKey) return fail("ANTHROPIC_API_KEY is not set.");
    try {
      const changes = await bonjour(found.deal, found.activities, found.ctx);
      return text({ dealId: id, changes: verify(changes, found.activities) });
    } catch (err) {
      return fail(err instanceof Error ? err.message : String(err));
    }
  },
);

await server.connect(new StdioServerTransport());
