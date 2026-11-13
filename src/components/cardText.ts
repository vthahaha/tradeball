// Text helpers shared by the base card and the insert layouts.

export function initials(name: string) {
  const parts = name.replace(/[^\p{L}\s'-]/gu, "").split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function splitName(name: string): [string, string] {
  const parts = name.split(" ");
  return parts.length > 1 ? [parts[0], parts.slice(1).join(" ")] : ["", name];
}

export const lastName = (name: string) => splitName(name)[1];

/** Steps the size (in cqw) down with length; the text wraps to two lines and never clips. */
export function nameSize(name: string, scale = 1) {
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length));
  const n = Math.max(name.length / 1.75, longest);
  return (n <= 7 ? 10.5 : n <= 9 ? 9 : n <= 11 ? 7.8 : n <= 13 ? 6.8 : n <= 16 ? 5.8 : 5) * scale;
}

export const fmtStat = (singleGame: boolean, v: number) => (singleGame && Number.isInteger(v) ? String(v) : v.toFixed(1));
