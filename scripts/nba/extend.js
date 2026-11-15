// Adds the next few players per team to the base set without touching anyone already in it.
// build.js + emit.js regenerate nba.ts from scratch and re-rank everyone, which would shift the
// rating and rarity of cards people already own; this only appends.
//
// Run fetch.sh first, then: node extend.js [perTeam=4] [Name,Name,...]
// Names in the second argument are added whatever their rank (players that inserts need).
// A new player's OVR and rarity are copied from the existing base player whose per-game
// impact is closest, so they slot into the current scale.
const fs = require("fs");
const path = require("path");
const D = path.join(__dirname, "data");
const OUT = path.join(__dirname, "..", "..", "src", "lib", "catalog", "nba.ts");
const read = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
const PER_TEAM = Number(process.argv[2] || 4);
const FORCE = new Set((process.argv[3] || "").split(",").map((s) => s.trim()).filter(Boolean));

const COUNTRY = { USA: "USA", "Democratic Republic of Congo": "DR Congo", "Bosnia & Herzegovina": "Bosnia", "Dominican Republic": "Dominican Rep." };
const r1 = (x) => Math.round(x * 10) / 10;

function statsIndex(f) {
  const j = read(f);
  const names = Object.fromEntries(j.categories.map((c) => [c.name, c.names]));
  const idx = new Map();
  for (const a of j.athletes) {
    const v = {};
    for (const c of a.categories) (names[c.name] || []).forEach((n, i) => (v[n] = Number(c.totals?.[i] ?? c.values?.[i])));
    idx.set(a.athlete.id, {
      gp: v.gamesPlayed || 0,
      pts: v.avgPoints || 0,
      reb: v.avgRebounds || 0,
      ast: v.avgAssists || 0,
      stl: v.avgSteals || 0,
      blk: v.avgBlocks || 0,
      tp: v.threePointFieldGoalPct || 0,
    });
  }
  return idx;
}
const s26 = statsIndex("stats2026.json");
const s25 = statsIndex("stats2025.json");
// Same weights as build.js, minus turnovers (nba.ts does not store them, and both sides of the
// comparison have to use the same formula)
const impact = (s) => s.pts + 1.2 * s.reb + 1.5 * s.ast + 2 * s.stl + 2 * s.blk;

const src = fs.readFileSync(OUT, "utf8");
const existing = [...src.matchAll(/^  (\{"id".*\}),?$/gm)].map((m) => JSON.parse(m[1]));
const have = new Set(existing.map((r) => r.id));
const scale = existing
  .filter((r) => r.type === "base" && r.stats)
  .map((r) => ({ s: impact({ pts: r.stats.PTS, reb: r.stats.REB, ast: r.stats.AST, stl: r.stats.STL, blk: r.stats.BLK }), ovr: r.ovr, rarity: r.rarity }));
const lowest = scale.reduce((a, b) => (a.ovr < b.ovr ? a : b));
// The middle of the lowest OVR band; below it, keep going down the scale at about one OVR per
// 1.4 impact (the slope at the bottom of the current set), never under 62.
const floorS = (() => {
  const band = scale.filter((x) => x.ovr === lowest.ovr).map((x) => x.s);
  return band.reduce((a, b) => a + b, 0) / band.length;
})();
const place = (score) =>
  score < floorS
    ? { ovr: Math.max(62, Math.round(lowest.ovr - (floorS - score) / 1.4)), rarity: "common" }
    : scale.reduce((best, x) => (Math.abs(x.s - score) < Math.abs(best.s - score) ? x : best));

const added = [];
for (const t of read("teams.json").sports[0].leagues[0].teams.map((x) => x.team)) {
  const roster = read(path.join("rosters", t.id + ".json")).athletes;
  const cands = roster
    .filter((a) => !have.has(a.id))
    .map((a) => {
      const cur = s26.get(a.id);
      const prev = s25.get(a.id);
      let s = cur && cur.gp >= 20 ? cur : prev && prev.gp >= 20 ? prev : cur && cur.gp >= 5 ? cur : null;
      const statLine = s === cur ? "2025-26" : s === prev ? "2024-25" : null;
      return { a, s, statLine, score: s ? impact(s) : 0 };
    })
    .sort((x, y) => y.score - x.score);
  const pick = [...cands.filter((c) => c.s).slice(0, PER_TEAM), ...cands.filter((c) => FORCE.has(c.a.displayName))];
  for (const c of [...new Map(pick.map((p) => [p.a.id, p])).values()]) {
    const at = c.s ? place(c.score) : { ovr: 62, rarity: "common" };
    added.push({
      id: c.a.id,
      name: c.a.displayName,
      team: t.abbreviation,
      pos: c.a.position?.abbreviation || "",
      nation: COUNTRY[c.a.birthPlace?.country] ?? c.a.birthPlace?.country ?? "",
      jersey: c.a.jersey || "",
      type: "base",
      rarity: at.rarity,
      ovr: at.ovr,
      statLine: c.statLine,
      stats: c.s ? { PTS: r1(c.s.pts), REB: r1(c.s.reb), AST: r1(c.s.ast), STL: r1(c.s.stl), BLK: r1(c.s.blk), "3P%": r1(c.s.tp) } : null,
    });
    have.add(c.a.id);
  }
}

const missing = [...FORCE].filter((n) => !added.some((r) => r.name === n));
const marker = "\n];";
const end = src.lastIndexOf(marker);
const block = `,\n  // added by extend.js on ${new Date().toISOString().slice(0, 10)}\n` + added.map((r) => "  " + JSON.stringify(r)).join(",\n");
const before = src.slice(0, end).replace(/,\s*$/, "");
fs.writeFileSync(OUT, before + block + src.slice(end));
const count = (k) => added.filter((r) => r.rarity === k).length;
console.log("added", added.length, "| E", count("epic"), "R", count("rare"), "U", count("uncommon"), "C", count("common"));
console.log("forced not found on any roster:", missing.join(", ") || "none");
for (const r of added) console.log(`${r.team.padEnd(4)} ${r.ovr} ${r.rarity.padEnd(8)} ${r.name} ${r.statLine ?? "no stats"}`);
