import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appOrigin, finishGoogleLogin, GoogleAuthError, setPendingProfile } from "@/lib/google";
import { setSession } from "@/lib/session";

// Step 2: Google sends the browser back here with a one-time code.
export async function GET(req: Request) {
  const origin = appOrigin(req);
  const url = new URL(req.url);
  const fail = (msg: string) => NextResponse.redirect(`${origin}/?error=${encodeURIComponent(msg)}`);

  if (url.searchParams.get("error")) return fail("Google sign-in was cancelled.");

  try {
    const profile = await finishGoogleLogin(origin, url.searchParams.get("code"), url.searchParams.get("state"));
    const existing = await db.user.findUnique({ where: { googleId: profile.sub } });
    if (existing) {
      // Keep email/photo fresh.
      await db.user.update({
        where: { id: existing.id },
        data: { email: profile.email, avatarUrl: profile.picture },
      });
      await setSession(existing.id);
      return NextResponse.redirect(`${origin}/`);
    }
    // New player: pick a username first.
    await setPendingProfile(profile);
    return NextResponse.redirect(`${origin}/welcome`);
  } catch (e) {
    if (e instanceof GoogleAuthError) return fail(e.message);
    throw e;
  }
}
