import { INSERT_ART } from "./insert-art";
import { INSERT_THUMBS, LOCAL_LOGOS, LOCAL_PLAYERS } from "./local-art";
import { INSERT_CARDS, INSERT_CLASSES } from "./inserts";
import { NBA_PLAYERS, NBA_TEAMS } from "./nba";
import { LOL_EVENT, LOL_PLAYERS, LOL_TEAMS } from "./lol";
import { MLB_PLAYERS, MLB_SEASON, MLB_TEAMS } from "./mlb";
import { NFL_PLAYERS, NFL_SEASON, NFL_TEAMS } from "./nfl";
import { NHL_PLAYERS, NHL_SEASON, NHL_TEAMS } from "./nhl";
import { UCL_PLAYERS, UCL_SEASON, UCL_TEAMS } from "./ucl";
import type { CardDesign, CardType, InsertType, Player, Rarity, Sport, StatLine } from "./types";
import { BASE_SETS, INSERT_TYPES, RARITIES, SPORTS } from "./types";

export * from "./types";
export { NBA_SEASON } from "./nba";
export { UCL_SEASON } from "./ucl";
export { NFL_SEASON } from "./nfl";
export { MLB_SEASON } from "./mlb";
export { NHL_SEASON } from "./nhl";
export { LOL_EVENT } from "./lol";

export const SET_ID = "s1";
export const SET_NAME = "Series 1";

const teamByAbbr = new Map(NBA_TEAMS.map((t) => [t.abbr, t]));
/** Champions League clubs by UEFA id. */
const clubById = new Map(UCL_TEAMS.map((t) => [t.id, t]));
const nflByAbbr = new Map(NFL_TEAMS.map((t) => [t.abbr, t]));
const mlbByAbbr = new Map(MLB_TEAMS.map((t) => [t.abbr, t]));
const nhlByAbbr = new Map(NHL_TEAMS.map((t) => [t.abbr, t]));
const teamByName = new Map(NBA_TEAMS.map((t) => [t.name, t]));
const nick = (abbr: string) => teamByAbbr.get(abbr)?.name ?? abbr;

/** ESPN's transparent headshot cut-out for a player (borrowed from ESPN's CDN). */
export const headshotUrl = (espnId: string) =>
  LOCAL_PLAYERS.has(`nba/${espnId}`) ? `/players/nba/${espnId}.webp` : `https://a.espncdn.com/i/headshots/nba/players/full/${espnId}.png`;

type EspnLeague = "nba" | "nfl" | "mlb" | "nhl";
/** A team logo: the small local WebP (scripts/photos.mjs) when there is one, else ESPN's 500 px PNG. */
const espnLogo = (league: EspnLeague, abbr: string) => {
  const a = abbr.toLowerCase();
  return LOCAL_LOGOS.has(`${league}/${a}`) ? `/logos/${league}/${a}.webp` : `https://a.espncdn.com/i/teamlogos/${league}/500/${a}.png`;
};

/** ESPN's NFL / MLB / NHL headshot cut-out, local WebP first (the same style as the NBA ones). */
const espnHeadshot = (league: EspnLeague, espnId: string) =>
  LOCAL_PLAYERS.has(`${league}/${espnId}`)
    ? `/players/${league}/${espnId}.webp`
    : `https://a.espncdn.com/i/headshots/${league}/players/full/${espnId}.png`;

const ABBR_FIX: Record<string, string> = { NY: "NYK", GS: "GSW", SA: "SAS", NO: "NOP", UTAH: "UTA", WSH: "WAS" };

/** Franchises that no longer play under the name a card prints. */
const HISTORIC: Record<string, { abbr: string; colors: [string, string] }> = {
  SuperSonics: { abbr: "SEA", colors: ["#00653a", "#ffc200"] },
  Braves: { abbr: "BUF", colors: ["#2a6ebb", "#f2672d"] },
  "Vancouver Grizzlies": { abbr: "VAN", colors: ["#00a7a7", "#b4793c"] },
  "New Orleans Hornets": { abbr: "NOH", colors: ["#00788c", "#5a2d82"] },
  Duke: { abbr: "DUKE", colors: ["#001a57", "#ffffff"] },
  "Philadelphia Warriors": { abbr: "PHW", colors: ["#1d428a", "#ffc72c"] },
};

/** Historic and non-NBA teams on cards, mapped to the franchise that carries them today. */
const LOGO_FRANCHISE: Record<string, string> = {
  SuperSonics: "OKC",
  Braves: "LAC",
  "Vancouver Grizzlies": "MEM",
  "New Orleans Hornets": "NO",
  Duke: "MIN", // Laettner: drafted by Minnesota in 1992
  "Philadelphia Warriors": "GS",
};

/** What a card needs to know about a team: the code it prints, its two colours, its logo. */
interface TeamInfo {
  code: string;
  colors: [string, string];
  logo?: string;
}

function nbaTeam(team: string): TeamInfo | undefined {
  const logoAbbr = LOGO_FRANCHISE[team] ?? teamByName.get(team)?.abbr;
  const logo = logoAbbr ? espnLogo("nba", logoAbbr) : undefined;
  if (HISTORIC[team]) return { code: HISTORIC[team].abbr, colors: HISTORIC[team].colors, logo };
  const t = teamByName.get(team);
  return t ? { code: ABBR_FIX[t.abbr] ?? t.abbr, colors: [t.color, t.alt], logo } : undefined;
}

/**
 * Teams by the name printed on the card, per sport. Nicknames repeat across leagues (Giants and
 * Cardinals in the NFL and MLB, Kings in the NBA and NHL, Panthers and Jets in the NFL and NHL,
 * Rangers in MLB and the NHL), so a lookup that knows the card's sport must pass it.
 */
const TEAMS: Record<Exclude<Sport, "basketball">, Map<string, TeamInfo>> = {
  soccer: new Map(UCL_TEAMS.map((t) => [t.name, { code: t.code, colors: [t.color, t.alt], logo: t.logo }])),
  football: new Map(NFL_TEAMS.map((t) => [t.name, { code: t.abbr, colors: [t.color, t.alt], logo: espnLogo("nfl", t.abbr) }])),
  baseball: new Map(MLB_TEAMS.map((t) => [t.name, { code: t.abbr, colors: [t.color, t.alt], logo: espnLogo("mlb", t.abbr) }])),
  hockey: new Map(NHL_TEAMS.map((t) => [t.name, { code: t.abbr, colors: [t.color, t.alt], logo: espnLogo("nhl", t.abbr) }])),
  esports: new Map(LOL_TEAMS.map((t) => [t.name, { code: t.abbr, colors: [t.color, t.alt], logo: lolLogo(t) }])),
};

/** A Worlds team's logo: the local WebP (scripts/photos.mjs) when there is one, else Leaguepedia's. */
function lolLogo(t: (typeof LOL_TEAMS)[number]) {
  const key = `lol/${t.abbr.toLowerCase()}`;
  return LOCAL_LOGOS.has(key) ? `/logos/${key}.webp` : (t.logo ?? undefined);
}

/** A team by its printed name. Without a sport, the NBA comes first (the insert sets are all NBA). */
function teamInfo(team: string, sport?: Sport): TeamInfo | undefined {
  if (sport) return sport === "basketball" ? nbaTeam(team) : TEAMS[sport].get(team);
  return nbaTeam(team) ?? TEAMS.soccer.get(team) ?? TEAMS.football.get(team) ?? TEAMS.baseball.get(team) ?? TEAMS.hockey.get(team);
}

/** The code a card prints for a team (NYK, RMA, KC, NYY, EDM...). */
export function teamCode(team: string, sport?: Sport): string {
  return teamInfo(team, sport)?.code ?? "";
}

/** The team's logo: UEFA's crest for clubs, ESPN's logo (local WebP when there is one) otherwise. */
export function teamLogo(team: string, sport?: Sport): string | undefined {
  return teamInfo(team, sport)?.logo;
}

/** [primary, secondary] team colours, from the team name shown on a card. */
export function teamColors(team: string, sport?: Sport): [string, string] {
  return teamInfo(team, sport)?.colors ?? ["#233862", "#a9b6d3"];
}

export function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Insert class display names. */
export const INSERT_NAMES: Record<InsertType, string> = Object.fromEntries(INSERT_CLASSES.map((c) => [c.id, c.name]));

/** The set a card type belongs to, as printed: "Series 1 · Base", "Champions League", "Golden Boy". */
export function setLabel(type: CardType): string {
  if (type === "base") return `${SET_NAME} · Base`;
  if (type === "rookie") return `${SET_NAME} · Rookie`;
  if (type === "ucl") return `${SET_NAME} · Champions League`;
  if (type === "nfl") return `${SET_NAME} · NFL`;
  if (type === "mlb") return `${SET_NAME} · MLB`;
  if (type === "nhl") return `${SET_NAME} · NHL`;
  if (type === "lol") return `${SET_NAME} · ${LOL_EVENT}`;
  return INSERT_NAMES[type] ?? type;
}

/** A set's binder title: "Base set", "Rookies", "Champions League", or the insert name. */
export const setTitle = (key: string) => BASE_SETS.find((b) => b.key === key)?.name ?? INSERT_NAMES[key] ?? key;

// ── Players (one per person; base and rookie rows share nothing) ──

export const PLAYERS: Player[] = NBA_PLAYERS.map((r) => ({
  id: `nba-${r.id}`,
  espnId: r.id,
  sport: "basketball",
  name: r.name,
  team: nick(r.team),
  teamAbbr: r.team,
  pos: r.pos,
  nation: r.nation,
  jersey: r.jersey,
  ovr: r.ovr,
  stats: r.stats,
  statLine: r.statLine,
  pick: r.pick,
  college: r.college,
}));

/** UEFA's official squad photo (324px JPEG on white), hotlinked like the ESPN cut-outs.
 *  UEFA names a season by the year it ends: 2027 = 2026-27. */
export const uefaPhotoUrl = (uefaId: string, year = 2027) => `https://img.uefa.com/imgml/TP/players/1/${year}/324x324/${uefaId}.jpg`;

const SOCCER_PLAYERS: Player[] = UCL_PLAYERS.map((r) => ({
  id: `ucl-${r.id}`,
  espnId: "", // the card's photo is UEFA's, not ESPN's NBA headshot path
  photo: r.photoYear === null ? undefined : uefaPhotoUrl(r.id, r.photoYear),
  sport: "soccer",
  name: r.name,
  team: clubById.get(r.club)?.name ?? r.club,
  teamAbbr: clubById.get(r.club)?.code ?? "",
  pos: r.pos,
  nation: r.nation,
  jersey: r.jersey,
  ovr: r.ovr,
  stats: r.stats,
  statLine: r.stats ? `${UCL_SEASON} so far` : null,
}));
PLAYERS.push(...SOCCER_PLAYERS);

/** ESPN's transparent NFL headshot cut-out (the same style as the NBA ones). */
export const nflHeadshotUrl = (espnId: string) => espnHeadshot("nfl", espnId);

/** Binder-size thumbnail of a local insert art file, when scripts/photos.mjs has made one. */
const artThumb = (art: string | undefined) => {
  const file = art?.startsWith("/inserts/") ? art.slice("/inserts/".length) : undefined;
  return file && INSERT_THUMBS.has(file) ? `/inserts/thumb/${file}.webp` : undefined;
};

const FOOTBALL_PLAYERS: Player[] = NFL_PLAYERS.map((r) => ({
  id: `nfl-${r.id}`,
  espnId: "", // the NBA headshot path does not apply; the photo is set below
  photo: r.photo === null ? undefined : nflHeadshotUrl(r.id),
  sport: "football",
  name: r.name,
  team: nflByAbbr.get(r.team)?.name ?? r.team,
  teamAbbr: r.team,
  pos: r.pos,
  nation: "",
  jersey: r.jersey,
  ovr: r.ovr,
  stats: r.stats,
  statLine: r.stats ? `${NFL_SEASON} season so far` : null,
  college: r.college || undefined,
}));
PLAYERS.push(...FOOTBALL_PLAYERS);

/** MLB and NHL players: ESPN rows with a nation (no college), and a headshot like the NBA's. */
function proPlayers(rows: typeof MLB_PLAYERS, sport: "baseball" | "hockey", league: "mlb" | "nhl", byAbbr: Map<string, { name: string }>, statLine: string): Player[] {
  return rows.map((r) => ({
    id: `${league}-${r.id}`,
    espnId: "", // the NBA headshot path does not apply; the photo is set here
    photo: r.photo === null ? undefined : espnHeadshot(league, r.id),
    sport,
    name: r.name,
    team: byAbbr.get(r.team)?.name ?? r.team,
    teamAbbr: r.team,
    pos: r.pos,
    nation: r.nation,
    jersey: r.jersey,
    ovr: r.ovr,
    stats: r.stats,
    statLine: r.stats ? statLine : null,
  }));
}
PLAYERS.push(
  ...proPlayers(MLB_PLAYERS, "baseball", "mlb", mlbByAbbr, `${MLB_SEASON} season`),
  ...proPlayers(NHL_PLAYERS, "hockey", "nhl", nhlByAbbr, `${NHL_SEASON} so far`),
);

// League of Legends players at Worlds 2026: the card prints the in-game name; photos are Leaguepedia's
const lolTeamByAbbr = new Map(LOL_TEAMS.map((t) => [t.abbr, t]));
PLAYERS.push(
  ...LOL_PLAYERS.map((r) => ({
    id: `lol-${r.id}`,
    espnId: "",
    photo: LOCAL_PLAYERS.has(`lol/${r.id}`) ? `/players/lol/${r.id}.webp` : (r.photo ?? undefined),
    sport: "esports" as const,
    name: r.name,
    team: lolTeamByAbbr.get(r.team)?.name ?? r.team,
    teamAbbr: r.team,
    pos: r.pos,
    nation: r.nation,
    jersey: "",
    ovr: r.ovr,
    stats: r.stats,
    statLine: r.stats ? LOL_EVENT : null,
  })),
);

// ── Base sets: NBA base + rookies, Champions League, NFL, MLB, NHL ──

const BASE_DESIGNS: CardDesign[] = [
  ...NBA_PLAYERS.map((r) => ({
    id: `nba-${r.id}-${r.type}`,
    sport: "basketball" as const,
    set: SET_ID,
    type: r.type,
    rarity: r.rarity,
    playerIds: [`nba-${r.id}`],
    ovr: r.ovr,
  })),
  ...UCL_PLAYERS.map((r) => ({
    id: `ucl-${r.id}`,
    sport: "soccer" as const,
    set: SET_ID,
    type: "ucl",
    rarity: r.rarity,
    playerIds: [`ucl-${r.id}`],
    ovr: r.ovr,
    no: r.no,
  })),
  ...NFL_PLAYERS.map((r) => ({
    id: `nfl-${r.id}`,
    sport: "football" as const,
    set: SET_ID,
    type: "nfl",
    rarity: r.rarity,
    playerIds: [`nfl-${r.id}`],
    ovr: r.ovr,
    no: r.no,
    rookie: r.rookie || undefined,
  })),
  ...([
    [MLB_PLAYERS, "baseball", "mlb"],
    [NHL_PLAYERS, "hockey", "nhl"],
  ] as const).flatMap(([rows, sport, league]) =>
    rows.map((r) => ({
      id: `${league}-${r.id}`,
      sport,
      set: SET_ID,
      type: league,
      rarity: r.rarity,
      playerIds: [`${league}-${r.id}`],
      ovr: r.ovr,
      no: r.no,
      rookie: r.rookie || undefined,
    })),
  ),
  ...LOL_PLAYERS.map((r) => ({
    id: `lol-${r.id}`,
    sport: "esports" as const,
    set: SET_ID,
    type: "lol",
    rarity: r.rarity,
    playerIds: [`lol-${r.id}`],
    ovr: r.ovr,
    no: r.no,
  })),
];

// ── Inserts (inserts.ts) ──
// Card ids are the ids from the insert document (NB1, GE9, ...). Splash art goes in insert-art.ts.

const baseById = new Map(PLAYERS.filter((p) => p.sport === "basketball").map((p) => [p.espnId, p]));
const classById = new Map(INSERT_CLASSES.map((c) => [c.id, c]));

/** Retired players and legends: no roster row, no headshot, no season stats. */
const legendId = (name: string) => `legend-${slug(name)}`;
const LEGEND_PLAYERS: Player[] = INSERT_CARDS.flatMap((c) =>
  [
    [c.legend, c.team],
    [c.legend2, c.team2],
  ] as const,
)
  .filter(([l]) => l)
  .map(([l, team]) => ({
    id: legendId(l!.name),
    espnId: "",
    sport: "basketball",
    name: l!.name,
    team: team ?? "",
    teamAbbr: "",
    pos: l!.pos,
    nation: l!.nation,
    jersey: "",
    ovr: l!.ovr,
    stats: null,
    statLine: null,
  }));

export const INSERT_DESIGNS: CardDesign[] = INSERT_CARDS.map((c) => {
  const cls = classById.get(c.cls);
  if (!cls) throw new Error(`Insert ${c.id}: unknown class ${c.cls}`);
  const slot = (id: string | undefined, legend: typeof c.legend, n: 1 | 2) => {
    const p = id ? baseById.get(id) : undefined;
    if (id && !p) throw new Error(`Insert ${c.id}: ESPN id ${id} is not in the base set`);
    if (!p && !legend) return null;
    return { id: p ? p.id : legendId(legend!.name), ovr: p ? Math.min(99, p.ovr + cls.boost) : legend!.ovr, n };
  };
  const one = slot(c.player, c.legend, 1);
  if (!one) throw new Error(`Insert ${c.id}: no player`);
  const two = slot(c.player2, c.legend2, 2);
  // a two-player card rates the pair: the average of the two; Grail cards are 99 unless they set one
  const ovr = cls.rarity === "grail" ? (c.ovr ?? 99) : (c.ovr ?? (two ? Math.round((one.ovr + two.ovr) / 2) : one.ovr));
  return {
    id: c.id,
    sport: "basketball",
    set: SET_ID,
    type: cls.id,
    rarity: cls.rarity,
    playerIds: two ? [one.id, two.id] : [one.id],
    ovr,
    title: c.title,
    kicker: c.kicker,
    team: c.team,
    team2: c.team2,
    career: c.career,
    fromTeam: c.fromTeam,
    stats: c.stats,
    statLine: c.stats ? c.note : undefined,
    meta: c.meta,
    note: c.note,
  };
});
export const DESIGNS: CardDesign[] = [...BASE_DESIGNS, ...INSERT_DESIGNS];

const playerById = new Map([...PLAYERS, ...LEGEND_PLAYERS].map((p) => [p.id, p]));
const designById = new Map(DESIGNS.map((d) => [d.id, d]));

if (designById.size !== DESIGNS.length) throw new Error("Duplicate card design ids in catalog");

export const getPlayer = (id: string) => playerById.get(id);
export const getDesign = (id: string) => designById.get(id);

/** Base-set designs grouped for normal pack slots: pool[sport][rarity]. */
export const POOLS = Object.fromEntries(
  SPORTS.map((s) => [s, Object.fromEntries(RARITIES.map((r) => [r, [] as CardDesign[]]))]),
) as Record<Sport, Record<Rarity, CardDesign[]>>;
for (const d of BASE_DESIGNS) POOLS[d.sport][d.rarity].push(d);

/** Insert designs by class, for the guaranteed insert slot. */
export const INSERT_POOLS = Object.fromEntries(
  INSERT_TYPES.map((t) => [t, INSERT_DESIGNS.filter((d) => d.type === t)]),
) as Record<InsertType, CardDesign[]>;

/** Everything the client needs to render a card, flattened. */
export interface CardView {
  designId: string;
  sport: Sport;
  type: CardDesign["type"];
  rarity: Rarity;
  title?: string;
  kicker?: string;
  year?: number;
  ovr: number;
  players: Pick<Player, "id" | "espnId" | "photo" | "name" | "team" | "pos" | "nation" | "jersey" | "pick" | "college">[];
  /** Card number within its set (Champions League and NFL cards). */
  no?: number;
  /** First-year player in a set without a rookie list (NFL). */
  rookie?: boolean;
  stats: StatLine | null;
  statLine: string | null;
  /** Team nickname to colour the card by (defaults to the player's team). */
  team: string;
  fromTeam?: string;
  team2?: string;
  /** Every team in the career, in order (Career Montage backs). */
  career?: string[];
  meta?: string;
  note?: string;
  /** Splash art for inserts, once one has been chosen. */
  art?: string;
  /** The same art at binder size (small cards use it; the viewer and the pack reveal use `art`). */
  artThumb?: string;
}

export function cardView(designId: string): CardView {
  const d = designById.get(designId);
  if (!d) throw new Error(`Unknown design ${designId}`);
  const ps = d.playerIds.map((id) => playerById.get(id)!);
  return {
    designId: d.id,
    sport: d.sport,
    type: d.type,
    rarity: d.rarity,
    title: d.title,
    kicker: d.kicker,
    year: d.year,
    ovr: d.ovr,
    players: ps.map(({ id, espnId, photo, name, team, pos, nation, jersey, pick, college }) => ({
      id,
      espnId,
      photo,
      name,
      team,
      pos,
      nation,
      jersey,
      pick,
      college,
    })),
    stats: d.stats ?? ps[0].stats,
    statLine: d.statLine ?? ps[0].statLine,
    team: d.team ?? ps[0].team,
    fromTeam: d.fromTeam,
    team2: d.team2,
    career: d.career,
    meta: d.meta,
    note: d.note,
    no: d.no,
    rookie: d.rookie,
    art: INSERT_ART[d.id] || undefined,
    artThumb: artThumb(INSERT_ART[d.id]),
  };
}
