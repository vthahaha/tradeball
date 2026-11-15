// Fails when two card sets define the same unscoped card class.
//
// Every insert set lives in globals.css and shares the .tb-ins__* / .tb-rev__* namespace. A set's
// own tweaks are scoped (`.tb-ins--botb .tb-ins__name`), but a new set that writes a bare
// `.tb-ins__plate { ... }` for its own element silently restyles any older set that already
// owns .tb-ins__plate (that is how Best of the Best and Generational broke). This finds every
// bare rule per class and fails if one class has bare rules in two places far apart, i.e. two
// different sets. Rules inside @media / @container / @keyframes are overrides and are skipped.
//
//   node scripts/check-css.mjs        (runs before every build)
import { readFileSync } from "node:fs";

const FILE = new URL("../src/app/globals.css", import.meta.url);
const NEAR = 60; // lines: bare rules for one class this close together are one set's block
const css = readFileSync(FILE, "utf8");

// walk the file, tracking brace depth so nested at-rule bodies can be skipped
const seen = new Map(); // class -> [line, ...]
let depth = 0;
let atDepth = -1; // depth at which an @media/@container/@keyframes body opened
let buf = "";
let line = 1;
let selLine = 1;
for (let i = 0; i < css.length; i++) {
  const ch = css[i];
  if (ch === "/" && css[i + 1] === "*") {
    const end = css.indexOf("*/", i + 2);
    line += (css.slice(i, end).match(/\n/g) || []).length;
    i = end + 1;
    continue;
  }
  if (ch === "\n") line++;
  if (ch === "{") {
    const sel = buf.trim();
    if (sel.startsWith("@")) {
      if (atDepth < 0 && /^@(media|container|keyframes|supports)/.test(sel)) atDepth = depth;
    } else if (atDepth < 0 && depth === 0) {
      for (const part of sel.split(",").map((s) => s.trim())) {
        // only rules that style the element itself (optionally a pseudo-element/class), not a
        // variant (.x.is-bracket) or a descendant (.x .y), which are deliberate and scoped
        const m = part.match(/^\.(tb-(?:ins|rev)__[a-z0-9-]+)(?:::?[a-z-]+(?:\([^)]*\))?)?$/);
        if (m) seen.set(m[1], [...(seen.get(m[1]) ?? []), selLine]);
      }
    }
    depth++;
    buf = "";
    continue;
  }
  if (ch === "}") {
    depth--;
    if (depth === atDepth) atDepth = -1;
    buf = "";
    continue;
  }
  if (ch === ";" && depth === 0) {
    buf = "";
    continue;
  }
  if (!buf.trim()) selLine = line;
  buf += ch;
}

const clashes = [];
for (const [cls, lines] of seen) {
  const groups = [];
  for (const l of lines.sort((a, b) => a - b)) {
    const g = groups.at(-1);
    if (g && l - g.at(-1) <= NEAR) g.push(l);
    else groups.push([l]);
  }
  if (groups.length > 1) clashes.push(`  .${cls}: bare rules at lines ${groups.map((g) => g.join("/")).join(" and ")}`);
}

if (clashes.length) {
  console.error(
    "globals.css: these card classes are defined, unscoped, by more than one set. The later one restyles the earlier set's cards.\n" +
      clashes.join("\n") +
      "\nGive the new set's element its own class name (e.g. .tb-ins__rvplate), or scope the rule under its set (.tb-ins--myset .tb-ins__x).",
  );
  process.exit(1);
}
console.log(`check-css: ${seen.size} card classes, no clashes`);
