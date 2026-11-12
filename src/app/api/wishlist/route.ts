import { getSessionUserId } from "@/lib/session";
import { setWish, TradeError } from "@/lib/trades";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });
  const { designId, on } = await req.json().catch(() => ({}));
  try {
    await setWish(userId, String(designId), Boolean(on));
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof TradeError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
