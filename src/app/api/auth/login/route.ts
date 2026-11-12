import { db } from "@/lib/db";
import { hashPin, setSession, verifyPin } from "@/lib/session";

// One form for both: unknown username → new account, known → check PIN.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim().toLowerCase();
  const pin = String(body.pin ?? "");

  if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
    return Response.json({ error: "Username: 3–16 letters, numbers or _" }, { status: 400 });
  }
  if (!/^\d{4,8}$/.test(pin)) {
    return Response.json({ error: "PIN: 4–8 digits" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    if (!verifyPin(pin, existing.pinHash)) {
      return Response.json({ error: "Wrong PIN for that username" }, { status: 401 });
    }
    await setSession(existing.id);
    return Response.json({ ok: true, created: false });
  }

  // Private league: if INVITE_CODE is set, new accounts need it.
  const invite = process.env.INVITE_CODE?.trim();
  if (invite && String(body.invite ?? "").trim().toLowerCase() !== invite.toLowerCase()) {
    return Response.json(
      { error: "New here? You need the invite code from a friend.", needInvite: true },
      { status: 403 },
    );
  }

  const user = await db.user.create({ data: { username, pinHash: hashPin(pin) } });
  await db.activity.create({ data: { userId: user.id, kind: "join", payload: "{}" } });
  await setSession(user.id);
  return Response.json({ ok: true, created: true });
}
