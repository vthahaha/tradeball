import { INSERT_ART } from "./insert-art";
import { INSERT_CARDS, INSERT_CLASSES } from "./inserts";
import { NBA_PLAYERS, NBA_TEAMS } from "./nba";
import { NFL_PLAYERS, NFL_SEASON, NFL_TEAMS } from "./nfl";
import { UCL_PLAYERS, UCL_SEASON, UCL_TEAMS } from "./ucl";
import type { CardDesign, CardType, InsertType, Player, Rarity, Sport, StatLine } from "./types";
import { BASE_SETS, INSERT_TYPES, RARITIES, SPORTS } from "./types";

export * from "./types";
export { NBA_SEASON } from "./nba";
export { UCL_SEASON } from "./ucl";
export { NFL_SEASON } from "./nfl";

export const SET_ID = "s1";
export const SET_NAME = "Series 1";

const teamByAbbr = new Map(NBA_TEAMS.map((t) => [t.abbr, t]));
/** Champions League clubs by the name printed on the card ("Real Madrid") and by UEFA id. */
const clubByName = new Map(UCL_TEAMS.map((t) => [t.name, t]));
const clubById = new Map(UCL_TEAMS.map((t) => [t.id, t]));
/** NFL teams by nickname ("Chiefs", as printed) and by abbreviation. No nickname is shared with an NBA team. */
const nflByName = new Map(NFL_TEAMS.map((t) => [t.name, t]));
const nflByAbbr = new Map(NFL_TEAMS.map((t) => [t.abbr, t]));
const teamByName = new Map(NBA_TEAMS.map((t) => [t.name, t]));
const nick = (abbr: string) => teamByAbbr.get(abbr)?.name ?? abbr;

/** ESPN's transparent headshot cut-out for a player (borrowed from ESPN's CDN). */
export const headshotUrl = (espnId: string) => `https://a.espncdn.com/i/headshots/nba/players/full/${espnId}.png`;

/** [primary, secondary] team colours, from the team nickname shown on a card. */
const ABBR_FIX: Record<string, string> = { NY: "NYK", GS: "GSW", SA: "SAS", NO: "NOP", UTAH: "UTA", WSH: "WAS" };

/** Three-letter code for a team nickname, as printed on cards (NYK, GSW, SAS...). */
/** Franchises that no longer play under the name a card prints. */
const HISTORIC: Record<string, { abbr: string; colors: [string, string] }> = {
  SuperSonics: { abbr: "SEA", colors: ["#00653a", "#ffc200"] },
  Braves: { abbr: "BUF", colors: ["#2a6ebb", "#f2672d"] },
  "Vancouver Grizzlies": { abbr: "VAN", colors: ["#00a7a7", "#b4793c"] },
  "New Orleans Hornets": { abbr: "NOH", colors: ["#00788c", "#5a2d82"] },
  Duke: { abbr: "DUKE", colors: ["#001a57", "#ffffff"] },
  "Philadelphia Warriors": { abbr: "PHW", colors: ["#1d428a", "#ffc72c"] },
};

export function teamCode(team: string): string {
  const club = clubByName.get(team);
  if (club) return club.code;
  const nfl = nflByName.get(team);
  if (nfl) return nfl.abbr;
  if (HISTORIC[team]) return HISTORIC[team].abbr;
  const abbr = teamByName.get(team)?.abbr ?? "";
  return ABBR_FIX[abbr] ?? abbr;
}

/** Historic and non-NBA teams on cards, mapped to the franchise that carries them today. */
const LOGO_FRANCHISE: Record<string, string> = {
  SuperSonics: "OKC",
  Braves: "LAC",
  "Vancouver Grizzlies": "MEM",
  "New Orleans Hornets": "NO",
  Duke: "MIN", // Laettner: drafted by Minnesota in 1992
  "Philadelphia Warriors": "GS",
};

/** ESPN's logo for the team's current franchise (hotlinked like the headshots). */
export function teamLogo(team: string): string | undefined {
  const club = clubByName.get(team);
  if (club) return club.logo; // UEFA's crest
  const nfl = nflByName.get(team);
  if (nfl) return `https://a.espncdn.com/i/teamlogos/nfl/500/${nfl.abbr.toLowerCase()}.png`;
  const abbr = LOGO_FRANCHISE[team] ?? teamByName.get(team)?.abbr;
  return abbr ? `https://a.espncdn.com/i/teamlogos/nba/500/${abbr.toLowerCase()}.png` : undefined;
}

export function teamColors(team: string): [string, string] {
  const club = clubByName.get(team);
  if (club) return [club.color, club.alt];
  const nfl = nflByName.get(team);
  if (nfl) return [nfl.color, nfl.alt];
  const t = teamByName.get(team);
  return t ? [t.color, t.alt] : (HISTORIC[team]?.colors ?? ["#233862", "#a9b6d3"]);
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
export const nflHeadshotUrl = (espnId: string) => `https://a.espncdn.com/i/headshots/nfl/players/full/${espnId}.png`;

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

// ── Base sets: NBA base + rookies, Champions League, NFL ──

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
  };
}
