// Builds src/lib/catalog/ucl.ts: the 36 league-phase clubs of the 2026-27 Champions League
// and 18 players from each, plus any pinned star who missed the cut (the players a club actually uses: 2 keepers, at least 5 defenders,
// 5 midfielders and 3 forwards, the rest by playing time).
//
// Run fetch.sh first, then: node build.js
//
// Sources: UEFA's registered-player list (names, shirt numbers, nations, official headshots)
// joined to ESPN rosters by club + date of birth (appearances, starts, goals, assists).
// OVR and rarity are Gate 7's own estimates (club strength + role + output), not official
// ratings. Star ratings are pinned by hand in PINS below so a rebuild keeps them.
const fs = require("fs");
const path = require("path");
const D = path.join(__dirname, "data");
const OUT = path.join(__dirname, "..", "..", "src", "lib", "catalog", "ucl.ts");
const read = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
const tryRead = (f) => (fs.existsSync(path.join(D, f)) ? read(f) : null);

const PER_CLUB = 18;
const QUOTA = { GK: 2, DF: 5, MF: 5, FW: 3 };

/**
 * Star ratings, by UEFA international name. A pinned player is always in their club's 18 and
 * gets exactly this OVR; the formula rates everyone else and never above UNPINNED_MAX. This is
 * what keeps an injured star (no minutes yet this season) from rating like a reserve.
 */
const PINS = {
  "Kylian Mbappé": 94, "Erling Haaland": 93, "Lamine Yamal": 93, "Harry Kane": 92,
  "Ousmane Dembélé": 91, "Vinícius Júnior": 91, "Jude Bellingham": 90, "Pedri": 90,
  "Michael Olise": 89, "Bukayo Saka": 89, "Declan Rice": 89, "Raphinha": 89, "Vitinha": 89,
  "Jamal Musiala": 89, "Lautaro Martínez": 89, "Thibaut Courtois": 89,
  "Florian Wirtz": 88, "Virgil van Dijk": 88, "William Saliba": 88, "Rodri": 88, "Joshua Kimmich": 88,
  "Federico Valverde": 88, "Alisson Becker": 88, "Gianluigi Donnarumma": 88, "Achraf Hakimi": 88,
  "Alexander Isak": 88, "Khvicha Kvaratskhelia": 88,
  "Viktor Gyökeres": 87, "Alessandro Bastoni": 87, "Nicolò Barella": 87, "Nuno Mendes": 87,
  "Bruno Fernandes": 87, "Martin Ødegaard": 87, "Désiré Doué": 86, "Marquinhos": 86,
  "Kevin De Bruyne": 86, "Alexis Mac Allister": 86, "Joško Gvardiol": 86, "Phil Foden": 86,
  "Frenkie de Jong": 86, "Jan Oblak": 86, "David Raya": 86, "Gabriel": 86, "Rúben Dias": 86,
  "Victor Osimhen": 86, "Dominik Szoboszlai": 86, "Ryan Gravenberch": 86, "Jules Koundé": 86,
  "Pau Cubarsí": 85, "Rayan Cherki": 85, "Rafael Leão": 85, "Scott McTominay": 85, "Hugo Ekitiké": 85,
  "Aurélien Tchouaméni": 85, "Serhou Guirassy": 85, "Alphonso Davies": 85, "Hakan Çalhanoğlu": 85,
  "Federico Dimarco": 85, "Trent Alexander-Arnold": 85, "Dean Huijsen": 84, "Antonio Rüdiger": 84,
};
const UNPINNED_MAX = 86;

// ── Clubs: ESPN id → name on the card, UEFA id, colours ──
// Colours are hand-picked (ESPN's are often a kit colour, not the club's); [primary, secondary].
const CLUBS = {
  887: { name: "AEK Athens", uefa: "50129", colors: ["#f6c900", "#1a1a1a"] },
  104: { name: "Roma", uefa: "50137", colors: ["#8e1f2f", "#f0bc42"] },
  359: { name: "Arsenal", uefa: "52280", colors: ["#ef0107", "#063672"] },
  362: { name: "Aston Villa", uefa: "52683", colors: ["#670e36", "#95bfe5"] },
  1068: { name: "Atlético Madrid", uefa: "50124", colors: ["#cb3524", "#272e61"] },
  83: { name: "Barcelona", uefa: "50080", colors: ["#a50044", "#004d98"] },
  132: { name: "Bayern Munich", uefa: "50037", colors: ["#dc052d", "#0066b2"] },
  2980: { name: "Bodø/Glimt", uefa: "59333", colors: ["#f9d71c", "#1a1a1a"] },
  124: { name: "Dortmund", uefa: "52758", colors: ["#fde100", "#1a1a1a"] },
  570: { name: "Club Brugge", uefa: "50043", colors: ["#0067ce", "#1a1a1a"] },
  2572: { name: "Como", uefa: "79946", colors: ["#1e4fa1", "#ffffff"] },
  437: { name: "Porto", uefa: "50064", colors: ["#003893", "#ffffff"] },
  436: { name: "Fenerbahçe", uefa: "52692", colors: ["#002d72", "#ffed00"] },
  142: { name: "Feyenoord", uefa: "52749", colors: ["#e30613", "#ffffff"] },
  432: { name: "Galatasaray", uefa: "50067", colors: ["#a90432", "#fdb912"] },
  110: { name: "Inter", uefa: "50138", colors: ["#0057b8", "#1a1a1a"] },
  4411: { name: "LASK", uefa: "63405", colors: ["#1a1a1a", "#ffffff"] },
  175: { name: "Lens", uefa: "52277", colors: ["#e30613", "#ffd700"] },
  166: { name: "Lille", uefa: "75797", colors: ["#e01e13", "#20325f"] },
  364: { name: "Liverpool", uefa: "7889", colors: ["#c8102e", "#00b2a9"] },
  382: { name: "Man City", uefa: "52919", colors: ["#6cabdd", "#1c2c5b"] },
  360: { name: "Man United", uefa: "52682", colors: ["#da291c", "#fbe122"] },
  114: { name: "Napoli", uefa: "50136", colors: ["#12a0d7", "#003c82"] },
  148: { name: "PSV", uefa: "50062", colors: ["#ed1c24", "#ffffff"] },
  160: { name: "Paris SG", uefa: "52747", colors: ["#004170", "#da291c"] },
  11420: { name: "RB Leipzig", uefa: "2603790", colors: ["#dd0741", "#001f47"] },
  244: { name: "Real Betis", uefa: "52265", colors: ["#00954c", "#ffffff"] },
  86: { name: "Real Madrid", uefa: "50051", colors: ["#ffffff", "#00529f"] },
  21922: { name: "Sabah", uefa: "2609356", colors: ["#1a1a1a", "#ff1493"] },
  493: { name: "Shakhtar", uefa: "52707", colors: ["#f57f20", "#1a1a1a"] },
  494: { name: "Slavia Prague", uefa: "52498", colors: ["#e30613", "#ffffff"] },
  521: { name: "Slovan Bratislava", uefa: "52797", colors: ["#81c0ff", "#1a1a1a"] },
  2250: { name: "Sporting CP", uefa: "50149", colors: ["#008057", "#ffffff"] },
  134: { name: "Stuttgart", uefa: "50107", colors: ["#e32219", "#ffffff"] },
  510: { name: "Viking", uefa: "52319", colors: ["#002f6c", "#ffffff"] },
  102: { name: "Villarreal", uefa: "70691", colors: ["#ffe667", "#005187"] },
};

const POS = { GOALKEEPER: "GK", DEFENDER: "DF", MIDFIELDER: "MF", FORWARD: "FW" };
const COUNTRY = { "Côte d'Ivoire": "Ivory Coast", "Bosnia and Herzegovina": "Bosnia", "Republic of Ireland": "Ireland", "DR Congo": "DR Congo" };
const words = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);

// ESPN stats: { app, sub, g, a, sv, ga } for one roster file, by ESPN athlete id
function espnStats(file) {
  const j = tryRead(file);
  const m = new Map();
  for (const a of j?.athletes ?? []) {
    const v = {};
    for (const c of a.statistics?.splits?.categories ?? []) for (const s of c.stats) v[s.name] = Number(s.value) || 0;
    m.set(a.id, { app: v.appearances || 0, sub: v.subIns || 0, g: v.totalGoals || 0, a: v.goalAssists || 0, sv: v.saves || 0, ga: v.goalsConceded || 0 });
  }
  return { athletes: j?.athletes ?? [], stats: m };
}
const ZERO = { app: 0, sub: 0, g: 0, a: 0, sv: 0, ga: 0 };
const involvement = (s) => s.app - s.sub + 0.4 * s.sub; // a start counts 1, a sub 0.4

// Club strength from the UEFA 5-year club coefficient
const coeff = new Map(read("uefa-coeff.json").data.members.map((m) => [String(m.member.id), m.overallRanking.totalPoints]));
const uefaTeams = new Map(read("uefa-teams.json").map((t) => [t.id, t]));
const uefaPlayers = fs
  .readFileSync(path.join(D, "uefa-players.ndjson"), "utf8")
  .trim()
  .split("\n")
  .map(JSON.parse);

const espnTeams = read("teams.json").sports[0].leagues[0].teams.map((t) => t.team);
const missing = espnTeams.filter((t) => !CLUBS[t.id]);
if (missing.length) throw new Error("No CLUBS entry for: " + missing.map((t) => `${t.id} ${t.displayName}`).join(", "));

const clubPts = espnTeams.map((t) => coeff.get(CLUBS[t.id].uefa) ?? 0).sort((a, b) => b - a);
const clubBase = (pts) => {
  // rank by coefficient → base OVR 82 (best) down to 66
  const rank = clubPts.indexOf(pts);
  return 82 - 16 * Math.pow(rank / (clubPts.length - 1), 0.8);
};

const review = [];
const pinsFound = new Set();
const rows = [];
const teams = [];
for (const t of espnTeams) {
  const club = CLUBS[t.id];
  const ut = uefaTeams.get(club.uefa);
  if (!ut) throw new Error(`UEFA team ${club.uefa} (${club.name}) not in uefa-teams.json`);
  teams.push({
    id: club.uefa,
    code: ut.teamCode,
    name: club.name,
    full: ut.translations?.displayOfficialName?.EN ?? t.displayName,
    color: club.colors[0],
    alt: club.colors[1],
    logo: ut.mediumLogoUrl,
  });

  const ucl = espnStats(`ucl/${t.id}.json`);
  const dom = espnStats(`dom/${t.id}.json`);
  const prev = espnStats(`prev/${t.id}.json`);
  const sameFile = !fs.existsSync(path.join(D, `dom/${t.id}.json`)); // clubs ESPN has no league for
  // every ESPN athlete on this club this season, by birth date
  const byDob = new Map();
  for (const a of [...ucl.athletes, ...dom.athletes]) {
    const dob = (a.dateOfBirth || "").slice(0, 10);
    if (!dob) continue;
    if (!byDob.has(dob)) byDob.set(dob, []);
    if (!byDob.get(dob).some((x) => x.id === a.id)) byDob.get(dob).push(a);
  }
  const matchEspn = (p) => {
    const cands = byDob.get(p.birthDate) ?? [];
    if (cands.length === 1) return cands[0];
    const w = new Set(words(p.internationalName));
    return cands.find((a) => words(a.displayName).some((x) => w.has(x))) ?? null;
  };

  const squad = uefaPlayers
    .filter((p) => p.clubId === club.uefa)
    .map((p) => {
      const e = matchEspn(p);
      const s = {
        ucl: (e && ucl.stats.get(e.id)) || ZERO,
        dom: (e && !sameFile && dom.stats.get(e.id)) || ZERO,
        prev: (e && prev.stats.get(e.id)) || ZERO,
      };
      return { p, e, s, pos: POS[p.fieldPosition] ?? "MF" };
    });
  const maxOf = (k) => Math.max(1, ...squad.map((x) => involvement(x.s[k])));
  const mx = { ucl: maxOf("ucl"), dom: maxOf("dom"), prev: maxOf("prev") };
  for (const x of squad) {
    // this season counts most; last season (same club only) fills in for summer signings and the injured
    x.inv = (involvement(x.s.dom) / mx.dom) * (sameFile ? 0 : 1) + involvement(x.s.ucl) / mx.ucl + 0.5 * (involvement(x.s.prev) / mx.prev);
  }
  squad.sort((a, b) => b.inv - a.inv);

  // pick: position quotas first, then the most-used of the rest
  const picked = new Set();
  for (const [pos, n] of Object.entries(QUOTA)) squad.filter((x) => x.pos === pos).slice(0, n).forEach((x) => picked.add(x));
  for (const x of squad) {
    if (picked.size >= PER_CLUB) break;
    if (x.pos === "GK") continue; // two keepers is enough
    picked.add(x);
  }
  // pinned stars who missed the cut (injured, or back from injury) join on top of the 18
  for (const x of squad.filter((x) => PINS[x.p.internationalName])) {
    picked.add(x);
    pinsFound.add(x.p.internationalName);
  }
  const sel = squad.filter((x) => picked.has(x));
  for (const x of squad.filter((x) => !picked.has(x) && x.inv > 0.9)) review.push(`${club.name} cut: ${x.p.internationalName} inv=${x.inv.toFixed(2)}`);
  for (const x of sel.filter((x) => !x.e)) review.push(`${club.name}: no ESPN match for ${x.p.internationalName} (${x.p.birthDate})`);

  const base = clubBase(coeff.get(club.uefa) ?? 0);
  const topInv = Math.max(...sel.map((x) => x.inv), 0.01);
  for (const x of sel) {
    const { p, s } = x;
    const all = ["dom", "ucl", "prev"].reduce((t, k) => ({ app: t.app + s[k].app, g: t.g + s[k].g, a: t.a + s[k].a }), { app: 0, g: 0, a: 0 });
    // role: a regular starter gets up to +3, a squad player down to -7
    const role = -7 + 10 * Math.sqrt(x.inv / topInv);
    // output: goals and assists per appearance, up to +5 (defenders count half)
    const ga = all.app < 6 ? 0 : (all.g + 0.7 * all.a) / all.app;
    const out = x.pos === "GK" ? 0 : Math.min(5, (x.pos === "DF" ? 3 : 7) * ga);
    const pin = PINS[p.internationalName];
    x.score = pin ?? Math.min(UNPINNED_MAX, base + role + out);
    // what the card shows: this season, league and Champions League together
    const cur = { app: s.dom.app + s.ucl.app, g: s.dom.g + s.ucl.g, a: s.dom.a + s.ucl.a, sv: s.dom.sv + s.ucl.sv, ga: s.dom.ga + s.ucl.ga };
    const stats = x.pos === "GK" ? { APP: cur.app, SV: cur.sv, GA: cur.ga } : { APP: cur.app, G: cur.g, A: cur.a };
    rows.push({
      id: p.id,
      espnId: x.e?.id ?? "",
      name: p.internationalName,
      club: club.uefa,
      pos: x.pos,
      nation: COUNTRY[p.translations?.countryName?.EN] ?? p.translations?.countryName?.EN ?? p.countryCode ?? "",
      jersey: p.clubJerseyNumber ?? "",
      age: Number(p.age) || null,
      score: x.score,
      stats: cur.app ? stats : null,
    });
  }
}

// Rarity by overall rank, in the same proportions as the NBA base set
// (Legendary 1.8%, Epic 5.6%, Rare 12.7%, Uncommon 24.5%, the rest Common).
rows.sort((a, b) => b.score - a.score);
const n = rows.length;
const cut = (f) => Math.round(n * f);
const [cL, cE, cR, cU] = [cut(0.018), cut(0.018 + 0.056), cut(0.018 + 0.056 + 0.127), cut(0.018 + 0.056 + 0.127 + 0.245)];
rows.forEach((r, i) => {
  const rank = i + 1;
  r.rarity = rank <= cL ? "legendary" : rank <= cE ? "epic" : rank <= cR ? "rare" : rank <= cU ? "uncommon" : "common";
  r.ovr = Math.max(55, Math.round(r.score));
  delete r.score;
});
for (const name of Object.keys(PINS)) if (!pinsFound.has(name)) review.push(`pin not found in any league-phase squad: ${name}`);

// card numbers: club by club (alphabetical), keepers first, then by shirt number
teams.sort((a, b) => a.name.localeCompare(b.name));
const order = { GK: 0, DF: 1, MF: 2, FW: 3 };
const clubIdx = new Map(teams.map((t, i) => [t.id, i]));
rows.sort((a, b) => clubIdx.get(a.club) - clubIdx.get(b.club) || order[a.pos] - order[b.pos] || (Number(a.jersey) || 99) - (Number(b.jersey) || 99));
rows.forEach((r, i) => (r.no = i + 1));

// Photos: UEFA's squad photo for this season; a player UEFA has not shot yet falls back to the
// latest season that has one (photoYear), or to none (photoYear: null → the card prints initials).
// Checked with parallel HEAD requests; results are cached in data/photos.json between runs.
const PHOTO_YEARS = [2027, 2026, 2025];
const photoCacheFile = path.join(D, "photos.json");
const photoCache = fs.existsSync(photoCacheFile) ? JSON.parse(fs.readFileSync(photoCacheFile, "utf8")) : {};
const photoUrl = (id, y) => `https://img.uefa.com/imgml/TP/players/1/${y}/324x324/${id}.jpg`;
for (const y of PHOTO_YEARS) {
  const todo = rows.filter((r) => !(r.id in photoCache)).map((r) => r.id);
  if (!todo.length) break;
  const out = require("child_process").execSync(
    `xargs -P 16 -I{} sh -c 'echo "{} $(curl -s -o /dev/null -I -w "%{http_code}" ${photoUrl("{}", y)})"'`,
    { input: todo.join("\n") },
  );
  for (const line of out.toString().trim().split("\n")) {
    const [id, code] = line.split(" ");
    if (code === "200") photoCache[id] = y;
  }
  if (y === PHOTO_YEARS.at(-1)) for (const id of todo) if (!(id in photoCache)) photoCache[id] = null;
}
fs.writeFileSync(photoCacheFile, JSON.stringify(photoCache));
for (const r of rows) {
  if (photoCache[r.id] !== PHOTO_YEARS[0]) r.photoYear = photoCache[r.id];
  if (photoCache[r.id] == null) review.push(`no UEFA photo: ${r.name}`);
}

const ts = `// GENERATED by scripts/ucl (fetch.sh + build.js) from UEFA's 2026-27 Champions League
// squad registrations and ESPN appearances. Snapshot: ${new Date().toISOString().slice(0, 10)}.
// ${teams.length} league-phase clubs, ${PER_CLUB} players each. OVR and rarity are Gate 7's own estimates
// (club coefficient + playing time + goals and assists), not official ratings.
// Stats are 2026-27 so far, league and Champions League together. Hand edits are fine.
import type { UclPlayerRow, UclTeam } from "./types";

export const UCL_SEASON = "2026-27";

export const UCL_TEAMS: UclTeam[] = ${JSON.stringify(teams, null, 2)};

export const UCL_PLAYERS: UclPlayerRow[] = [
${rows.map((r) => "  " + JSON.stringify(r)).join(",\n")}
];
`;
fs.writeFileSync(OUT, ts);

const by = (k) => rows.reduce((m, r) => ((m[r[k]] = (m[r[k]] || 0) + 1), m), {});
console.log(`clubs ${teams.length}, players ${rows.length}`, by("rarity"), by("pos"));
console.log("TOP 40:", [...rows].sort((a, b) => b.ovr - a.ovr).slice(0, 40).map((r) => `${r.name} ${r.ovr}`).join(" | "));
console.log("REVIEW:\n" + review.join("\n"));
