import { db } from "@/lib/db";
import { openPack, PACK_TYPES, PackError, packStatus, type PackType } from "@/lib/packs";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { type } = await req.json().catch(() => ({}));
  if (!(type in PACK_TYPES)) return Response.json({ error: "Unknown pack" }, { status: 400 });

  try {
    const { cards } = await openPack(userId, type as PackType);
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    return Response.json({ cards, status: packStatus(user) });
  } catch (e) {
    if (e instanceof PackError) return Response.json({ error: e.message }, { status: 409 });
    throw e;
  }
}
