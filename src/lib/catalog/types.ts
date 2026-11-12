export type Sport = "soccer" | "basketball";

export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
export type Rarity = (typeof RARITIES)[number];

export const CARD_TYPES = ["base", "rookie", "star", "captain", "icon", "moment", "duo"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const FINISHES = ["standard", "foil", "holo", "gold", "black", "masterpiece"] as const;
export type Finish = (typeof FINISHES)[number];

/** Tags on a player row: S = star, R = rookie, C = captain, I = icon (legend). */
export type PlayerRow = [name: string, team: string, pos: string, nation: string, ovr: number, tags?: string];

export interface Player {
  id: string;
  sport: Sport;
  name: string;
  team: string;
  pos: string;
  nation: string;
  ovr: number;
  tags: string;
  stats: Record<string, number>;
}

/** Special cards defined by hand: moments, duos, mythic icons. */
export interface SpecialRow {
  type: "moment" | "duo" | "icon";
  rarity: Rarity;
  players: string[]; // player names
  title?: string; // e.g. "The Last Shot"
  year?: number;
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
