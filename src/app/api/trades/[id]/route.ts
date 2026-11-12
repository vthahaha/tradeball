import { getSessionUserId } from "@/lib/session";
import { actOnTrade, TradeError, type TradeAction } from "@/lib/trades";

const ACTIONS: TradeAction[] = ["accept", "decline", "cancel"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;
  const { action } = await req.json().catch(() => ({}));
  if (!ACTIONS.includes(action)) return Response.json({ error: "Unknown action" }, { status: 400 });
  try {
    const t = await actOnTrade(userId, id, action);
    return Response.json({ status: t?.status });
  } catch (e) {
    if (e instanceof TradeError) return Response.json({ error: e.message }, { status: 409 });
    throw e;
  }
}
