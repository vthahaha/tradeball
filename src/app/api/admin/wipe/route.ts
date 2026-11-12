import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import { wipeCollections } from "@/lib/wipe";

// Admin-only relaunch wipe. The body must carry { confirm: "WIPE" }.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.username)) return new Response("Not found", { status: 404 });
  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "WIPE") return Response.json({ error: 'Type "WIPE" to confirm.' }, { status: 400 });
  return Response.json(await wipeCollections());
}
