// Turns selection.json into src/lib/catalog/nba.ts (ratings, rarity, stats).
const fs = require("fs");
const path = require("path");
const sel = JSON.parse(fs.readFileSync(path.join(__dirname, "selection.json"), "utf8"));
const OUT = path.join(__dirname, "..", "..", "src", "lib", "catalog", "nba.ts");

const COUNTRY = { USA: "USA", "Democratic Republic of Congo": "DR Congo", "Bosnia & Herzegovina": "Bosnia", "Dominican Republic": "Dominican Rep." };
const r1 = (x) => Math.round(x * 10) / 10;
const stat = (s) =>
  s ? { PTS: r1(s.pts), REB: r1(s.reb), AST: r1(s.ast), STL: r1(s.stl), BLK: r1(s.blk), "3P%": r1(s.tp) } : null;

const vets = [...sel.players].sort((a, b) => b.score - a.score);
const tierFor = (rank) =>
  rank <= 8 ? "legendary" : rank <= 30 ? "epic" : rank <= 80 ? "rare" : rank <= 180 ? "uncommon" : "common";
const ovrFor = (rank) => Math.round(97 - 25 * Math.pow(rank / vets.length, 0.6));

const rows = [];
vets.forEach((p, i) => {
  const rank = i + 1;
  rows.push({
    id: p.id,
    name: p.name,
    team: p.team,
    pos: p.pos,
    nation: COUNTRY[p.country] ?? p.country ?? "",
    jersey: p.jersey,
    type: "base",
    rarity: tierFor(rank),
    ovr: ovrFor(rank),
    statLine: p.statSrc,
    stats: stat(p.stats),
  });
});
const rookieTier = (pick) => (pick <= 3 ? "epic" : pick <= 10 ? "rare" : pick <= 20 ? "uncommon" : "common");
[...sel.rookies]
  .sort((a, b) => a.draft.pick - b.draft.pick)
  .forEach((p) => {
    rows.push({
      id: p.id,
      name: p.name,
      team: p.team,
      pos: p.pos,
      nation: COUNTRY[p.country] ?? p.country ?? "",
      jersey: p.jersey,
      type: "rookie",
      rarity: rookieTier(p.draft.pick),
      ovr: Math.round(80 - (p.draft.pick - 1) * 0.4),
      pick: p.draft.pick,
      college: p.draft.college || "",
      statLine: p.cstats ? "2025-26 college" : null,
      stats: stat(p.cstats),
    });
  });

const teams = sel.teams.map((t) => ({ abbr: t.abbr, name: t.name, full: t.full, color: t.color, alt: t.alt }));

const ts = `// GENERATED from ESPN 2026-27 rosters + 2025-26 per-game stats (2024-25 for players
// injured most of last season) + the 2026 NBA draft. Snapshot: ${new Date().toISOString().slice(0, 10)}.
// OVR and rarity are Gate 7's own estimates from per-game impact, not official ratings.
// Re-run the research script to refresh after trades; hand edits are fine too.
import type { NbaPlayerRow, NbaTeam } from "./types";

export const NBA_SEASON = "2026-27";

export const NBA_TEAMS: NbaTeam[] = ${JSON.stringify(teams, null, 2)};

export const NBA_PLAYERS: NbaPlayerRow[] = [
${rows.map((r) => "  " + JSON.stringify(r)).join(",\n")},
];
`;
fs.writeFileSync(OUT, ts);
const count = (k) => rows.filter((r) => r.rarity === k).length;
console.log("wrote", OUT, "rows", rows.length, "| L", count("legendary"), "E", count("epic"), "R", count("rare"), "U", count("uncommon"), "C", count("common"));
console.log("legendary:", rows.filter((r) => r.rarity === "legendary").map((r) => `${r.name} ${r.ovr}`).join(", "));
console.log("rookie top:", rows.filter((r) => r.type === "rookie").slice(0, 4).map((r) => `#${r.pick} ${r.name} ${r.team} ${r.ovr}`).join(", "));
console.log("countries:", [...new Set(rows.map((r) => r.nation))].join(", "));
