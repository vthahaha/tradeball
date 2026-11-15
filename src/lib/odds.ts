import type { Finish, InsertType, Rarity } from "./catalog/types";

/** Chance per normal card slot. Sums to 100. */
export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 0.9,
  mythic: 0.1,
  grail: 0, // reserved: no base card is Grail
};

/** The guaranteed slot only rolls Rare or better (same ratios). */
export const GUARANTEED_WEIGHTS: Partial<Record<Rarity, number>> = {
  rare: 10,
  epic: 4,
  legendary: 0.9,
  mythic: 0.1,
};

/** Pity: after this many packs without Legendary+, the guaranteed slot is Legendary+. */
export const PITY_LIMIT = 40;
export const PITY_WEIGHTS: Partial<Record<Rarity, number>> = { legendary: 90, mythic: 10 };

/** Chance per card for each finish (checked rarest first). */
export const FINISH_CHANCE: [Finish, number][] = [
  ["masterpiece", 1 / 2000],
  ["black", 1 / 400],
  ["gold", 1 / 80],
  ["holo", 1 / 30],
  ["foil", 1 / 8],
];

/** Numbered finishes: how many copies of each design can ever exist. */
export const FINISH_SUPPLY: Partial<Record<Finish, number>> = {
  gold: 50,
  black: 10,
  masterpiece: 1,
};

/** Condition grade weights (grade → weight). */
export const GRADE_WEIGHTS: [number, number][] = [
  [10, 3],
  [9, 22],
  [8, 35],
  [7, 25],
  [6, 10],
  [5, 3],
  [4, 2],
];

export const CARDS_PER_PACK = 8;
/** The last slots of every pack are inserts (the slot before them is the guaranteed Rare+). */
export const INSERTS_PER_PACK = 2;

/**
 * Each insert slot picks its class by these weights (rolled separately per slot).
 * The weights add up to 100, so each one is that class's % chance per insert slot.
 * A class left out here is never pulled.
 */
export const INSERT_CLASS_WEIGHTS: Partial<Record<InsertType, number>> = {
  // Uncommon: 43
  light: 10, // The Light
  shadow: 10, // The Shadow
  passports: 8, // Passports
  snipers: 5, // Snipers
  dimers: 5, // Dimers
  snatchers: 5, // Snatchers
  // Rare: 28
  newblood: 9, // New Blood
  fortress: 7, // Stone Fortress
  cult: 6.5, // Cult Classic
  wizards: 5.5, // Time Wizards
  // Epic: 19.8
  flash: 4, // Flash of Brilliance
  goodbyes: 4, // Hard Goodbyes
  dotd: 4, // Day of the Dead
  founders: 3, // Founding Father
  lunar: 2.4, // Lunar New Year
  thirdeye: 2.4, // The Third Eye
  // Legendary: 7.5
  goldenboy: 2.5, // Golden Boy
  botb: 2.5, // Best of the Best
  rivalries: 2.5, // Rivalries
  // Mythic: 1.6, about 1 pack in 30 holds one; a Generational about 1 in 125
  stardom: 0.6, // Ultimate Stardom
  dreamteam: 0.6, // The Dream Team
  generational: 0.4, // Generational
  // Grail: 0.1, about 1 pack in 500
  iconic: 0.1, // Iconic Moments
};
export const MAX_BANKED_PACKS = 3;

export function cooldownMs() {
  const mins = Number(process.env.PACK_COOLDOWN_MINUTES ?? 240);
  return Math.max(1, mins) * 60_000;
}

export function weightedPick<T extends string | number>(weights: Partial<Record<T, number>> | [T, number][]) {
  const entries = (Array.isArray(weights) ? weights : Object.entries(weights)) as [T, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    if ((r -= w) < 0) return k;
  }
  return entries[entries.length - 1][0];
}

export function rollFinish(): Finish {
  for (const [finish, chance] of FINISH_CHANCE) {
    if (Math.random() < chance) return finish;
  }
  return "standard";
}

export function rollGrade(): number {
  return Number(weightedPick(GRADE_WEIGHTS));
}

/** Recycling duplicates: shards per card. SHARDS_PER_PACK shards = 1 bonus pack. */
export const SHARDS_PER_PACK = 10;
export const SHARD_VALUE: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 4,
  epic: 8,
  legendary: 20,
  mythic: 50,
  grail: 150,
};
export const SHARD_FINISH_BONUS: Partial<Record<Finish, number>> = { foil: 1, holo: 3 };
/** Numbered cards can't be recycled: they're the whole point. */
export const NUMBERED_FINISHES: Finish[] = ["gold", "black", "masterpiece"];

export function shardValueFor(rarity: Rarity, finish: Finish) {
  return SHARD_VALUE[rarity] + (SHARD_FINISH_BONUS[finish] ?? 0);
}
