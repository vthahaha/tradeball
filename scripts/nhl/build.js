// Builds src/lib/catalog/nhl.ts: the 32 NHL teams of the 2026-27 season and 16 players from each,
// from ESPN's depth charts (lines and pairs):
//   forwards: the top three lines (C, LW, RW × 3)
//   defense: the top two pairs, and the third-pair defenseman with more ice time
//   both goalies
// plus any pinned star on the roster but off the depth chart.
//
// Run fetch.sh first, then: node build.js
//
// OVR and rarity are Gate 7's own estimates, not official ratings: each player is scored against
// his own group (forwards, defensemen, goalies) on per-game numbers from this season and last
// (this season counts more once there are games), plus a little for his team's record. Star
// ratings are pinned by hand in PINS so a rebuild keeps them.
//
// Cards never disappear: a player in the current nhl.ts who is not picked on a rebuild stays in the
// file as `retired` (owned copies still show; packs stop dropping it).
const fs = require("fs");
const path = require("path");
const D = path.join(__dirname, "data");
const OUT = path.join(__dirname, "..", "..", "src", "lib", "catalog", "nhl.ts");
const read = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
const SEASON = "2026-27";

/** Star ratings by ESPN display name (accents optional; "Name|POS" when two players share a name). */
const PINS = {
  "Connor McDavid": 97, "Nathan MacKinnon": 95, "Leon Draisaitl": 94, "Nikita Kucherov": 94, "Cale Makar": 94,
  "Connor Hellebuyck": 93, "Auston Matthews": 92, "Kirill Kaprizov": 92, "Quinn Hughes": 92, "Igor Shesterkin": 92,
  "David Pastrnak": 91, "Andrei Vasilevskiy": 91, "Jack Eichel": 90, "Sidney Crosby": 90, "Matthew Tkachuk": 90,
  "Aleksander Barkov": 90, "Mikko Rantanen": 90, "Macklin Celebrini": 90, "Mitch Marner": 89, "Jack Hughes": 89,
  "Connor Bedard": 89, "Sam Reinhart": 89, "Zach Werenski": 89, "Ilya Sorokin": 89, "Kyle Connor": 88,
  "Artemi Panarin": 88, "William Nylander": 88, "Brady Tkachuk": 88, "Adam Fox": 88, "Victor Hedman": 88,
  "Rasmus Dahlin": 88, "Jake Oettinger": 88, "Jason Robertson": 87, "Evan Bouchard": 87, "Ivan Demidov": 86,
};
const UNPINNED_MAX = 87;
const plain = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const PINS_PLAIN = Object.fromEntries(Object.entries(PINS).map(([k, v]) => [plain(k), v]));
const pinOf = (a) => PINS_PLAIN[plain(`${a.displayName}|${a.position?.abbreviation}`)] ?? PINS_PLAIN[plain(a.displayName)];
const pinKey = (a) => {
  const k = plain(`${a.displayName}|${a.position?.abbreviation}`);
  return k in PINS_PLAIN ? k : plain(a.displayName);
};

// ── Stats by ESPN athlete id, this season and last ──
const toi = (v) => {
  const m = String(v ?? "").match(/^(\d+):(\d+)$/);
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
};
function load(prefix) {
  const out = new Map();
  for (const f of fs.readdirSync(D).filter((f) => f.startsWith(prefix))) {
    const j = read(f);
    const names = Object.fromEntries(j.categories.map((c) => [c.name, c.names]));
    for (const a of j.athletes) {
      const v = {};
      for (const c of a.categories) {
        (names[c.name] || []).forEach((n, i) => {
          const raw = (c.totals ?? c.values)?.[i];
          v[n] = n === "timeOnIcePerGame" ? toi(raw) : Number(String(raw ?? "").replace(/,/g, "")) || 0;
        });
      }
      out.set(a.athlete.id, v);
    }
  }
  return out;
}
const cur = load("stats2027_");
const prev = load("stats2026_");
const gp = (s) => s?.games ?? 0;

/** A per-game number blended over two seasons: this season weighs in as its games mount. */
function blend(id, f) {
  const a = cur.get(id), b = prev.get(id);
  const ga = gp(a), gb = gp(b);
  if (!ga && !gb) return null;
  const wa = ga ? Math.min(1, ga / 40) : 0; // 40 games in, this season is the whole story
  const va = ga ? f(a, ga) : 0, vb = gb ? f(b, gb) : va;
  return wa * va + (1 - wa) * vb;
}
const METRICS = {
  F: [[(s, g) => s.points / g, 1], [(s) => s.timeOnIcePerGame, 0.4], [(s, g) => s.goals / g, 0.3]],
  D: [[(s) => s.timeOnIcePerGame, 0.8], [(s, g) => s.points / g, 0.7], [(s) => s.plusMinus / Math.max(1, s.games), 0.2]],
  G: [[(s) => s.savePct, 1], [(s) => -s.avgGoalsAgainst, 0.6], [(s, g) => s.wins / g, 0.3]],
};

/** What the card shows: this season so far. */
function statLine(group, s) {
  if (!gp(s)) return null;
  if (group === "G") return { W: s.wins, GAA: s.avgGoalsAgainst, "SV%": s.savePct };
  return { G: s.goals, A: s.assists, PTS: s.points };
}

// ── Teams and picks ──
const teamsJ = read("teams.json").sports[0].leagues[0].teams.map((t) => t.team);
const teams = [];
const rows = [];
const review = [];
const pinsFound = new Set();
for (const t of teamsJ) {
  const rec = read(`team/${t.id}.json`).team.record?.items?.[0]?.stats ?? [];
  const stat = (n) => rec.find((s) => s.name === n)?.value ?? 0;
  const ptsPct = stat("gamesPlayed") ? stat("points") / (2 * stat("gamesPlayed")) : 0.5;
  teams.push({ abbr: t.abbreviation, name: t.name, full: t.displayName, color: `#${t.color || "333333"}`, alt: `#${t.alternateColor || "999999"}`, ptsPct });

  const roster = new Map();
  for (const grp of read(`roster/${t.id}.json`).athletes ?? []) for (const a of grp.items) roster.set(a.id, a);
  const lines = (read(`depth/${t.id}.json`).depthchart ?? []).find((c) => c.name === "Default")?.positions ?? {};
  const free = (x) => roster.has(x.id) && !picked.has(x.id);
  const picked = new Map(); // id → {pos, group}
  const line = (k) => (lines[k]?.athletes ?? []).filter((x) => roster.has(x.id));
  for (const [k, pos] of [["c", "C"], ["lw", "LW"], ["rw", "RW"]]) line(k).filter(free).slice(0, 3).forEach((a) => picked.set(a.id, { pos, group: "F" }));
  const ld = line("ld"), rd = line("rd");
  [...ld.slice(0, 2), ...rd.slice(0, 2)].filter(free).forEach((a) => picked.set(a.id, { pos: "D", group: "D" }));
  // the fifth defenseman: whichever third-pair man plays more
  const third = [ld[2], rd[2]].filter((a) => a && free(a));
  third.sort((x, y) => (blend(y.id, (s) => s.timeOnIcePerGame) ?? 0) - (blend(x.id, (s) => s.timeOnIcePerGame) ?? 0));
  if (third[0]) picked.set(third[0].id, { pos: "D", group: "D" });
  line("g").filter(free).slice(0, 2).forEach((a) => picked.set(a.id, { pos: "G", group: "G" }));
  // a thin depth chart fills from the roster by ice time
  const need = { F: 9, D: 5, G: 2 };
  for (const [group, n] of Object.entries(need)) {
    const have = [...picked.values()].filter((x) => x.group === group).length;
    if (have >= n) continue;
    const isG = (a) => a.position?.abbreviation === "G";
    const isD = (a) => a.position?.abbreviation === "D";
    const pool = [...roster.values()].filter((a) => free(a) && (group === "G" ? isG(a) : group === "D" ? isD(a) : !isG(a) && !isD(a)));
    pool.sort((x, y) => (blend(y.id, (s) => s.timeOnIcePerGame) ?? 0) - (blend(x.id, (s) => s.timeOnIcePerGame) ?? 0));
    pool.slice(0, n - have).forEach((a) => picked.set(a.id, { pos: group === "F" ? a.position?.abbreviation ?? "F" : group, group }));
    review.push(`${t.abbreviation}: filled ${n - have} ${group} from the roster`);
  }
  for (const a of roster.values()) {
    if (pinOf(a) && !picked.has(a.id)) {
      const p = a.position?.abbreviation ?? "C";
      picked.set(a.id, { pos: p, group: p === "G" ? "G" : p === "D" ? "D" : "F" });
    }
  }

  for (const [id, x] of picked) {
    const a = roster.get(id);
    if (pinOf(a)) pinsFound.add(pinKey(a));
    rows.push({
      id,
      name: a.displayName,
      team: t.abbreviation,
      pos: x.pos,
      group: x.group,
      jersey: a.jersey ?? "",
      nation: a.birthPlace?.country ?? "",
      rookie: (a.experience?.years ?? 1) === 0,
      photo: a.headshot?.href ? "" : null,
      pin: pinOf(a),
      ptsPct,
    });
  }
}

// ── Ratings: z-scores within each group ──
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const sd = (xs) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2))) || 1;
const tz = (() => {
  const xs = teams.map((t) => t.ptsPct);
  const m = mean(xs), d = sd(xs);
  return new Map(teams.map((t) => [t.abbr, (t.ptsPct - m) / d]));
})();
for (const [group, metrics] of Object.entries(METRICS)) {
  const members = rows.filter((r) => r.group === group);
  const vals = metrics.map(([f]) => members.map((r) => blend(r.id, f)));
  const zs = vals.map((xs) => {
    const known = xs.filter((x) => x !== null);
    const m = mean(known), d = sd(known);
    return xs.map((x) => (x === null ? -0.8 : (x - m) / d));
  });
  const wsum = metrics.reduce((a, [, w]) => a + w, 0);
  members.forEach((r, i) => {
    // small samples (a backup goalie's ten starts) pull toward the middle
    const games = gp(cur.get(r.id)) + gp(prev.get(r.id));
    const z = (metrics.reduce((a, [, w], k) => a + w * zs[k][i], 0) / wsum) * Math.min(1, games / (group === "G" ? 40 : 25));
    r.score = r.pin ?? Math.max(58, Math.min(UNPINNED_MAX, Math.round(75 + 4.5 * z + 1.2 * tz.get(r.team))));
  });
}

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

// card numbers: team by team (alphabetical), forwards, defense, goalies
const ORDER = ["F", "D", "G"];
teams.sort((a, b) => a.full.localeCompare(b.full));
const teamIdx = new Map(teams.map((t, i) => [t.abbr, i]));
rows.sort((a, b) => teamIdx.get(a.team) - teamIdx.get(b.team) || ORDER.indexOf(a.group) - ORDER.indexOf(b.group) || b.ovr - a.ovr);
let out = rows.map((r, i) => {
  const row = { id: r.id, name: r.name, team: r.team, pos: r.pos, jersey: r.jersey, nation: r.nation, rookie: r.rookie, rarity: r.rarity, ovr: r.ovr, stats: statLine(r.group, cur.get(r.id)), no: i + 1 };
  if (r.photo === null) row.photo = null;
  return row;
});

const prevRows = fs.existsSync(OUT)
  ? fs.readFileSync(OUT, "utf8").split("\n").filter((l) => l.startsWith('  {"id"')).map((l) => JSON.parse(l.trim().replace(/,$/, "")))
  : [];
const pickedIds = new Set(out.map((r) => r.id));
const retired = prevRows.filter((r) => !pickedIds.has(r.id)).map((r) => ({ ...r, retired: true }));
retired.forEach((r, i) => (r.no = out.length + i + 1));
out = [...out, ...retired];
const active = out.filter((r) => !r.retired);

fs.writeFileSync(
  OUT,
  `// GENERATED by scripts/nhl (fetch.sh + build.js) from ESPN's ${SEASON} NHL rosters, lines and stats.
// Snapshot: ${new Date().toISOString().slice(0, 10)}. ${teams.length} teams, ${active.length} cards: each team's top three forward lines,
// top two defense pairs and the third-pair defenseman with more ice time, both goalies, and pinned
// stars${retired.length ? `; ${retired.length} more are retired (still shown to their owners, never pulled)` : ""}.
// OVR and rarity are Gate 7's own estimates (per-game play against the same group, this season and
// last, and team record), not official ratings. Stats are ${SEASON} so far. Hand edits are fine.
import type { NhlPlayerRow, NhlTeam } from "./types";

export const NHL_SEASON = "${SEASON}";

export const NHL_TEAMS: NhlTeam[] = ${JSON.stringify(teams.map(({ ptsPct, ...t }) => t), null, 2)};

export const NHL_PLAYERS: NhlPlayerRow[] = [
${out.map((r) => "  " + JSON.stringify(r)).join(",\n")}
];
`,
);

const by = (k) => active.reduce((m, r) => ((m[r[k]] = (m[r[k]] || 0) + 1), m), {});
const perTeam = Object.values(by("team"));
console.log(`teams ${teams.length}, cards ${active.length} (${Math.min(...perTeam)}-${Math.max(...perTeam)} per team), retired ${retired.length}`, by("rarity"));
console.log(JSON.stringify(by("pos")));
console.log("TOP 30:", [...active].sort((a, b) => b.ovr - a.ovr).slice(0, 30).map((r) => `${r.name} ${r.pos} ${r.ovr}`).join(" | "));
console.log("TOP UNPINNED:", [...active].filter((r) => !PINS_PLAIN[plain(r.name)]).sort((a, b) => b.ovr - a.ovr).slice(0, 20).map((r) => `${r.name} ${r.team} ${r.pos} ${r.ovr}`).join(" | "));
console.log("no stats this season:", active.filter((r) => !r.stats).length);
console.log("REVIEW:\n" + review.join("\n"));
