import { INSERT_ART } from "./insert-art";
import { ARRIVALS, CHAMPS } from "./inserts";
import { NBA_PLAYERS, NBA_TEAMS } from "./nba";
import { HOT_GAMES } from "./nba-hot";
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
export const INSERT_NAMES: Record<InsertType, string> = {
  champs: "Champs",
  courtside: "Courtside",
  hot: "Flamin' Hot",
  arrival: "New Arrivals",
};

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
const rowById = new Map(NBA_PLAYERS.map((r) => [r.id, r]));

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

// ── Inserts ──

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};
const bump = (ovr: number, by: number) => Math.min(99, ovr + by);

function need(id: string) {
  const r = rowById.get(id);
  if (!r) throw new Error(`Insert references a player not in the set: ${id}`);
  return r;
}

const CHAMP_DESIGNS: CardDesign[] = CHAMPS.map((c) => {
  const r = need(c.id);
  return {
    id: `nba-${r.id}-champs`,
    sport: "basketball",
    set: SET_ID,
    type: "champs",
    rarity: "legendary",
    playerIds: [`nba-${r.id}`],
    ovr: bump(r.ovr, 2),
    title: c.years.length > 1 ? `${c.years.length}× Finals MVP` : "Finals MVP",
    kicker: c.years.join(" · "),
  };
});

// Courtside: the 25 best players in the base set (nba.ts lists base rows best-first).
const COURTSIDE_DESIGNS: CardDesign[] = NBA_PLAYERS.filter((r) => r.type === "base")
  .slice(0, 25)
  .map((r, i) => ({
    id: `nba-${r.id}-courtside`,
    sport: "basketball",
    set: SET_ID,
    type: "courtside",
    rarity: "epic",
    playerIds: [`nba-${r.id}`],
    ovr: bump(r.ovr, 1),
    kicker: `Row A · Seat ${i + 1}`,
  }));

const HOT_DESIGNS: CardDesign[] = HOT_GAMES.map((g) => {
  const r = need(g.id);
  return {
    id: `nba-${r.id}-hot`,
    sport: "basketball",
    set: SET_ID,
    type: "hot",
    rarity: "rare",
    playerIds: [`nba-${r.id}`],
    ovr: bump(r.ovr, 1),
    title: `${g.stats.PTS} PTS`,
    kicker: `${g.home ? "vs" : "@"} ${g.opp} · ${fmtDate(g.date)}`,
    team: nick(g.team),
    stats: g.stats,
    statLine: `Game, ${fmtDate(g.date)}`,
  };
});

const ARRIVAL_DESIGNS: CardDesign[] = ARRIVALS.map((a) => {
  const r = need(a.id);
  return {
    id: `nba-${r.id}-arrival`,
    sport: "basketball",
    set: SET_ID,
    type: "arrival",
    rarity: "rare",
    playerIds: [`nba-${r.id}`],
    ovr: r.ovr,
    kicker: `From the ${nick(a.from)}`,
    fromTeam: nick(a.from),
  };
});

export const INSERT_DESIGNS: CardDesign[] = [...CHAMP_DESIGNS, ...COURTSIDE_DESIGNS, ...HOT_DESIGNS, ...ARRIVAL_DESIGNS];
export const DESIGNS: CardDesign[] = [...BASE_DESIGNS, ...INSERT_DESIGNS];

const playerById = new Map(PLAYERS.map((p) => [p.id, p]));
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
    art: INSERT_ART[d.id],
  };
}
