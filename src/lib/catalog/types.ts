// Basketball only for now. Keep the union shape so another sport can come back later.
export type Sport = "basketball";

export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
export type Rarity = (typeof RARITIES)[number];

/** Series 1 ships base and rookie cards only; the rest are kept for future inserts. */
export const CARD_TYPES = ["base", "rookie", "star", "captain", "icon", "moment", "duo"] as const;
export type CardType = (typeof CARD_TYPES)[number];

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
  title?: string;
  year?: number;
  ovr: number;
}
