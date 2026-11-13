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
export function teamColors(team: string): [string, string] {
  const t = teamByName.get(team);
  return t ? [t.color, t.alt] : ["#233862", "#a9b6d3"];
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
const LEGEND_PLAYERS: Player[] = INSERT_CARDS.filter((c) => c.legend).map((c) => ({
  id: `legend-${slug(c.legend!.name)}`,
  espnId: "",
  sport: "basketball",
  name: c.legend!.name,
  team: c.team ?? "",
  teamAbbr: "",
  pos: c.legend!.pos,
  nation: c.legend!.nation,
  jersey: "",
  ovr: c.legend!.ovr,
  stats: null,
  statLine: null,
}));

export const INSERT_DESIGNS: CardDesign[] = INSERT_CARDS.map((c) => {
  const cls = classById.get(c.cls);
  if (!cls) throw new Error(`Insert ${c.id}: unknown class ${c.cls}`);
  const p = c.player ? baseById.get(c.player) : undefined;
  if (c.player && !p) throw new Error(`Insert ${c.id}: ESPN id ${c.player} is not in the base set`);
  const playerId = p ? p.id : `legend-${slug(c.legend!.name)}`;
  const ovr = c.ovr ?? (p ? Math.min(99, p.ovr + cls.boost) : c.legend!.ovr);
  return {
    id: c.id,
    sport: "basketball",
    set: SET_ID,
    type: cls.id,
    rarity: cls.rarity,
    playerIds: [playerId],
    ovr,
    title: c.title,
    kicker: c.kicker,
    team: c.team,
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
    meta: d.meta,
    note: d.note,
    art: INSERT_ART[d.id] || undefined,
  };
}
