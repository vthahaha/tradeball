// Basketball only for now. Keep the union shape so another sport can come back later.
export type Sport = "basketball";

export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
export type Rarity = (typeof RARITIES)[number];

/** Base set + rookies, and the insert classes. "duo" is kept for future inserts. */
export const CARD_TYPES = ["base", "rookie", "champs", "courtside", "hot", "arrival", "duo"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const INSERT_TYPES = ["champs", "courtside", "hot", "arrival"] as const;
export type InsertType = (typeof INSERT_TYPES)[number];
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

export interface ChampRow {
  id: string; // ESPN id
  years: number[]; // Finals MVP seasons (year the Finals were played)
}

export interface ArrivalRow {
  id: string;
  from: string; // previous team abbreviation
}

export interface HotGameRow {
  id: string;
  team: string; // team abbreviation the game was played for (2025-26)
  opp: string;
  home: boolean;
  date: string; // YYYY-MM-DD
  stats: StatLine;
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
  /** New Arrivals: the team they came from (nickname). */
  fromTeam?: string;
  /** Stat line override (Flamin' Hot shows the game's box score). */
  stats?: StatLine;
  statLine?: string;
}
