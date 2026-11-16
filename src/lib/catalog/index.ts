import { INSERT_ART } from "./insert-art";
import { INSERT_CARDS, INSERT_CLASSES } from "./inserts";
import { NBA_PLAYERS, NBA_TEAMS } from "./nba";
import type { CardDesign, InsertType, Player, Rarity, Sport, StatLine } from "./types";
import { INSERT_TYPES, RARITIES } from "./types";

export * from "./types";
export { NBA_SEASON } from "./nba";

export const SET_ID = "s1";
export const SET_NAME = "Series 1";

const teamByAbbr = new Map(NBA_TEAMS.map((t) => [t.abbr, t]));
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
  const abbr = LOGO_FRANCHISE[team] ?? teamByName.get(team)?.abbr;
  return abbr ? `https://a.espncdn.com/i/teamlogos/nba/500/${abbr.toLowerCase()}.png` : undefined;
}

export function teamColors(team: string): [string, string] {
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

// ── Base set + rookies ──

const BASE_DESIGNS: CardDesign[] = NBA_PLAYERS.map((r) => ({
  id: `nba-${r.id}-${r.type}`,
  sport: "basketball",
  set: SET_ID,
  type: r.type,
  rarity: r.rarity,
  playerIds: [`nba-${r.id}`],
  ovr: r.ovr,
}));

// ── Inserts (inserts.ts) ──
// Card ids are the ids from the insert document (NB1, GE9, ...). Splash art goes in insert-art.ts.

const baseById = new Map(PLAYERS.map((p) => [p.espnId, p]));
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
  // a two-player card rates the pair: the average of the two; Grail cards are always 99
  const ovr = cls.rarity === "grail" ? 99 : (c.ovr ?? (two ? Math.round((one.ovr + two.ovr) / 2) : one.ovr));
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

/** Base + rookie designs grouped for normal pack slots: pool[sport][rarity]. */
export const POOLS: Record<Sport, Record<Rarity, CardDesign[]>> = {
  basketball: Object.fromEntries(RARITIES.map((r) => [r, [] as CardDesign[]])) as Record<Rarity, CardDesign[]>,
};
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
  players: Pick<Player, "id" | "espnId" | "name" | "team" | "pos" | "nation" | "jersey" | "pick" | "college">[];
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
    players: ps.map(({ id, espnId, name, team, pos, nation, jersey, pick, college }) => ({
      id,
      espnId,
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
    art: INSERT_ART[d.id] || undefined,
  };
}
