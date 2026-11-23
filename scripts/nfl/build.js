// Builds src/lib/catalog/nfl.ts: the 32 NFL teams of the 2026 season (2026-27) and ~29 players
// from each, taken from ESPN's depth charts:
//   offense: the 11 starters (QB, RB, 3 WR, TE, LT, LG, C, RG, RT)
//   defense: the 12 starters of the team's base front (3-4 or 4-3) plus the nickel back
//   kicker and punter, and the next man up at QB, RB, TE and WR
// plus any pinned star who is not on the depth chart (injured reserve).
//
// Run fetch.sh first, then: node build.js
//
// OVR and rarity are Gate 7's own estimates, not official ratings: each player is scored against
// the starters at his own position (QBs against QBs, corners against corners) on this season's
// per-game stats, plus a little for his team's record; offensive linemen, who have no stats, rate
// on their team. Star ratings are pinned by hand in PINS so a rebuild keeps them.
const fs = require("fs");
const path = require("path");
const D = path.join(__dirname, "data");
const OUT = path.join(__dirname, "..", "..", "src", "lib", "catalog", "nfl.ts");
const read = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));

/**
 * Star ratings by ESPN display name. A pinned player is always in the set at exactly this OVR.
 * When two players share a name, add the roster position: "Justin Jefferson|WR".
 */
const PINS = {
  "Josh Allen": 95, "Lamar Jackson": 94, "Patrick Mahomes": 94, "Joe Burrow": 92, "Jayden Daniels": 90,
  "Jalen Hurts": 89, "Justin Herbert": 89,
  "Ja'Marr Chase": 94, "Justin Jefferson|WR": 93, "CeeDee Lamb": 91, "Puka Nacua": 91, "Amon-Ra St. Brown": 91,
  "Malik Nabers": 89, "Nico Collins": 89, "A.J. Brown": 89,
  "Saquon Barkley": 92, "Bijan Robinson": 92, "Jahmyr Gibbs": 92, "Derrick Henry": 89, "Christian McCaffrey": 89,
  "Brock Bowers": 90, "Trey McBride": 89, "George Kittle": 88, "Travis Kelce": 86,
  "Penei Sewell": 91, "Tristan Wirfs": 90, "Trent Williams": 89, "Creed Humphrey": 89,
  "Myles Garrett": 95, "Micah Parsons": 94, "T.J. Watt": 92, "Aidan Hutchinson": 91, "Nick Bosa": 90,
  "Chris Jones": 91, "Dexter Lawrence II": 90, "Jalen Carter": 89,
  "Fred Warner": 91, "Roquan Smith": 89,
  "Pat Surtain II": 91, "Derek Stingley Jr.": 90, "Sauce Gardner": 89, "Kyle Hamilton": 91,
};
const UNPINNED_MAX = 86;
const pinOf = (a) => PINS[`${a.displayName}|${a.position?.abbreviation}`] ?? PINS[a.displayName];
const pinKey = (a) => (`${a.displayName}|${a.position?.abbreviation}` in PINS ? `${a.displayName}|${a.position?.abbreviation}` : a.displayName);

// depth-chart slot → position printed on the card, and the group it is rated in
const OFFENSE = ["qb", "rb", "wr1", "wr2", "wr3", "te", "lt", "lg", "c", "rg", "rt"];
const BACKUPS = [["qb", 1], ["rb", 1], ["te", 1], ["wr1", 1]];
const SLOT = {
  qb: ["QB", "QB"], rb: ["RB", "RB"], wr1: ["WR", "WR"], wr2: ["WR", "WR"], wr3: ["WR", "WR"], te: ["TE", "TE"],
  lt: ["LT", "OL"], lg: ["LG", "OL"], c: ["C", "OL"], rg: ["RG", "OL"], rt: ["RT", "OL"],
  lde: ["DE", "DL"], rde: ["DE", "DL"], ldt: ["DT", "DL"], rdt: ["DT", "DL"], nt: ["NT", "DL"],
  mlb: ["LB", "LB"], lilb: ["LB", "LB"], rilb: ["LB", "LB"],
  lcb: ["CB", "DB"], rcb: ["CB", "DB"], nb: ["CB", "DB"], ss: ["S", "DB"], fs: ["S", "DB"],
  pk: ["K", "K"], p: ["P", "P"],
};
// outside linebackers: edge rushers in a 3-4, off-ball linebackers in a 4-3
const olb = (front) => (front === "3-4" ? ["OLB", "DL"] : ["LB", "LB"]);
// roster position → card position and group, for pinned players off the depth chart
const ROSTER_POS = { QB: ["QB", "QB"], RB: ["RB", "RB"], FB: ["RB", "RB"], WR: ["WR", "WR"], TE: ["TE", "TE"], OT: ["OT", "OL"], G: ["G", "OL"], C: ["C", "OL"], DE: ["DE", "DL"], DT: ["DT", "DL"], LB: ["LB", "LB"], CB: ["CB", "DB"], S: ["S", "DB"], PK: ["K", "K"], P: ["P", "P"] };

// ── Season stats by ESPN athlete id ──
const stats = new Map();
for (let p = 1; fs.existsSync(path.join(D, `stats${p}.json`)); p++) {
  const j = read(`stats${p}.json`);
  const names = Object.fromEntries(j.categories.map((c) => [c.name, c.names]));
  for (const a of j.athletes) {
    const v = {};
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

// per-game numbers each group is rated on: [metric, weight]
const METRICS = {
  QB: [[(s) => g(s, "passing.adjQBR") || g(s, "passing.QBRating") / 1.6, 1], [(s, gp) => g(s, "passing.passingYards") / gp, 1], [(s, gp) => (g(s, "passing.passingTouchdowns") - g(s, "passing.interceptions")) / gp, 1]],
  RB: [[(s, gp) => (g(s, "rushing.rushingYards") + g(s, "receiving.receivingYards")) / gp, 1], [(s, gp) => (g(s, "rushing.rushingTouchdowns") + g(s, "receiving.receivingTouchdowns")) / gp, 0.7]],
  WR: [[(s, gp) => g(s, "receiving.receivingYards") / gp, 1], [(s, gp) => g(s, "receiving.receptions") / gp, 0.5], [(s, gp) => g(s, "receiving.receivingTouchdowns") / gp, 0.5]],
  TE: [[(s, gp) => g(s, "receiving.receivingYards") / gp, 1], [(s, gp) => g(s, "receiving.receptions") / gp, 0.5], [(s, gp) => g(s, "receiving.receivingTouchdowns") / gp, 0.5]],
  DL: [[(s, gp) => g(s, "defensive.sacks") / gp, 1], [(s, gp) => g(s, "defensive.tacklesForLoss") / gp, 0.8], [(s, gp) => g(s, "defensive.totalTackles") / gp, 0.3]],
  LB: [[(s, gp) => g(s, "defensive.totalTackles") / gp, 1], [(s, gp) => g(s, "defensive.tacklesForLoss") / gp, 0.6], [(s, gp) => g(s, "defensive.sacks") / gp, 0.5], [(s, gp) => g(s, "defensive.passesDefended") / gp, 0.4]],
  DB: [[(s, gp) => g(s, "defensive.passesDefended") / gp, 1], [(s, gp) => g(s, "defensiveinterceptions.interceptions") / gp, 1], [(s, gp) => g(s, "defensive.totalTackles") / gp, 0.4]],
  K: [[(s) => g(s, "kicking.fieldGoalPct"), 1], [(s) => g(s, "kicking.fieldGoalsMade"), 0.5], [(s) => g(s, "kicking.fieldGoalsMade50"), 0.4]],
  P: [[(s) => g(s, "punting.netAvgPuntYards"), 1], [(s, gp) => g(s, "punting.puntsInside20") / gp, 0.5]],
  OL: [],
};

/** What the card shows: season totals, by group. */
function statLine(group, s) {
  if (!s || !g(s, "general.gamesPlayed")) return null;
  const gp = g(s, "general.gamesPlayed");
  switch (group) {
    case "QB": return { YDS: g(s, "passing.passingYards"), TD: g(s, "passing.passingTouchdowns"), INT: g(s, "passing.interceptions") };
    case "RB": return { YDS: g(s, "rushing.rushingYards"), TD: g(s, "rushing.rushingTouchdowns") + g(s, "receiving.receivingTouchdowns"), REC: g(s, "receiving.receptions") };
    case "WR": case "TE": return { REC: g(s, "receiving.receptions"), YDS: g(s, "receiving.receivingYards"), TD: g(s, "receiving.receivingTouchdowns") };
    case "DL": case "LB": return { TKL: g(s, "defensive.totalTackles"), SCK: g(s, "defensive.sacks"), TFL: g(s, "defensive.tacklesForLoss") };
    case "DB": return { TKL: g(s, "defensive.totalTackles"), INT: g(s, "defensiveinterceptions.interceptions"), PD: g(s, "defensive.passesDefended") };
    case "K": return { FG: g(s, "kicking.fieldGoalsMade"), "FG%": g(s, "kicking.fieldGoalPct"), LNG: g(s, "kicking.longFieldGoalMade") };
    case "P": return { PUNTS: g(s, "punting.punts"), NET: g(s, "punting.netAvgPuntYards"), IN20: g(s, "punting.puntsInside20") };
    default: return { GP: gp };
  }
}

// ── Teams, picks ──
const teamsJ = read("teams.json").sports[0].leagues[0].teams.map((t) => t.team);
const teams = [];
const rows = [];
const review = [];
const pinsFound = new Set();
for (const t of teamsJ) {
  const detail = read(`team/${t.id}.json`).team;
  const [w = 0, l = 0, tie = 0] = (detail.record?.items?.[0]?.summary ?? "0-0").split("-").map(Number);
  const winPct = w + l + tie ? (w + tie / 2) / (w + l + tie) : 0.5;
  teams.push({ abbr: t.abbreviation, name: t.name, full: t.displayName, color: `#${t.color || "333333"}`, alt: `#${t.alternateColor || "999999"}`, winPct });

  const roster = new Map();
  for (const grp of read(`roster/${t.id}.json`).athletes) for (const a of grp.items) roster.set(a.id, a);
  const charts = read(`depth/${t.id}.json`).depthchart ?? [];
  const off = charts.find((c) => c.positions.qb);
  const def = charts.find((c) => /Base \d-\d D/.test(c.name));
  const st = charts.find((c) => c.positions.pk);
  const front = def?.name.match(/(\d-\d)/)?.[1] ?? "4-3";

  const picked = new Map(); // espn id → {pos, group, depth}
  const take = (chart, slot, i = 0, label) => {
    const a = chart?.positions?.[slot]?.athletes?.[i];
    if (!a || picked.has(a.id)) return;
    const [pos, group] = label ?? SLOT[slot];
    picked.set(a.id, { pos, group, depth: i });
  };
  for (const s of OFFENSE) take(off, s);
  for (const s of Object.keys(def?.positions ?? {})) take(def, s, 0, s === "wlb" || s === "slb" ? olb(front) : undefined);
  take(st, "pk");
  take(st, "p");
  for (const [s, i] of BACKUPS) take(off, s, i);
  // WR4: the first receiver on any WR line who is not already in
  if (off) for (const s of ["wr1", "wr2", "wr3"]) for (const a of off.positions[s]?.athletes?.slice(1) ?? []) if (!picked.has(a.id) && [...picked.values()].filter((x) => x.group === "WR").length < 4) picked.set(a.id, { pos: "WR", group: "WR", depth: 1 });
  // pinned stars on the roster but off the depth chart (injured reserve)
  for (const a of roster.values()) {
    if (pinOf(a) && !picked.has(a.id)) {
      const [pos, group] = ROSTER_POS[a.position?.abbreviation] ?? ["ATH", "OL"];
      picked.set(a.id, { pos, group, depth: 0 });
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
    rows.push({
      id,
      name: a.displayName,
      team: t.abbreviation,
      // a nickel back or safety prints his roster position (CB or S), whatever slot he fills
      pos: x.group === "DB" ? (a.position?.abbreviation === "S" ? "S" : "CB") : x.pos,
      group: x.group,
      pin: pinOf(a),
      depth: x.depth,
      jersey: a.jersey ?? "",
      college: a.college?.name ?? a.college?.shortName ?? "",
      exp: a.experience?.years ?? 0,
      photo: a.headshot?.href ? "" : null, // ESPN's path is rebuilt from the id; null = no headshot
      winPct,
      s,
    });
  }
}

// ── Ratings ──
// z-scores within each group, over that group's starters
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const sd = (xs) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2))) || 1;
const teamZ = (() => {
  const xs = teams.map((t) => t.winPct);
  const m = mean(xs), d = sd(xs);
  return new Map(teams.map((t) => [t.abbr, (t.winPct - m) / d]));
})();
for (const [group, metrics] of Object.entries(METRICS)) {
  const members = rows.filter((r) => r.group === group);
  const gpOf = (r) => Math.max(1, g(r.s, "general.gamesPlayed"));
  const played = (r) => g(r.s, "general.gamesPlayed") >= 3;
  const base = members.filter((r) => r.depth === 0 && played(r));
  const z = metrics.map(([f]) => {
    const xs = base.map((r) => f(r.s, gpOf(r)));
    const m = mean(xs), d = sd(xs);
    return (r) => (f(r.s, gpOf(r)) - m) / d;
  });
  const wsum = metrics.reduce((a, [, w]) => a + w, 0) || 1;
  for (const r of members) {
    const statZ = metrics.length ? (played(r) ? metrics.reduce((a, [, w], i) => a + w * z[i](r), 0) / wsum : -0.6) : 0;
    const teamPart = (metrics.length ? 0.35 : 0.8) * teamZ.get(r.team);
    const depthPart = r.depth > 0 ? -1 : 0;
    r.score = r.pin ?? Math.min(UNPINNED_MAX, Math.round(74 + 4 * (statZ + teamPart + depthPart)));
  }
}

// rarity by overall rank, the same proportions as the NBA base set
rows.sort((a, b) => b.score - a.score);
const n = rows.length;
const cut = (f) => Math.round(n * f);
const [cL, cE, cR, cU] = [cut(0.018), cut(0.074), cut(0.201), cut(0.446)];
rows.forEach((r, i) => {
  const rank = i + 1;
  r.rarity = rank <= cL ? "legendary" : rank <= cE ? "epic" : rank <= cR ? "rare" : rank <= cU ? "uncommon" : "common";
  r.ovr = Math.max(58, Math.min(99, Math.round(r.score)));
});
for (const name of Object.keys(PINS)) if (!pinsFound.has(name)) review.push(`pin not on any roster: ${name}`);

// card numbers: team by team (alphabetical), offense, defense, specialists
const ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"];
teams.sort((a, b) => a.full.localeCompare(b.full));
const teamIdx = new Map(teams.map((t, i) => [t.abbr, i]));
rows.sort((a, b) => teamIdx.get(a.team) - teamIdx.get(b.team) || ORDER.indexOf(a.group) - ORDER.indexOf(b.group) || a.depth - b.depth || b.ovr - a.ovr);

const out = rows.map((r, i) => {
  const row = {
    id: r.id,
    name: r.name,
    team: r.team,
    pos: r.pos,
    jersey: r.jersey,
    college: r.college,
    rookie: r.exp === 0,
    rarity: r.rarity,
    ovr: r.ovr,
    stats: statLine(r.group, r.s),
    no: i + 1,
  };
  if (r.photo === null) row.photo = null;
  return row;
});

const ts = `// GENERATED by scripts/nfl (fetch.sh + build.js) from ESPN's 2026 NFL rosters, depth charts and
// season stats. Snapshot: ${new Date().toISOString().slice(0, 10)}. ${teams.length} teams, ${out.length} cards: each team's offensive
// and defensive starters, kicker, punter, the next man up at QB, RB, TE and WR, and pinned stars.
// OVR and rarity are Gate 7's own estimates (per-game stats against the same position, team
// record), not official ratings. Stats are 2026 season totals so far. Hand edits are fine.
import type { NflPlayerRow, NflTeam } from "./types";

export const NFL_SEASON = "2026";

export const NFL_TEAMS: NflTeam[] = ${JSON.stringify(teams.map(({ winPct, ...t }) => t), null, 2)};

export const NFL_PLAYERS: NflPlayerRow[] = [
${out.map((r) => "  " + JSON.stringify(r)).join(",\n")}
];
`;
fs.writeFileSync(OUT, ts);

const by = (k) => out.reduce((m, r) => ((m[r[k]] = (m[r[k]] || 0) + 1), m), {});
const perTeam = Object.values(by("team"));
console.log(`teams ${teams.length}, cards ${out.length} (${Math.min(...perTeam)}-${Math.max(...perTeam)} per team)`, by("rarity"));
console.log(by("pos"));
console.log("TOP 40:", [...out].sort((a, b) => b.ovr - a.ovr).slice(0, 40).map((r) => `${r.name} ${r.pos} ${r.ovr}`).join(" | "));
console.log("TOP UNPINNED:", [...out].filter((r) => !rows.find((x) => x.id === r.id)?.pin).sort((a, b) => b.ovr - a.ovr).slice(0, 25).map((r) => `${r.name} ${r.team} ${r.pos} ${r.ovr}`).join(" | "));
console.log("REVIEW:\n" + review.join("\n"));
