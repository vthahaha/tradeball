import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import { wipeUserCards } from "@/lib/wipe";

// Admin-only: delete the signed-in admin's own cards. Body must carry { confirm: "DELETE" }.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.username)) return new Response("Not found", { status: 404 });
  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "DELETE") return Response.json({ error: 'Type "DELETE" to confirm.' }, { status: 400 });
  return Response.json(await wipeUserCards(user.id));
}
