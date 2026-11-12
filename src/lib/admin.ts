import "server-only";

/**
 * Admins are listed by username in the ADMIN_USERNAMES env var (comma-separated),
 * e.g. ADMIN_USERNAMES="hai,minh". Admins open packs without spending tickets.
 */
export function isAdmin(username: string | null | undefined) {
  if (!username) return false;
  const list = (process.env.ADMIN_USERNAMES ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(username.toLowerCase());
}
