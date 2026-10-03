import { hasLiveAccess } from "../../../../../lib/access";
import { bonjour } from "../../../../../lib/agent";
import { getDeal } from "../../../../../lib/data";
import { hasAgentKey } from "../../../../../lib/env";
import { verify } from "../../../../../lib/verify";

export async function POST(req: Request, ctx: RouteContext<"/api/deals/[id]/run">) {
  const { id } = await ctx.params;
  const found = getDeal(id);
  if (!found) return Response.json({ error: "Deal not found" }, { status: 404 });
  if (!hasLiveAccess(req)) return Response.json({ error: "Live runs are disabled on this deployment" }, { status: 403 });
  if (!hasAgentKey) return Response.json({ error: "Live runs are not configured on this server" }, { status: 503 });

  try {
    const changes = await bonjour(found.deal, found.activities, found.ctx);
    return Response.json({ dealId: id, changes: verify(changes, found.activities) });
  } catch (err) {
    console.error(`run failed for ${id}`, err);
    return Response.json({ error: "Could not run the agent on this deal" }, { status: 502 });
  }
}
