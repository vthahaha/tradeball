import { INSERT_CLASSES } from "./inserts";

// Basketball only for now. Keep the union shape so another sport can come back later.
export type Sport = "basketball";

export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
export type Rarity = (typeof RARITIES)[number];

/**
 * Insert classes are defined in inserts.ts (INSERT_CLASSES + INSERT_CARDS). Each one
 * also needs a weight in odds.ts (INSERT_CLASS_WEIGHTS) and its own art style in
 * globals.css ([data-type="<class id>"]).
 */
export const INSERT_TYPES: readonly string[] = INSERT_CLASSES.map((c) => c.id);
export type InsertType = string;

/** Base set + rookies, "duo" for future multi-player cards, or an insert class id. */
export type CardType = "base" | "rookie" | "duo" | (string & {});
export const isInsert = (t: CardType): t is InsertType => (INSERT_TYPES as readonly string[]).includes(t);

export const FINISHES = ["standard", "foil", "holo", "gold", "black", "masterpiece"] as const;
export type Finish = (typeof FINISHES)[number];

/** Per-game stat line shown on the card stub: PTS, REB, AST, STL, BLK, 3P%. */
export type StatLine = Record<string, number>;

export interface NbaTeam {
  abbr: string;
  name: string; // "Celtics"
  full: string; // "Boston Celtics"
  color: string;
  alt: string;
}

/** One generated row per card in nba.ts. */
export interface NbaPlayerRow {
  id: string; // ESPN athlete id
  name: string;
  team: string; // team abbreviation
  pos: string;
  nation: string;
  jersey: string;
  type: "base" | "rookie";
  rarity: Rarity;
  ovr: number;
  statLine: string | null; // which season the stats come from
  stats: StatLine | null;
  pick?: number;
  college?: string;
}

export interface Player {
  id: string;
  espnId: string;
  sport: Sport;
  name: string;
  team: string; // team nickname, e.g. "Celtics"
  teamAbbr: string;
  pos: string;
  nation: string;
  jersey: string;
  ovr: number;
  stats: StatLine | null;
  statLine: string | null;
  pick?: number;
  college?: string;
}

export interface CardDesign {
  id: string;
  sport: Sport;
  set: string;
  type: CardType;
  rarity: Rarity;
  playerIds: string[];
  /** Big line on the art (inserts), e.g. "83 PTS" or "Finals MVP". */
  title?: string;
  /** Small line above the title, e.g. "vs WSH · Mar 10, 2026". */
  kicker?: string;
  year?: number;
  ovr: number;
  /** Team nickname to show and colour by, when it is not the player's current team. */
  team?: string;
  /** New Blood: the team they came from (nickname). */
  fromTeam?: string;
  /** Two-player inserts (Rivalries): the second player's team (nickname). */
  team2?: string;
  /** Stat line override (Generational shows the game's box score). */
  stats?: StatLine;
  statLine?: string;
  /** Replaces the team · nation line under the name. */
  meta?: string;
  /** Shown on the stub when there are no stats. */
  note?: string;
}
