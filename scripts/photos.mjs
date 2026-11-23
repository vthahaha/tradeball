// Self-hosts the card images that are heavy to hotlink, as small WebP files under public/:
//
//   public/players/nba/<espn id>.webp   NBA headshots     (ESPN serves 600 px PNGs of ~200 KB)
//   public/players/nfl|mlb|nhl/<id>.webp  NFL, MLB and NHL headshots (the same)
//   public/logos/<league>/<abbr>.webp   team logos        (ESPN serves 500 px PNGs of ~80 KB)
//   public/players/lol/<slug>.webp, public/logos/lol/<abbr>.webp   League of Legends (Leaguepedia)
//   public/inserts/thumb/<file>.webp    insert art at binder size, e.g. thumb/HG1.jpg.webp (the originals
//                                       are sized for the viewer; some art exists as both .jpg and .png)
//
// and writes src/lib/catalog/local-art.ts, the list of what exists locally. The catalog uses a
// local file only when it is on that list, so a player added since the last run falls back to
// ESPN instead of a broken image. Soccer photos stay on UEFA (12 KB JPEGs, cached for a week).
//
//   npm run photos        downloads only what is missing; re-encodes thumbs whose art changed
//   npm run photos -- --force   re-downloads everything (after a re-shoot, e.g. a new season)
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const ROOT = new URL("../", import.meta.url);
const at = (p) => new URL(p, ROOT);
const FORCE = process.argv.includes("--force");
const PHOTO_W = 480; // a card is at most ~420 CSS px wide in the viewer; binder pockets ~180
const LOGO_W = 160;
const THUMB_W = 480;
const UA = "Mozilla/5.0 (compatible; card-set-research/1.0)";

const src = (f) => readFileSync(at(`src/lib/catalog/${f}`), "utf8");
const ids = (text) => [...text.matchAll(/^\s*\{"id":"(\d+)"(?![^\n]*"photo":null)/gm)].map((m) => m[1]);
const abbrs = (text) => [...text.matchAll(/"abbr": "([A-Z]+)"/g)].map((m) => m[1].toLowerCase());

// NBA rows are pretty-printed one per line too; their ids are ESPN athlete ids
const nbaIds = [...new Set([...src("nba.ts").matchAll(/"id":"(\d+)"/g)].map((m) => m[1]))];
const nflIds = ids(src("nfl.ts"));
const mlbIds = ids(src("mlb.ts"));
const nhlIds = ids(src("nhl.ts"));
const mlbTeams = abbrs(src("mlb.ts").split("MLB_PLAYERS")[0]);
// League of Legends: rows carry Leaguepedia's image URLs (photo per player, logo per team)
const lolRows = [...src("lol.ts").matchAll(/^\s*(\{"id":"[^\n]*\}),?$/gm)].map((m) => JSON.parse(m[1]));
const lolTeams = JSON.parse(src("lol.ts").match(/LOL_TEAMS: LolTeam\[\] = (\[[\s\S]*?\n\]);/)[1]);
const nhlTeams = abbrs(src("nhl.ts").split("NHL_PLAYERS")[0]);
const nbaTeams = abbrs(src("nba.ts").split("NBA_PLAYERS")[0]);
// historic and college teams on insert cards borrow a current franchise's logo (index.ts LOGO_FRANCHISE)
const nflTeams = abbrs(src("nfl.ts").split("NFL_PLAYERS")[0]);

async function fetchImage(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { "user-agent": UA } });
      if (r.status === 404) return null;
      if (r.ok) return Buffer.from(await r.arrayBuffer());
    } catch {}
    await new Promise((s) => setTimeout(s, 500 * (i + 1)));
  }
  return null;
}

/** Runs `fn` over `items`, `n` at a time. */
async function pool(items, n, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) await fn(items[next++]);
  }));
}

const have = { players: [], logos: [], thumbs: [] };
let fetched = 0, missing = 0, kb = 0;

async function remote(kind, key, url, out, width) {
  if (!FORCE && existsSync(out)) {
    have[kind].push(key);
    return;
  }
  const buf = await fetchImage(url);
  if (!buf) {
    missing++;
    return;
  }
  const webp = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 78, alphaQuality: 80, effort: 5 }).toBuffer();
  writeFileSync(out, webp);
  fetched++;
  kb += webp.length / 1024;
  have[kind].push(key);
}

for (const d of ["players/nba", "players/nfl", "players/mlb", "players/nhl", "players/lol", "logos/nba", "logos/nfl", "logos/mlb", "logos/nhl", "logos/lol", "inserts/thumb"]) mkdirSync(at(`public/${d}`), { recursive: true });

const jobs = [
  ...nbaIds.map((id) => ["players", `nba/${id}`, `https://a.espncdn.com/i/headshots/nba/players/full/${id}.png`, PHOTO_W]),
  ...nflIds.map((id) => ["players", `nfl/${id}`, `https://a.espncdn.com/i/headshots/nfl/players/full/${id}.png`, PHOTO_W]),
  ...mlbIds.map((id) => ["players", `mlb/${id}`, `https://a.espncdn.com/i/headshots/mlb/players/full/${id}.png`, PHOTO_W]),
  ...nhlIds.map((id) => ["players", `nhl/${id}`, `https://a.espncdn.com/i/headshots/nhl/players/full/${id}.png`, PHOTO_W]),
  ...nbaTeams.map((a) => ["logos", `nba/${a}`, `https://a.espncdn.com/i/teamlogos/nba/500/${a}.png`, LOGO_W]),
  ...nflTeams.map((a) => ["logos", `nfl/${a}`, `https://a.espncdn.com/i/teamlogos/nfl/500/${a}.png`, LOGO_W]),
  ...mlbTeams.map((a) => ["logos", `mlb/${a}`, `https://a.espncdn.com/i/teamlogos/mlb/500/${a}.png`, LOGO_W]),
  ...nhlTeams.map((a) => ["logos", `nhl/${a}`, `https://a.espncdn.com/i/teamlogos/nhl/500/${a}.png`, LOGO_W]),
  ...lolRows.filter((r) => r.photo).map((r) => ["players", `lol/${r.id}`, r.photo, PHOTO_W]),
  ...lolTeams.filter((t) => t.logo).map((t) => ["logos", `lol/${t.abbr.toLowerCase()}`, t.logo, LOGO_W]),
];
await pool(jobs, 12, ([kind, key, url, w]) => remote(kind, key, url, at(`public/${kind}/${key}.webp`), w));

// insert thumbs: re-encoded when the art is newer than its thumb
for (const f of readdirSync(at("public/inserts"))) {
  if (!/\.(jpe?g|png|webp|avif)$/i.test(f)) continue;
  const art = at(`public/inserts/${f}`);
  const out = at(`public/inserts/thumb/${f}.webp`);
  if (FORCE || !existsSync(out) || statSync(out).mtimeMs < statSync(art).mtimeMs) {
    const webp = await sharp(readFileSync(art)).rotate().resize({ width: THUMB_W, withoutEnlargement: true }).webp({ quality: 74, effort: 5 }).toBuffer();
    writeFileSync(out, webp);
    fetched++;
    kb += webp.length / 1024;
  }
  have.thumbs.push(f);
}

const list = (xs) => JSON.stringify([...xs].sort());
writeFileSync(
  at("src/lib/catalog/local-art.ts"),
  `// GENERATED by scripts/photos.mjs (npm run photos). What is served from public/ instead of hotlinked:
// NBA and NFL headshots and logos as small WebP files, and binder-size thumbnails of the insert art.
// Anything not listed falls back to the remote image, so a stale list is safe, just slower.

/** "<league>/<espn id>" (nba, nfl, mlb, nhl) → public/players/<key>.webp */
export const LOCAL_PLAYERS = new Set<string>(${list(have.players)});

/** "<league>/<abbr>" (lowercase) → public/logos/<key>.webp */
export const LOCAL_LOGOS = new Set<string>(${list(have.logos)});

/** Insert art file names ("HG1.jpg") with a thumbnail at public/inserts/thumb/<file>.webp */
export const INSERT_THUMBS = new Set<string>(${list(have.thumbs)});
`,
);
console.log(`players ${have.players.length}, logos ${have.logos.length}, insert thumbs ${have.thumbs.length}; wrote ${fetched} files (${Math.round(kb / 1024)} MB), ${missing} not on ESPN`);
