import { ProfileError, toggleShowcase } from "@/lib/profile";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Not signed in" }, { status: 401 });
  const { id, on } = await req.json().catch(() => ({}));
  try {
    const showcase = await toggleShowcase(userId, String(id), Boolean(on));
    return Response.json({ showcase });
  } catch (e) {
    if (e instanceof ProfileError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
