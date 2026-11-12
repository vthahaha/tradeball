import { db } from "@/lib/db";
import { clearPendingProfile, getPendingProfile } from "@/lib/google";
import { setSession } from "@/lib/session";

// Step 3 (new players only): create the account with the chosen username.
export async function POST(req: Request) {
  const profile = await getPendingProfile();
  if (!profile) return Response.json({ error: "Sign-in expired. Please sign in with Google again." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim().toLowerCase();
  if (!/^[a-z0-9_]{3,16}$/.test(username)) {
    return Response.json({ error: "Username: 3–16 letters, numbers or _" }, { status: 400 });
  }

  // Double-submit safety: the Google account may have been created a moment ago.
  const already = await db.user.findUnique({ where: { googleId: profile.sub } });
  if (already) {
    await clearPendingProfile();
    await setSession(already.id);
    return Response.json({ ok: true });
  }
  if (await db.user.findUnique({ where: { username } })) {
    return Response.json({ error: "That username is taken. Try another." }, { status: 409 });
  }

  const user = await db.user.create({
    data: { username, googleId: profile.sub, email: profile.email, avatarUrl: profile.picture },
  });
  await db.activity.create({ data: { userId: user.id, kind: "join", payload: "{}" } });
  await clearPendingProfile();
  await setSession(user.id);
  return Response.json({ ok: true });
}
