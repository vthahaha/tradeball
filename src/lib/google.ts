import "server-only";
import { cookies } from "next/headers";
import { cookieBase, sealValue, unsealValue } from "./session";

// Plain OAuth 2.0 authorization-code flow against Google. We only ask for
// openid/email/profile and read the profile from Google's userinfo endpoint
// over TLS, so no JWT verification is needed.

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const STATE_COOKIE = "tb_oauth_state";
const PENDING_COOKIE = "tb_pending";
const PENDING_TTL_MS = 15 * 60_000;

export class GoogleAuthError extends Error {}

function clientId() {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new GoogleAuthError("Google sign-in isn't configured yet (GOOGLE_CLIENT_ID missing).");
  return id;
}
function clientSecret() {
  const s = process.env.GOOGLE_CLIENT_SECRET;
  if (!s) throw new GoogleAuthError("Google sign-in isn't configured yet (GOOGLE_CLIENT_SECRET missing).");
  return s;
}

/** Public origin of the site, e.g. https://tradeball.vercel.app (project URL) */
export function appOrigin(req: Request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export const redirectUri = (origin: string) => `${origin}/api/auth/google/callback`;

export async function startGoogleLogin(origin: string) {
  const state = crypto.randomUUID();
  (await cookies()).set(STATE_COOKIE, state, { ...cookieBase, maxAge: 600 });
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `${AUTH_URL}?${params}`;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
}

export async function finishGoogleLogin(origin: string, code: string | null, state: string | null) {
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);
  if (!code || !state || !expected || state !== expected) {
    throw new GoogleAuthError("Sign-in expired or was tampered with. Please try again.");
  }

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw new GoogleAuthError("Google didn't accept the sign-in. Please try again.");
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) throw new GoogleAuthError("Google didn't return a token.");

  const infoRes = await fetch(USERINFO_URL, { headers: { authorization: `Bearer ${access_token}` } });
  if (!infoRes.ok) throw new GoogleAuthError("Couldn't read your Google profile.");
  const info = (await infoRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!info.sub || !info.email || !info.email_verified) {
    throw new GoogleAuthError("Your Google account needs a verified email.");
  }
  return {
    sub: info.sub,
    email: info.email,
    name: info.name ?? info.email.split("@")[0],
    picture: info.picture ?? null,
  } satisfies GoogleProfile;
}

// A new Google user picks a username before the account exists. Their profile
// waits in a short-lived signed cookie until then.

export async function setPendingProfile(p: GoogleProfile) {
  const value = Buffer.from(JSON.stringify({ ...p, exp: Date.now() + PENDING_TTL_MS })).toString("base64url");
  (await cookies()).set(PENDING_COOKIE, sealValue(value), { ...cookieBase, maxAge: PENDING_TTL_MS / 1000 });
}

export async function getPendingProfile(): Promise<GoogleProfile | null> {
  const value = unsealValue((await cookies()).get(PENDING_COOKIE)?.value);
  if (!value) return null;
  try {
    const p = JSON.parse(Buffer.from(value, "base64url").toString()) as GoogleProfile & { exp: number };
    return p.exp > Date.now() ? p : null;
  } catch {
    return null;
  }
}

export async function clearPendingProfile() {
  (await cookies()).delete(PENDING_COOKIE);
}

/** "Vu Tuan Hai" → "vutuanhai" (3–16 chars, a–z 0–9 _) */
export function suggestUsername(name: string, email: string) {
  const base = (name || email.split("@")[0])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 16);
  return base.length >= 3 ? base : `player${Math.floor(Math.random() * 9000 + 1000)}`;
}
