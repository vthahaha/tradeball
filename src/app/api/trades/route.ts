import { getSessionUserId } from "@/lib/session";
import { createTrade, TradeError } from "@/lib/trades";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    const trade = await createTrade(userId, body);
    return Response.json({ id: trade.id });
  } catch (e) {
    if (e instanceof TradeError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
