// Builds src/lib/catalog/lol.ts: every player (no coaches) of the 19 teams at the League of
// Legends 2026 World Championship: the 16 Main Event teams and the three that went out in the
// Play-In. Data: Leaguepedia (lol.fandom.com, CC BY-SA).
//
// Run fetch.mjs first, then: node build.mjs   (it downloads each team's logo once, to read its colours)
//
// OVR and rarity are Gate 7's own estimates, not official ratings: how far the team went at Worlds,
// plus the player's KDA at the event against the same role (small samples pulled to the middle).
// Star ratings are pinned by hand in PINS so a rebuild keeps them. Team colours come from the logo;
// fix any in COLOR_FIX.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("../../node_modules/sharp");
const D = new URL("./data/", import.meta.url);
const OUT = new URL("../../src/lib/catalog/lol.ts", import.meta.url);
const read = (f) => JSON.parse(readFileSync(new URL(f, D), "utf8"));
const EVENT = "Worlds 2026";

/** Star ratings by Leaguepedia page name. */
const PINS = {
  Faker: 95, Chovy: 94, "Knight (Zhuo Ding)": 93, "Viper (Park Do-hyeon)": 92, Keria: 92, "Bin (Chen Ze-Bin)": 91,
  Canyon: 91, Ruler: 91, Zeus: 90, Oner: 90, ON: 89, Xun: 89, Peyz: 89, Kiin: 89, Caps: 89,
  ShowMaker: 88, Gumayusi: 88, Kanavi: 88, Rookie: 87, Caliste: 86, JackeyLove: 86, Duro: 86,
  "Doran (Choi Hyeon-jun)": 86, Delight: 86, TheShy: 86, Inspired: 85, CoreJJ: 85, BrokenBlade: 85,
  Elyoya: 85, "Hans Sama": 85, Canna: 85,
};
const UNPINNED_MAX = 86;

/** [primary, secondary] by team, where the logo's own colours read badly on a card. */
const COLOR_FIX = {
  T1: ["#e2012d", "#1a1a1a"],
  "Gen.G": ["#aa8a00", "#1a1a1a"],
  "G2 Esports": ["#1a1a1a", "#ec1f26"],
  Cloud9: ["#0a7cc1", "#ffffff"],
  FURIA: ["#1a1a1a", "#e7e7e7"],
  // black-and-white brands whose logos read as black on black
  "Invictus Gaming": ["#1a1a1a", "#e5e5e5"],
  "Dplus Kia": ["#111111", "#e5e5e5"],
  "Team Secret Whales": ["#111111", "#e5e5e5"],
};

const ROLE = { Top: "TOP", Jungle: "JNG", Mid: "MID", Bot: "BOT", Support: "SUP" };
const ROLE_ORDER = ["TOP", "JNG", "MID", "BOT", "SUP"];
const COUNTRY = { "South Korea": "Korea", "United States": "USA" };

const roster = read("roster.json");
const scoreboard = read("scoreboard.json");
const bios = new Map(read("bios.json").map((b) => [b.OverviewPage.toLowerCase(), b]));
const teamRows = new Map(read("teams.json").map((t) => [t.Name, t]));
const photos = read("photos.json");
const logos = read("logos.json");

// ── How far each team went: the furthest stage it played, and the final's result ──
const STAGES = ["Play-In", "Swiss", "Quarterfinals", "Semifinals", "Finals"];
const stageOf = (g) => {
  if (g.startsWith("2026 Season World Championship/Play-In")) return "Play-In";
  const s = g.split("_")[1] ?? "";
  return STAGES.includes(s) ? s : "Swiss";
};
const reach = new Map();
const champion = (() => {
  const finals = scoreboard.filter((r) => stageOf(r.GameId) === "Finals");
  const wins = {};
  for (const r of finals) if (r.PlayerWin === "Yes") (wins[r.Team] ??= new Set()).add(r.GameId);
  return Object.entries(wins).sort((a, b) => b[1].size - a[1].size)[0]?.[0];
})();
for (const r of scoreboard) {
  const s = STAGES.indexOf(stageOf(r.GameId));
  if (s > (reach.get(r.Team) ?? -1)) reach.set(r.Team, s);
}
// a Main Event team that lost every Swiss game still reached the Main Event
for (const r of roster) if (r.OverviewPage.endsWith("Main Event") && (reach.get(r.Team) ?? -1) < 1) reach.set(r.Team, 1);
const FINISH_BASE = { "Play-In": 72, Swiss: 75, Quarterfinals: 78, Semifinals: 80, Finals: 82 };
const finishLabel = (team) => (team === champion ? "Champion" : ["Play-In", "Swiss stage", "Quarterfinals", "Semifinals", "Runner-up"][reach.get(team) ?? 0]);
const teamBase = (team) => FINISH_BASE[STAGES[reach.get(team) ?? 0]] + (team === champion ? 3 : 0);

// ── Per-player stats at the event ──
const stat = new Map();
for (const r of scoreboard) {
  const k = r.Link.toLowerCase();
  const s = stat.get(k) ?? { gp: 0, w: 0, k: 0, d: 0, a: 0, cs: 0 };
  s.gp++;
  if (r.PlayerWin === "Yes") s.w++;
  s.k += +r.Kills || 0;
  s.d += +r.Deaths || 0;
  s.a += +r.Assists || 0;
  s.cs += +r.CS || 0;
  stat.set(k, s);
}
const kda = (s) => (s.k + s.a) / Math.max(1, s.d);

// ── Team colours from the logo: the two most common saturated colours ──
const hex = (r, g, b) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
async function logoColors(team, url) {
  if (COLOR_FIX[team]) return COLOR_FIX[team];
  const dir = new URL("logo-src/", D);
  mkdirSync(dir, { recursive: true });
  const file = new URL(`${encodeURIComponent(team)}.png`, dir);
  if (!existsSync(file)) {
    const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; card-set-research/1.0)" } });
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  }
  const { data, info } = await sharp(readFileSync(file)).resize(48, 48, { fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buckets = new Map();
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b, a] = data.slice(i, i + 4);
    if (a < 200) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max ? (max - min) / max : 0;
    const key = [r, g, b].map((v) => Math.round(v / 32) * 32).join(",");
    const x = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0, sat: 0, light: 0 };
    x.n++, (x.r += r), (x.g += g), (x.b += b), (x.sat += sat), (x.light += max);
    buckets.set(key, x);
  }
  const cols = [...buckets.values()].map((x) => ({ n: x.n, rgb: [x.r / x.n, x.g / x.n, x.b / x.n].map(Math.round), sat: x.sat / x.n, light: x.light / x.n }));
  // colourful first; a black-and-white logo falls back to its darkest and lightest
  const colourful = cols.filter((c) => c.sat > 0.35 && c.light > 40).sort((a, b) => b.n - a.n);
  const dark = cols.filter((c) => c.light < 90).sort((a, b) => b.n - a.n)[0];
  const light = cols.filter((c) => c.light > 200 && c.sat < 0.2).sort((a, b) => b.n - a.n)[0];
  const far = (a, b) => Math.hypot(...a.rgb.map((v, i) => v - b.rgb[i])) > 90;
  const first = colourful[0] ?? dark ?? light;
  const second = colourful.slice(1).find((c) => far(c, first)) ?? (first === dark ? light : dark) ?? light;
  return [hex(...first.rgb), hex(...(second ?? { rgb: [26, 26, 26] }).rgb)];
}

// ── Teams ──
const teamNames = [...new Set(roster.map((r) => r.Team))];
const display = (t) => t.replace(/\s*\(.*\)$/, ""); // "LYON (2024 American Team)" → "LYON"
const teams = [];
for (const t of teamNames) {
  const [color, alt] = await logoColors(t, logos[t]);
  teams.push({ abbr: teamRows.get(t)?.Short ?? display(t).toUpperCase().slice(0, 4), name: display(t), full: t, color, alt, logo: logos[t] ?? null, finish: finishLabel(t) });
}
const teamByFull = new Map(teams.map((t) => [t.full, t]));

// ── Players: one card each (a player in both events appears once) ──
const seen = new Set();
const rows = [];
for (const r of roster) {
  const key = r.Player.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  const bio = bios.get(key);
  const s = stat.get(key) ?? { gp: 0, w: 0, k: 0, d: 0, a: 0, cs: 0 };
  rows.push({
    link: r.Player,
    id: r.Player.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name: bio?.ID ?? r.Player.replace(/\s*\(.*\)$/, ""),
    realName: bio?.Name ?? "",
    team: teamByFull.get(r.Team).abbr,
    teamFull: r.Team,
    pos: ROLE[r.Role],
    nation: COUNTRY[bio?.Country] ?? bio?.Country ?? "",
    photo: photos[r.Player]?.url ?? null,
    s,
  });
}

// ratings: KDA against the same role, shrunk by games played; team finish as the base
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const sd = (xs) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2))) || 1;
for (const role of ROLE_ORDER) {
  const members = rows.filter((r) => r.pos === role);
  const played = members.filter((r) => r.s.gp >= 3);
  const m = mean(played.map((r) => kda(r.s))), d = sd(played.map((r) => kda(r.s)));
  for (const r of members) {
    const z = r.s.gp ? ((kda(r.s) - m) / d) * Math.min(1, r.s.gp / 8) : -0.8;
    r.score = PINS[r.link] ?? Math.max(60, Math.min(UNPINNED_MAX, Math.round(teamBase(r.teamFull) + 3.5 * z)));
  }
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

// card numbers: team by team in order of finish, then by role
const finishRank = (t) => -(reach.get(t.full) ?? 0) * 2 - (t.full === champion ? 1 : 0);
teams.sort((a, b) => finishRank(a) - finishRank(b) || a.name.localeCompare(b.name));
const teamIdx = new Map(teams.map((t, i) => [t.abbr, i]));
rows.sort((a, b) => teamIdx.get(a.team) - teamIdx.get(b.team) || ROLE_ORDER.indexOf(a.pos) - ROLE_ORDER.indexOf(b.pos) || b.s.gp - a.s.gp);
const r1 = (x) => Math.round(x * 10) / 10;
const out = rows.map((r, i) => ({
  id: r.id,
  name: r.name,
  realName: r.realName,
  team: r.team,
  pos: r.pos,
  nation: r.nation,
  rarity: r.rarity,
  ovr: r.ovr,
  stats: r.s.gp ? { GP: r.s.gp, KDA: r1(kda(r.s)), "W%": Math.round((100 * r.s.w) / r.s.gp) } : null,
  photo: r.photo,
  no: i + 1,
}));

writeFileSync(
  OUT,
  `// GENERATED by scripts/lol (fetch.mjs + build.mjs) from Leaguepedia (lol.fandom.com, CC BY-SA):
// the League of Legends 2026 World Championship, Play-In and Main Event. Snapshot: ${new Date().toISOString().slice(0, 10)}.
// ${teams.length} teams, ${out.length} players (no coaches). OVR and rarity are Gate 7's own estimates (how far the team
// went, KDA at the event against the same role), not official ratings. Stats are the player's games at
// ${EVENT}. Photos and logos are Leaguepedia's; npm run photos makes local copies. Hand edits are fine.
import type { LolPlayerRow, LolTeam } from "./types";

export const LOL_EVENT = "${EVENT}";

export const LOL_TEAMS: LolTeam[] = ${JSON.stringify(teams, null, 2)};

export const LOL_PLAYERS: LolPlayerRow[] = [
${out.map((r) => "  " + JSON.stringify(r)).join(",\n")}
];
`,
);

console.log(`teams ${teams.length}, players ${out.length}`, out.reduce((m, r) => ((m[r.rarity] = (m[r.rarity] || 0) + 1), m), {}));
console.log("champion:", champion, "| finishes:", teams.map((t) => `${t.abbr} ${t.finish}`).join(", "));
console.log("colours:", teams.map((t) => `${t.abbr} ${t.color}/${t.alt}`).join("  "));
console.log("TOP 20:", [...out].sort((a, b) => b.ovr - a.ovr).slice(0, 20).map((r) => `${r.name} ${r.team} ${r.pos} ${r.ovr}`).join(" | "));
console.log("TOP UNPINNED:", [...rows].filter((r) => !PINS[r.link]).sort((a, b) => b.ovr - a.ovr).slice(0, 12).map((r) => `${r.name} ${r.team} ${r.pos} ${r.ovr}`).join(" | "));
console.log("no photo:", out.filter((r) => !r.photo).map((r) => r.name).join(", ") || "-", "| no stats:", out.filter((r) => !r.stats).map((r) => `${r.name} ${r.team}`).join(", ") || "-");
console.log("pins not found:", Object.keys(PINS).filter((p) => !rows.some((r) => r.link === p)).join(", ") || "-");
