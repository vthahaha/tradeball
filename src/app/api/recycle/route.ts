import { RARITIES, type Rarity } from "@/lib/catalog";
import { planExtras, recycle, RecycleError } from "@/lib/recycle";
import { getSessionUserId } from "@/lib/session";

// Body: { ids: string[] } to recycle specific copies, or
//       { extras: true, maxRarity, dryRun? } to recycle all spare duplicates.
export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  try {
    if (body.extras) {
      const maxRarity: Rarity = RARITIES.includes(body.maxRarity) ? body.maxRarity : "rare";
      const plan = await planExtras(userId, maxRarity);
      if (body.dryRun) return Response.json(plan);
      if (plan.ids.length === 0) return Response.json({ error: "No spare duplicates to recycle." }, { status: 400 });
      return Response.json(await recycle(userId, plan.ids));
    }
    const ids = Array.isArray(body.ids) ? body.ids : [];
    return Response.json(await recycle(userId, ids));
  } catch (e) {
    if (e instanceof RecycleError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
