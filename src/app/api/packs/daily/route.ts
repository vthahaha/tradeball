import { claimDaily, PackError, packStatus } from "@/lib/packs";
import { getSessionUserId } from "@/lib/session";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });
  try {
    const user = await claimDaily(userId);
    return Response.json({ status: packStatus(user) });
  } catch (e) {
    if (e instanceof PackError) return Response.json({ error: e.message }, { status: 409 });
    throw e;
  }
}
