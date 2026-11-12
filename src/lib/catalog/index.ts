import { BASKETBALL_PLAYERS, BASKETBALL_SPECIALS } from "./basketball";
import { SOCCER_PLAYERS, SOCCER_SPECIALS } from "./soccer";
import type { CardDesign, Player, PlayerRow, Rarity, SpecialRow, Sport } from "./types";
import { RARITIES } from "./types";

export * from "./types";
export { teamColors } from "./teams";

export const SET_ID = "s1";
export const SET_NAME = "Series 1";

export function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Deterministic pseudo-random from a string, so stats never change between runs.
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Position profiles: offset from overall per stat.
const SOCCER_PROFILE: Record<string, number[]> = {
  //      PAC SHO PAS DRI DEF PHY
  FWD: [+3, +3, -4, +1, -45, -6],
  MID: [-5, -6, +3, +1, -15, -6],
  DEF: [-8, -35, -12, -14, +3, +1],
  GK: [-35, -60, -25, -40, +5, -12],
};
const BASKETBALL_PROFILE: Record<string, number[]> = {
  //     PTS REB AST STL BLK 3PT
  PG: [+1, -25, +4, -6, -40, +1],
  SG: [+2, -22, -12, -8, -38, +3],
  SF: [0, -12, -14, -8, -25, -4],
  PF: [-1, -2, -20, -14, -10, -14],
  C: [-3, +4, -22, -18, +2, -30],
};
const SOCCER_STATS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];
const BASKETBALL_STATS = ["PTS", "REB", "AST", "STL", "BLK", "3PT"];

function makeStats(sport: Sport, name: string, pos: string, ovr: number) {
  const labels = sport === "soccer" ? SOCCER_STATS : BASKETBALL_STATS;
  const profile = (sport === "soccer" ? SOCCER_PROFILE : BASKETBALL_PROFILE)[pos] ?? [0, 0, 0, 0, 0, 0];
  const rnd = seeded(name);
  const out: Record<string, number> = {};
  labels.forEach((label, i) => {
    const v = ovr + profile[i] + Math.round((rnd() - 0.5) * 10);
    out[label] = Math.max(20, Math.min(99, v));
  });
  return out;
}

function buildPlayers(sport: Sport, rows: PlayerRow[]): Player[] {
  return rows.map(([name, team, pos, nation, ovr, tags = ""]) => ({
    id: `${sport === "soccer" ? "fb" : "bb"}-${slug(name)}`,
    sport,
    name,
    team,
    pos,
    nation,
    ovr,
    tags,
    stats: makeStats(sport, name, pos, ovr),
  }));
}

function baseRarity(ovr: number): Rarity {
  if (ovr >= 86) return "rare";
  if (ovr >= 81) return "uncommon";
  return "common";
}

function bump(r: Rarity): Rarity {
  return RARITIES[Math.min(RARITIES.indexOf(r) + 1, RARITIES.length - 1)];
}

function buildDesigns(sport: Sport, players: Player[], specials: SpecialRow[]): CardDesign[] {
  const byName = new Map(players.map((p) => [p.name, p]));
  const designs: CardDesign[] = [];
  const add = (d: Omit<CardDesign, "sport" | "set">) => designs.push({ ...d, sport, set: SET_ID });

  for (const p of players) {
    if (p.tags.includes("I")) {
      add({ id: `${p.id}-icon`, type: "icon", rarity: "legendary", playerIds: [p.id], ovr: p.ovr });
      continue;
    }
    if (p.tags.includes("R")) {
      add({ id: `${p.id}-rookie`, type: "rookie", rarity: bump(baseRarity(p.ovr)), playerIds: [p.id], ovr: p.ovr });
    } else {
      add({ id: `${p.id}-base`, type: "base", rarity: baseRarity(p.ovr), playerIds: [p.id], ovr: p.ovr });
    }
    if (p.tags.includes("S")) {
      add({ id: `${p.id}-star`, type: "star", rarity: "epic", playerIds: [p.id], ovr: Math.min(99, p.ovr + 2) });
    }
    if (p.tags.includes("C")) {
      add({ id: `${p.id}-captain`, type: "captain", rarity: "rare", playerIds: [p.id], ovr: Math.min(99, p.ovr + 1) });
    }
  }

  for (const s of specials) {
    const ps = s.players.map((n) => {
      const p = byName.get(n);
      if (!p) throw new Error(`Special card references unknown player: ${n}`);
      return p;
    });
    const boost = s.rarity === "mythic" ? 4 : s.rarity === "legendary" ? 2 : 1;
    const ovr = Math.min(99, Math.max(...ps.map((p) => p.ovr)) + boost);
    const tail = slug(s.title ?? s.type);
    add({
      id: `${ps.map((p) => p.id).join("+")}-${s.type}-${tail}`,
      type: s.type,
      rarity: s.rarity,
      playerIds: ps.map((p) => p.id),
      title: s.title,
      year: s.year,
      ovr,
    });
  }
  return designs;
}

const soccerPlayers = buildPlayers("soccer", SOCCER_PLAYERS);
const basketballPlayers = buildPlayers("basketball", BASKETBALL_PLAYERS);

export const PLAYERS: Player[] = [...soccerPlayers, ...basketballPlayers];
export const DESIGNS: CardDesign[] = [
  ...buildDesigns("soccer", soccerPlayers, SOCCER_SPECIALS),
  ...buildDesigns("basketball", basketballPlayers, BASKETBALL_SPECIALS),
];

const playerById = new Map(PLAYERS.map((p) => [p.id, p]));
const designById = new Map(DESIGNS.map((d) => [d.id, d]));

if (designById.size !== DESIGNS.length) throw new Error("Duplicate card design ids in catalog");

export const getPlayer = (id: string) => playerById.get(id);
export const getDesign = (id: string) => designById.get(id);

/** Designs grouped for pack rolls: pool[sport][rarity] → designs. */
export const POOLS: Record<Sport, Record<Rarity, CardDesign[]>> = {
  soccer: Object.fromEntries(RARITIES.map((r) => [r, [] as CardDesign[]])) as Record<Rarity, CardDesign[]>,
  basketball: Object.fromEntries(RARITIES.map((r) => [r, [] as CardDesign[]])) as Record<Rarity, CardDesign[]>,
};
for (const d of DESIGNS) POOLS[d.sport][d.rarity].push(d);

/** Everything the client needs to render a card, flattened. */
export interface CardView {
  designId: string;
  sport: Sport;
  type: CardDesign["type"];
  rarity: Rarity;
  title?: string;
  year?: number;
  ovr: number;
  players: Pick<Player, "id" | "name" | "team" | "pos" | "nation">[];
  stats: Record<string, number>;
}

export function cardView(designId: string): CardView {
  const d = designById.get(designId);
  if (!d) throw new Error(`Unknown design ${designId}`);
  const ps = d.playerIds.map((id) => playerById.get(id)!);
  // Duo cards show the average of both players' stats.
  const stats: Record<string, number> = {};
  for (const key of Object.keys(ps[0].stats)) {
    const avg = ps.reduce((sum, p) => sum + p.stats[key], 0) / ps.length;
    const boost = d.ovr - Math.max(...ps.map((p) => p.ovr));
    stats[key] = Math.min(99, Math.round(avg + boost));
  }
  return {
    designId: d.id,
    sport: d.sport,
    type: d.type,
    rarity: d.rarity,
    title: d.title,
    year: d.year,
    ovr: d.ovr,
    players: ps.map(({ id, name, team, pos, nation }) => ({ id, name, team, pos, nation })),
    stats,
  };
}
