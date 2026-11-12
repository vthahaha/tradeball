import { NextResponse } from "next/server";
import { appOrigin, GoogleAuthError, startGoogleLogin } from "@/lib/google";

// Step 1: send the browser to Google's account picker.
export async function GET(req: Request) {
  const origin = appOrigin(req);
  try {
    return NextResponse.redirect(await startGoogleLogin(origin));
  } catch (e) {
    const msg = e instanceof GoogleAuthError ? e.message : "Couldn't start Google sign-in.";
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(msg)}`);
  }
}
