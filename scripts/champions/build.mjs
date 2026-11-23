// Builds src/lib/catalog/champions.ts: "The Champions" insert set (Legendary). One card for every
// player who actually played and contributed to the last title in each league:
//
//   NBA  Knicks        2026 playoffs   at least 60 playoff minutes
//   NFL  Seahawks      Super Bowl LX   (2025 season) skill players with 6+ touches, offensive linemen
//                                      who started every game, defenders with 5+ tackles/plays, K and P
//   MLB  Brewers       2026 World Series   hitters with 15+ at-bats, pitchers with 4+ innings
//   NHL  Hurricanes    2026 Stanley Cup    skaters in 10+ games, goalies in 3+
//   UCL  Paris SG      2025-26 Champions League   5+ appearances
//   LoL  BLG           Worlds 2026     every player on the roster except Flandre
//
// Data: ESPN postseason stats (NBA/NFL/MLB/NHL, nationalities from athlete profiles), ESPN and
// UEFA for PSG (UEFA's 2025-26 squad photos), and the League set (lol.ts) for BLG.
//
//   node build.mjs        (behind a proxy: NODE_USE_ENV_PROXY=1 node build.mjs)
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const D = new URL("./data/", import.meta.url);
mkdirSync(D, { recursive: true });
const OUT = new URL("../../src/lib/catalog/champions.ts", import.meta.url);
const UA = "Mozilla/5.0 (compatible; card-set-research/1.0)";

async function get(url, cacheName) {
  const file = new URL(cacheName, D);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { "user-agent": UA } }).catch(() => null);
    if (r?.ok) {
      const j = await r.json();
      writeFileSync(file, JSON.stringify(j));
      return j;
    }
    await new Promise((s) => setTimeout(s, 800 * (i + 1)));
  }
  throw new Error(`fetch failed: ${url}`);
}

/** ESPN postseason stats for one team: [{ id, name, pos, v: { "<category>.<stat>": number } }]. */
async function postseason(path, season, team, category) {
  const cat = category ? `&category=${category}` : "";
  const j = await get(
    `https://site.web.api.espn.com/apis/common/v3/sports/${path}/statistics/byathlete?region=us&lang=en&contentorigin=espn&isqualified=false&limit=1000&season=${season}&seasontype=3${cat}`,
    `${path.replace("/", "_")}_${season}${category ? "_" + category : ""}.json`,
  );
  const names = Object.fromEntries(j.categories.map((c) => [c.name, c.names]));
  return j.athletes
    .filter((a) => (a.athlete.teamShortName ?? a.athlete.teams?.[0]?.abbreviation) === team)
    .map((a) => {
      const v = {};
      for (const c of a.categories)
        (names[c.name] ?? []).forEach((n, i) => {
          const raw = String((c.totals ?? c.values)?.[i] ?? "");
          const mmss = raw.match(/^(\d+):(\d+)$/);
          v[`${c.name}.${n}`] = mmss ? +mmss[1] + +mmss[2] / 60 : Number(raw.replace(/,/g, "")) || 0;
        });
      return { id: a.athlete.id, name: a.athlete.displayName, pos: a.athlete.position?.abbreviation ?? "", v };
    });
}
/** A nationality from the ESPN athlete profile. */
async function nationOf(path, id) {
  try {
    const j = await get(`https://site.web.api.espn.com/apis/common/v3/sports/${path}/athletes/${id}`, `athlete_${path.replace("/", "_")}_${id}.json`);
    const a = j.athlete ?? j;
    if (a.citizenship) return a.citizenship;
    // "Herning, DEN" → Denmark; "Atlanta, GA" (a US state) → USA
    const last = (a.displayBirthPlace ?? "").split(",").pop().trim();
    if (PROVINCES.has(last)) return "Canada";
    if (["NSW", "VIC", "QLD", "TAS"].includes(last)) return "Australia";
    if (/^[A-Z]{2}$/.test(last)) return "USA";
    return CODES[last] ?? last;
  } catch {
    return "";
  }
}
const PROVINCES = new Set(["ON", "QC", "BC", "AB", "MB", "SK", "NS", "NB", "NL", "PE", "YT", "NT", "NU"]);
/** Country codes in ESPN birthplaces. */
const CODES = {
  USA: "USA", CAN: "Canada", DEN: "Denmark", SWE: "Sweden", FIN: "Finland", CZE: "Czechia", RUS: "Russia",
  SVK: "Slovakia", GER: "Germany", SUI: "Switzerland", AUT: "Austria", NOR: "Norway", LAT: "Latvia",
  BLR: "Belarus", FRA: "France", DOM: "Dominican Rep.", VEN: "Venezuela", MEX: "Mexico", PUR: "Puerto Rico",
  CUB: "Cuba", JPN: "Japan", KOR: "Korea", COL: "Colombia", PAN: "Panama", CUW: "Curaçao", AUS: "Australia",
  NGA: "Nigeria", GBR: "UK", ENG: "England", BAH: "Bahamas", NED: "Netherlands", ITA: "Italy", ESP: "Spain",
  CMR: "Cameroon", SSD: "South Sudan", GHA: "Ghana", BRA: "Brazil", ARU: "Aruba", KAZ: "Kazakhstan",
};
const r1 = (x) => Math.round(x * 10) / 10;
const r3 = (x) => Math.round(x * 1000) / 1000;
const COUNTRY = { "United States": "USA", "South Korea": "Korea" };

const cards = [];
const add = (c) => cards.push({ ...c, nation: COUNTRY[c.nation] ?? c.nation });

// ── NBA: Knicks, 2026 playoffs ──
for (const p of await postseason("basketball/nba", 2026, "NY")) {
  const gp = p.v["general.gamesPlayed"], min = p.v["general.avgMinutes"];
  if (gp * min < 60) continue;
  add({ league: "NBA", sport: "basketball", espn: p.id, name: p.name, pos: p.pos, weight: gp * min, nation: await nationOf("basketball/nba", p.id),
    stats: { PTS: r1(p.v["offensive.avgPoints"]), REB: r1(p.v["general.avgRebounds"]), AST: r1(p.v["offensive.avgAssists"]) } });
}

// ── NFL: Seahawks, Super Bowl LX (the 2025 season's playoffs) ──
for (const p of await postseason("football/nfl", 2025, "SEA")) {
  const v = (k) => p.v[k] ?? 0;
  const gp = v("general.gamesPlayed");
  const touches = v("passing.passingAttempts") + v("rushing.rushingAttempts") + v("receiving.receptions");
  const def = v("defensive.totalTackles") + 2 * v("defensive.sacks") + 2 * v("defensiveinterceptions.interceptions") + v("defensive.passesDefended");
  const ol = ["OT", "G", "C"].includes(p.pos);
  const spec = ["PK", "P"].includes(p.pos);
  if (!(touches >= 6 || (ol && gp >= 3) || def >= 5 || spec)) continue;
  let stats;
  if (p.pos === "QB") stats = { YDS: v("passing.passingYards"), TD: v("passing.passingTouchdowns"), INT: v("passing.interceptions") };
  else if (p.pos === "RB") stats = { YDS: v("rushing.rushingYards"), TD: v("rushing.rushingTouchdowns") + v("receiving.receivingTouchdowns"), REC: v("receiving.receptions") };
  else if (["WR", "TE"].includes(p.pos)) stats = { REC: v("receiving.receptions"), YDS: v("receiving.receivingYards"), TD: v("receiving.receivingTouchdowns") };
  else if (p.pos === "PK") stats = { FG: v("kicking.fieldGoalsMade"), XP: v("kicking.extraPointsMade"), LNG: v("kicking.longFieldGoalMade") };
  else if (p.pos === "P") stats = { PUNTS: v("punting.punts"), NET: v("punting.netAvgPuntYards"), IN20: v("punting.puntsInside20") };
  else if (ol) stats = { GP: gp };
  else stats = { TKL: v("defensive.totalTackles"), SCK: v("defensive.sacks"), INT: v("defensiveinterceptions.interceptions") };
  add({ league: "NFL", sport: "football", espn: p.id, name: p.name, pos: p.pos === "PK" ? "K" : p.pos, weight: touches * 2 + def * 3 + (ol ? 30 : 0) + (spec ? 20 : 0),
    nation: await nationOf("football/nfl", p.id), stats });
}

// ── MLB: Brewers, 2026 postseason ──
const hitters = await postseason("baseball/mlb", 2026, "MIL", "batting");
const pitchers = await postseason("baseball/mlb", 2026, "MIL", "pitching");
for (const p of hitters) {
  if (p.v["batting.atBats"] < 15) continue;
  add({ league: "MLB", sport: "baseball", espn: p.id, name: p.name, pos: p.pos, weight: p.v["batting.atBats"], nation: await nationOf("baseball/mlb", p.id),
    stats: { AVG: r3(p.v["batting.avg"]), HR: p.v["batting.homeRuns"], RBI: p.v["batting.RBIs"] } });
}
for (const p of pitchers) {
  if (p.v["pitching.innings"] < 4) continue;
  add({ league: "MLB", sport: "baseball", espn: p.id, name: p.name, pos: p.pos, weight: p.v["pitching.innings"] * 3, nation: await nationOf("baseball/mlb", p.id),
    stats: { ERA: r1(p.v["pitching.ERA"] * 10) / 10, IP: p.v["pitching.innings"], SO: p.v["pitching.strikeouts"] } });
}

// ── NHL: Hurricanes, 2026 Stanley Cup playoffs ──
for (const p of await postseason("hockey/nhl", 2026, "CAR")) {
  const gp = p.v["general.games"];
  const goalie = p.pos === "G";
  if (goalie ? gp < 3 : gp < 10) continue;
  add({ league: "NHL", sport: "hockey", espn: p.id, name: p.name, pos: p.pos, weight: gp * p.v["general.timeOnIcePerGame"], nation: await nationOf("hockey/nhl", p.id),
    stats: goalie ? { W: p.v["general.wins"], GAA: r1(p.v["defensive.avgGoalsAgainst"] * 100) / 100, "SV%": r3(p.v["defensive.savePct"]) } : { G: p.v["offensive.goals"], A: p.v["offensive.assists"], PTS: p.v["offensive.points"] } });
}

// ── Champions League: Paris SG, 2025-26 ──
const psg = await get("https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams/160/roster?season=2025", "psg_ucl_2025.json");
// UEFA's 2025-26 registrations: ids for the season's squad photos
const uefa = [];
for (let off = 0; ; off += 500) {
  const page = await get(`https://comp.uefa.com/v2/players?competitionId=1&seasonYear=2026&limit=500&offset=${off}`, `uefa_players_2026_${off}.json`);
  uefa.push(...page);
  if (page.length < 500) break;
}
const POS = { G: "GK", D: "DF", M: "MF", F: "FW" };
for (const a of psg.athletes) {
  const v = {};
  for (const c of a.statistics?.splits?.categories ?? []) for (const s of c.stats) v[s.name] = Number(s.value) || 0;
  if ((v.appearances ?? 0) < 5) continue;
  const dob = (a.dateOfBirth ?? "").slice(0, 10);
  const u = uefa.find((p) => p.birthDate === dob && p.clubId === "52747") ?? uefa.find((p) => p.birthDate === dob);
  add({ league: "UCL", sport: "soccer", uefa: u?.id ?? null, name: u?.internationalName ?? a.displayName, pos: POS[a.position?.abbreviation] ?? "MF", weight: v.appearances,
    nation: u?.translations?.countryName?.EN ?? a.citizenship ?? "", photo: u?.imageUrl ?? null,
    stats: { APP: v.appearances, G: v.totalGoals ?? 0, A: v.goalAssists ?? 0 } });
}

// ── League of Legends: Bilibili Gaming, Worlds 2026 (every player but Flandre) ──
const lol = readFileSync(new URL("../../src/lib/catalog/lol.ts", import.meta.url), "utf8");
const lolRows = [...lol.matchAll(/^\s*(\{"id":"[^\n]*\}),?$/gm)].map((m) => JSON.parse(m[1]));
for (const r of lolRows.filter((r) => r.team === "BLG" && r.name.toLowerCase() !== "flandre")) {
  add({ league: "LoL", sport: "esports", lol: r.id, name: r.name, pos: r.pos, weight: r.stats?.GP ?? 0, nation: r.nation, stats: r.stats });
}

// ── Number the set: league by league, the biggest contributors first ──
const ORDER = ["NBA", "NFL", "MLB", "NHL", "UCL", "LoL"];
cards.sort((a, b) => ORDER.indexOf(a.league) - ORDER.indexOf(b.league) || b.weight - a.weight);
// a rank within the team (0 = led the run), for players with no base card to rate from
const teamSize = Object.fromEntries(ORDER.map((l) => [l, cards.filter((c) => c.league === l).length]));
const seen = {};
const out = cards.map((c, i) => {
  const rank = (seen[c.league] = (seen[c.league] ?? -1) + 1);
  const { weight, ...row } = c;
  return { id: `CH${i + 1}`, ...row, share: Math.round((1 - rank / Math.max(1, teamSize[c.league] - 1)) * 100) / 100 };
});

writeFileSync(
  OUT,
  `// GENERATED by scripts/champions/build.mjs. "The Champions" (Legendary insert): every player who
// played and contributed to the last title in each league. Snapshot: ${new Date().toISOString().slice(0, 10)}.
//   NBA Knicks (2026) · NFL Seahawks (Super Bowl LX) · MLB Brewers (2026) · NHL Hurricanes (2026)
//   Champions League Paris SG (2025-26) · League of Legends Bilibili Gaming (Worlds 2026)
// Stats are the title run. A player rates from his base card (+2) or from \`share\`, whichever is higher
// (1 = led the team's run, 0 = the last one in). Hand edits are fine.
import type { ChampionRow } from "./types";

export const CHAMPIONS: ChampionRow[] = [
${out.map((r) => "  " + JSON.stringify(r)).join(",\n")}
];
`,
);
const by = out.reduce((m, r) => ((m[r.league] = (m[r.league] || 0) + 1), m), {});
console.log("cards", out.length, by);
console.log("no nation:", out.filter((r) => !r.nation).map((r) => `${r.name} (${r.league})`).join(", ") || "-");
console.log("PSG without a UEFA photo:", out.filter((r) => r.league === "UCL" && !r.photo).map((r) => r.name).join(", ") || "-");
