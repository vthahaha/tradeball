// Downloads the League of Legends 2026 World Championship from Leaguepedia (lol.fandom.com, CC BY-SA)
// into data/: the Play-In and Main Event rosters, player bios, every game's per-player stats, each
// player's newest photo and each team's square logo (as direct image URLs).
// Then: node build.js  →  regenerates src/lib/catalog/lol.ts
//
//   node fetch.mjs                (on a machine behind a proxy: NODE_USE_ENV_PROXY=1 node fetch.mjs)
import { mkdirSync, writeFileSync } from "node:fs";

const EVENTS = ["2026 Season World Championship/Main Event", "2026 Season World Championship/Play-In"];
const ROLES = ["Top", "Jungle", "Mid", "Bot", "Support"];
const API = "https://lol.fandom.com/api.php";
const UA = "Mozilla/5.0 (compatible; card-set-research/1.0)";
const D = new URL("./data/", import.meta.url);
mkdirSync(D, { recursive: true });
const save = (f, v) => writeFileSync(new URL(f, D), JSON.stringify(v, null, 1));
const quote = (s) => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
const IN = (xs) => `(${xs.map(quote).join(",")})`;

async function api(params) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`${API}?${new URLSearchParams({ format: "json", ...params })}`, { headers: { "user-agent": UA } });
    if (r.ok) {
      const j = await r.json();
      if (!j.error) return j;
      console.warn("api error", j.error.info);
    }
    await new Promise((s) => setTimeout(s, 1500 * (i + 1))); // Leaguepedia rate-limits bursts
  }
  throw new Error(`Leaguepedia query failed: ${JSON.stringify(params).slice(0, 200)}`);
}
/** A Cargo query, paged 500 rows at a time. */
async function cargo(tables, fields, where) {
  const out = [];
  for (let offset = 0; ; offset += 500) {
    const j = await api({ action: "cargoquery", tables, fields, where, limit: "500", offset: String(offset) });
    const rows = (j.cargoquery ?? []).map((x) => x.title);
    out.push(...rows);
    if (rows.length < 500) return out;
  }
}
/** Direct CDN URLs for File: pages, 50 per request. Missing files map to null. */
async function fileUrls(names) {
  const out = {};
  for (let i = 0; i < names.length; i += 50) {
    const batch = names.slice(i, i + 50);
    const j = await api({ action: "query", prop: "imageinfo", iiprop: "url", titles: batch.map((n) => `File:${n}`).join("|") });
    const norm = Object.fromEntries((j.query.normalized ?? []).map((n) => [n.to, n.from]));
    for (const p of Object.values(j.query.pages)) {
      const asked = (norm[p.title] ?? p.title).replace(/^File:/, "");
      out[asked] = p.imageinfo?.[0]?.url ?? null;
    }
  }
  return out;
}

const where = `OverviewPage IN ${IN(EVENTS)}`;
const roster = (await cargo("TournamentPlayers", "OverviewPage,Team,Player,Role", where)).filter((r) => ROLES.includes(r.Role));
const links = [...new Set(roster.map((r) => r.Player))];
const teamNames = [...new Set(roster.map((r) => r.Team))];
console.log(`roster: ${links.length} players on ${teamNames.length} teams`);

const scoreboard = await cargo("ScoreboardPlayers", "OverviewPage,Link,Team,Role,Kills,Deaths,Assists,CS,PlayerWin,GameId", where);
console.log(`scoreboard: ${scoreboard.length} player-games`);

const bios = [];
for (let i = 0; i < links.length; i += 40) bios.push(...(await cargo("Players", "ID,OverviewPage,Name,NativeName,Country,Role", `OverviewPage IN ${IN(links.slice(i, i + 40))}`)));

// photos: a player's history, newest by the year and split in the name (Leaguepedia leaves most dates empty)
const photos = [];
for (let i = 0; i < links.length; i += 6) photos.push(...(await cargo("PlayerImages", "FileName,Link,Team,Tournament", `Link IN ${IN(links.slice(i, i + 6))}`)));
const SPLIT = [/winter|split 1|spring|cup/i, /split 2|msi|summer|first stand/i, /split 3|worlds|world championship|esports world cup|ewc/i];
const recency = (r) => {
  const s = `${r.FileName} ${r.Tournament}`;
  const year = Math.max(0, ...(s.match(/20\d\d/g) ?? []).map(Number));
  return year * 10 + (SPLIT.findIndex((re) => re.test(s)) + 1);
};
const teamOf = Object.fromEntries(roster.map((r) => [r.Player, r.Team]));
const bestPhoto = {};
for (const link of links) {
  const mine = photos.filter((p) => p.Link.toLowerCase() === link.toLowerCase());
  mine.sort((a, b) => recency(b) - recency(a) || (b.Team === teamOf[link]) - (a.Team === teamOf[link]));
  if (mine[0]) bestPhoto[link] = mine[0].FileName;
}

// logos: the square one where there is one, else whatever the team page uses
const teams = await cargo("Teams", "Name,Short,Region,Image,OverviewPage", `Name IN ${IN(teamNames)}`);
const logoNames = teamNames.flatMap((t) => [`${t}logo square.png`, teams.find((x) => x.Name === t)?.Image].filter(Boolean));
const urls = await fileUrls([...new Set([...Object.values(bestPhoto), ...logoNames])]);
const logo = Object.fromEntries(teamNames.map((t) => [t, urls[`${t}logo square.png`] ?? urls[teams.find((x) => x.Name === t)?.Image] ?? null]));
const photo = Object.fromEntries(Object.entries(bestPhoto).map(([l, f]) => [l, { file: f, url: urls[f] ?? null }]));

save("roster.json", roster);
save("scoreboard.json", scoreboard);
save("bios.json", bios);
save("teams.json", teams);
save("photos.json", photo);
save("logos.json", logo);
console.log(`photos: ${Object.values(photo).filter((p) => p.url).length}/${links.length}; logos: ${Object.values(logo).filter(Boolean).length}/${teamNames.length}`);
console.log("no logo:", teamNames.filter((t) => !logo[t]).join(", ") || "-");
