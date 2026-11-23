// Builds src/lib/catalog/mlb.ts: the 30 MLB teams and 18 players from each, from ESPN's depth charts
// (in the offseason these are next season's rosters; the stats are the last completed season):
//   the lineup: C, 1B, 2B, 3B, SS, LF, CF, RF, DH
//   the rotation's 5 starting pitchers, the closer and 3 relievers
// plus any pinned star on the roster but off the depth chart.
//
// Run fetch.sh first, then: node build.js
//
// OVR and rarity are Gate 7's own estimates, not official ratings: WAR (Baseball-Reference, via
// ESPN) for the last season, hitting or pitching; a player with no season (injured, rookie) rates
// as a fringe regular. Star ratings are pinned by hand in PINS so a rebuild keeps them.
//
// Cards never disappear: a player in the current mlb.ts who is not picked on a rebuild stays in the
// file as `retired` (owned copies still show; packs stop dropping it).
const fs = require("fs");
const path = require("path");
const D = path.join(__dirname, "data");
const OUT = path.join(__dirname, "..", "..", "src", "lib", "catalog", "mlb.ts");
const read = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
const SEASON = "2026";

/** Star ratings by ESPN display name ("Name|POS" when two players share a name). */
const PINS = {
  "Shohei Ohtani": 97, "Aaron Judge": 96, "Tarik Skubal": 94, "Bobby Witt Jr.": 93, "Paul Skenes": 93,
  "Juan Soto": 92, "Cal Raleigh": 91, "Garrett Crochet": 91, "José Ramírez": 90, "Vladimir Guerrero Jr.": 90,
  "Yoshinobu Yamamoto": 90, "Gunnar Henderson": 89, "Julio Rodríguez": 89, "Francisco Lindor": 89,
  "Kyle Tucker": 89, "Ronald Acuña Jr.": 89, "Mookie Betts": 89, "Zack Wheeler": 89,
  "Corbin Carroll": 88, "Fernando Tatis Jr.": 88, "Elly De La Cruz": 88, "Freddie Freeman": 88,
  "Jacob deGrom": 88, "Chris Sale": 88, "Pete Alonso": 87, "Bryce Harper": 87, "Mason Miller": 87,
  "Edwin Díaz": 87, "Kyle Schwarber": 87, "Jackson Chourio": 86, "Josh Hader": 86,
};
const UNPINNED_MAX = 88;
// ESPN spells MLB names without accents ("Jose Ramirez"); pins match either way
const plain = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const PINS_PLAIN = Object.fromEntries(Object.entries(PINS).map(([k, v]) => [plain(k), v]));

const LINEUP = ["c", "1b", "2b", "3b", "ss", "lf", "cf", "rf", "dh"];
const STARTERS = 5;
const RELIEVERS = 3;

// ── Last season's stats by ESPN athlete id: { batting: {...}, pitching: {...} } ──
const stats = new Map();
for (const f of fs.readdirSync(D).filter((f) => /^(batting|pitching)\d+\.json$/.test(f))) {
  const j = read(f);
  const names = Object.fromEntries(j.categories.map((c) => [c.name, c.names]));
  for (const a of j.athletes) {
    const v = stats.get(a.athlete.id) ?? {};
    for (const c of a.categories) {
      (names[c.name] || []).forEach((n, i) => {
        const x = Number(String((c.totals ?? c.values)?.[i] ?? "").replace(/,/g, ""));
        if (Number.isFinite(x)) v[`${c.name}.${n}`] = x;
      });
    }
    stats.set(a.athlete.id, v);
  }
}
const g = (s, k) => s?.[k] ?? 0;
const war = (s, pitcher) => (pitcher ? g(s, "pitching.WARBR") : g(s, "batting.WARBR"));

/** What the card shows: last season's totals. */
function statLine(pos, s) {
  if (!s) return null;
  if (pos === "SP") return g(s, "pitching.gamesPlayed") ? { ERA: g(s, "pitching.ERA"), W: g(s, "pitching.wins"), SO: g(s, "pitching.strikeouts") } : null;
  if (pos === "RP" || pos === "CL")
    return g(s, "pitching.gamesPlayed") ? { ERA: g(s, "pitching.ERA"), SV: g(s, "pitching.saves"), SO: g(s, "pitching.strikeouts") } : null;
  return g(s, "batting.gamesPlayed") ? { AVG: g(s, "batting.avg"), HR: g(s, "batting.homeRuns"), RBI: g(s, "batting.RBIs") } : null;
}

const teamsJ = read("teams.json").sports[0].leagues[0].teams.map((t) => t.team);
const teams = [];
const rows = [];
const review = [];
const pinsFound = new Set();
const pinOf = (a) => PINS_PLAIN[plain(`${a.displayName}|${a.position?.abbreviation}`)] ?? PINS_PLAIN[plain(a.displayName)];
const pinKey = (a) => {
  const k = plain(`${a.displayName}|${a.position?.abbreviation}`);
  return k in PINS_PLAIN ? k : plain(a.displayName);
};

for (const t of teamsJ) {
  teams.push({ abbr: t.abbreviation, name: t.name, full: t.displayName, color: `#${t.color || "333333"}`, alt: `#${t.alternateColor || "999999"}` });
  const roster = new Map();
  for (const grp of read(`roster/${t.id}.json`).athletes ?? []) for (const a of grp.items) roster.set(a.id, a);
  const chart = read(`depth/${t.id}.json`).depthchart?.[0]?.positions ?? {};

  const picked = new Map(); // id → {pos, depth}
  // offseason depth charts still list free agents who have left the roster: skip them
  const free = (x) => roster.has(x.id) && !picked.has(x.id);
  const emptySpots = [];
  // a lineup spot takes the first player on its line who is not already in (Judge can be RF and DH #3)
  for (const s of LINEUP) {
    const a = (chart[s]?.athletes ?? []).find(free);
    if (a) picked.set(a.id, { pos: s.toUpperCase(), depth: 0 });
    else emptySpots.push(s.toUpperCase());
  }
  const sp = (chart.p?.athletes ?? []).filter(free).slice(0, STARTERS);
  sp.forEach((a) => picked.set(a.id, { pos: "SP", depth: 0 }));
  const cl = (chart.cl?.athletes ?? []).find(free) ?? (chart.rp?.athletes ?? []).find(free);
  if (cl) picked.set(cl.id, { pos: "CL", depth: 0 });
  const rp = (chart.rp?.athletes ?? []).filter(free).slice(0, RELIEVERS);
  rp.forEach((a) => picked.set(a.id, { pos: "RP", depth: 1 }));
  // a short depth chart (offseason) fills from the roster: pitchers by last season's WAR
  const fill = (n, pos, isP) => {
    const pool = [...roster.values()].filter((a) => free(a) && (isP ? /P$/.test(a.position?.abbreviation ?? "") : !/P$/.test(a.position?.abbreviation ?? "")));
    pool.sort((x, y) => war(stats.get(y.id), isP) - war(stats.get(x.id), isP));
    pool.slice(0, n).forEach((a) => picked.set(a.id, { pos, depth: 1 }));
  };
  for (const spot of emptySpots) fill(1, spot, false); // e.g. no DH listed: the best hitter left
  if (sp.length < STARTERS) fill(STARTERS - sp.length, "SP", true);
  if (rp.length < RELIEVERS) fill(RELIEVERS - rp.length, "RP", true);
  for (const a of roster.values()) {
    if (pinOf(a) && !picked.has(a.id)) {
      const p = a.position?.abbreviation ?? "DH";
      picked.set(a.id, { pos: /P$/.test(p) ? (p === "RP" ? "RP" : "SP") : p === "OF" ? "RF" : p, depth: 0 });
    }
  }

  for (const [id, x] of picked) {
    const a = roster.get(id);
    if (!a) {
      review.push(`${t.abbreviation}: depth-chart player ${id} not on roster`);
      continue;
    }
    if (pinOf(a)) pinsFound.add(pinKey(a));
    const s = stats.get(id);
    const pitcher = ["SP", "RP", "CL"].includes(x.pos);
    const w = war(s, pitcher);
    const played = pitcher ? g(s, "pitching.gamesPlayed") >= 5 : g(s, "batting.gamesPlayed") >= 20;
    // WAR → OVR: a 0-WAR regular ~69, 3 WAR ~77, 6 WAR ~85; closers and relievers get a little for the role
    const base = played ? 69 + 2.6 * w + (x.pos === "CL" ? 3 : x.pos === "RP" ? 1 : 0) : 66;
    rows.push({
      id,
      name: a.displayName,
      team: t.abbreviation,
      pos: x.pos,
      jersey: a.jersey ?? "",
      nation: a.birthPlace?.country ?? "",
      rookie: (a.experience?.years ?? 1) === 0,
      photo: a.headshot?.href ? "" : null,
      score: pinOf(a) ?? Math.max(58, Math.min(UNPINNED_MAX, Math.round(base))),
      stats: statLine(x.pos, s),
    });
  }
}

// rarity by overall rank, the same proportions as the other base sets
rows.sort((a, b) => b.score - a.score);
const n = rows.length;
const cut = (f) => Math.round(n * f);
const [cL, cE, cR, cU] = [cut(0.018), cut(0.074), cut(0.201), cut(0.446)];
rows.forEach((r, i) => {
  const rank = i + 1;
  r.rarity = rank <= cL ? "legendary" : rank <= cE ? "epic" : rank <= cR ? "rare" : rank <= cU ? "uncommon" : "common";
  r.ovr = r.score;
});
for (const name of Object.keys(PINS_PLAIN)) if (!pinsFound.has(name)) review.push(`pin not on any roster: ${name}`);

// card numbers: team by team (alphabetical), lineup then pitchers
const ORDER = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "SP", "CL", "RP"];
teams.sort((a, b) => a.full.localeCompare(b.full));
const teamIdx = new Map(teams.map((t, i) => [t.abbr, i]));
rows.sort((a, b) => teamIdx.get(a.team) - teamIdx.get(b.team) || ORDER.indexOf(a.pos) - ORDER.indexOf(b.pos) || b.ovr - a.ovr);
let out = rows.map((r, i) => {
  const row = { id: r.id, name: r.name, team: r.team, pos: r.pos, jersey: r.jersey, nation: r.nation, rookie: r.rookie, rarity: r.rarity, ovr: r.ovr, stats: r.stats, no: i + 1 };
  if (r.photo === null) row.photo = null;
  return row;
});

// carry over cards from the current file that were not picked this time, as retired
const prev = fs.existsSync(OUT)
  ? fs.readFileSync(OUT, "utf8").split("\n").filter((l) => l.startsWith('  {"id"')).map((l) => JSON.parse(l.trim().replace(/,$/, "")))
  : [];
const pickedIds = new Set(out.map((r) => r.id));
const retired = prev.filter((r) => !pickedIds.has(r.id)).map((r) => ({ ...r, retired: true }));
retired.forEach((r, i) => (r.no = out.length + i + 1));
out = [...out, ...retired];
const active = out.filter((r) => !r.retired);

fs.writeFileSync(
  OUT,
  `// GENERATED by scripts/mlb (fetch.sh + build.js) from ESPN's MLB rosters and depth charts and the
// ${SEASON} season's stats. Snapshot: ${new Date().toISOString().slice(0, 10)}. ${teams.length} teams, ${active.length} cards: each team's
// lineup (C, 1B, 2B, 3B, SS, LF, CF, RF, DH), 5 starting pitchers, closer and 3 relievers, plus pinned
// stars${retired.length ? `; ${retired.length} more are retired (still shown to their owners, never pulled)` : ""}.
// OVR and rarity are Gate 7's own estimates (${SEASON} WAR), not official ratings. Hand edits are fine.
import type { MlbPlayerRow, MlbTeam } from "./types";

export const MLB_SEASON = "${SEASON}";

export const MLB_TEAMS: MlbTeam[] = ${JSON.stringify(teams, null, 2)};

export const MLB_PLAYERS: MlbPlayerRow[] = [
${out.map((r) => "  " + JSON.stringify(r)).join(",\n")}
];
`,
);

const by = (k) => active.reduce((m, r) => ((m[r[k]] = (m[r[k]] || 0) + 1), m), {});
const perTeam = Object.values(by("team"));
console.log(`teams ${teams.length}, cards ${active.length} (${Math.min(...perTeam)}-${Math.max(...perTeam)} per team), retired ${retired.length}`, by("rarity"));
console.log(by("pos"));
console.log("TOP 30:", [...active].sort((a, b) => b.ovr - a.ovr).slice(0, 30).map((r) => `${r.name} ${r.pos} ${r.ovr}`).join(" | "));
console.log("TOP UNPINNED:", [...active].filter((r) => !PINS_PLAIN[plain(r.name)]).sort((a, b) => b.ovr - a.ovr).slice(0, 20).map((r) => `${r.name} ${r.team} ${r.pos} ${r.ovr}`).join(" | "));
console.log("no stats:", active.filter((r) => !r.stats).length);
console.log("REVIEW:\n" + review.join("\n"));
