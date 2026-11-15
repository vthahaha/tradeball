// Contrast helpers for team colours. Team colours come from ESPN and range from near-black to
// pale gold, so text laid on them (or in them) has to be chosen per team, not hard-coded white.

const DARK = "#14213d"; // the app's ink
const LIGHT = "#ffffff";
const PAPER = "#f7f7f2";

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG relative luminance. */
export function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Text colour for a surface painted in `bg`: white or the app's dark ink, whichever reads better. */
export function inkOn(bg: string) {
  return contrast(LIGHT, bg) >= contrast(DARK, bg) ? LIGHT : DARK;
}

/** `fg` darkened just enough to read as text on light paper (4.5:1), for team colours used as ink. */
export function readableOnPaper(fg: string) {
  const [r, g, b] = rgb(fg);
  for (let k = 0; k <= 1; k += 0.05) {
    const hex = `#${[r, g, b].map((v) => Math.round(v * (1 - k)).toString(16).padStart(2, "0")).join("")}`;
    if (contrast(hex, PAPER) >= 4.5) return hex;
  }
  return DARK;
}
