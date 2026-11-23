import { INSERT_CLASSES } from "./inserts";

export type Sport = "basketball" | "soccer" | "football" | "baseball" | "hockey" | "esports";
export const SPORTS: readonly Sport[] = ["basketball", "soccer", "football", "baseball", "hockey", "esports"];

/** Grail sits above Mythic. No class uses it yet; its drop weight is 0 until one does. */
export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "grail"] as const;
export type Rarity = (typeof RARITIES)[number];

/**
 * Insert classes are defined in inserts.ts (INSERT_CLASSES + INSERT_CARDS). Each one
 * also needs a weight in odds.ts (INSERT_CLASS_WEIGHTS) and its own art style in
 * globals.css ([data-type="<class id>"]).
 */
export const INSERT_TYPES: readonly string[] = INSERT_CLASSES.map((c) => c.id);
export type InsertType = string;

/**
 * NBA base set + rookies, "ucl" for the soccer base set (Champions League squads), "nfl" for the
 * football base set (NFL depth charts), "mlb" and "nhl" for baseball and hockey, "lol" for the
 * League of Legends Worlds 2026 players, "duo" for
 * future multi-player cards, or an insert class id. Every non-insert type renders the base layout.
 */
export type CardType = "base" | "rookie" | "ucl" | "nfl" | "mlb" | "nhl" | "lol" | "duo" | (string & {});

/** The non-insert sets, in binder order: key (= card type), name, short mark, sport. */
export const BASE_SETS = [
  { key: "base", name: "Base set", short: "B", sport: "basketball" },
  { key: "rookie", name: "Rookies", short: "RC", sport: "basketball" },
  { key: "ucl", name: "Champions League", short: "UCL", sport: "soccer" },
  { key: "nfl", name: "NFL", short: "NFL", sport: "football" },
  { key: "mlb", name: "MLB", short: "MLB", sport: "baseball" },
  { key: "nhl", name: "NHL", short: "NHL", sport: "hockey" },
  { key: "lol", name: "Worlds 2026", short: "LOL", sport: "esports" },
] as const satisfies readonly { key: CardType; name: string; short: string; sport: Sport }[];
export type BaseSetKey = (typeof BASE_SETS)[number]["key"];
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

/** A Champions League club, from scripts/ucl. */
export interface UclTeam {
  id: string; // UEFA team id
  code: string; // "RMA"
  name: string; // name on the card, "Real Madrid"
  full: string; // "Real Madrid C.F."
  color: string;
  alt: string;
  logo: string; // UEFA crest (240px PNG)
}

/** One generated row per soccer card in ucl.ts. */
export interface UclPlayerRow {
  id: string; // UEFA player id (also names the official headshot)
  espnId: string; // "" when ESPN had no match
  name: string;
  club: string; // UEFA team id
  pos: "GK" | "DF" | "MF" | "FW";
  nation: string;
  jersey: string;
  age: number | null;
  rarity: Rarity;
  ovr: number;
  /** 2026-27 so far, league + Champions League: APP, G, A (keepers: APP, SV, GA). */
  stats: StatLine | null;
  /** Card number in the set, 1..n: club by club, keepers first. */
  no: number;
  /** Set when UEFA has no photo this season: an older season's photo, or null for none. */
  photoYear?: number | null;
}

/** An NFL team, from scripts/nfl. */
export interface NflTeam {
  abbr: string; // "KC"
  name: string; // nickname on the card, "Chiefs"
  full: string; // "Kansas City Chiefs"
  color: string;
  alt: string;
}

/** An MLB or NHL team, from scripts/mlb and scripts/nhl (the same shape as NflTeam). */
export type MlbTeam = NflTeam;
export type NhlTeam = NflTeam;

/** One generated row per baseball or hockey card in mlb.ts / nhl.ts. */
export interface ProPlayerRow {
  id: string; // ESPN athlete id (also names the headshot)
  name: string;
  team: string; // team abbreviation
  pos: string; // MLB: C, 1B ... DH, SP, CL, RP; NHL: C, LW, RW, D, G
  jersey: string;
  nation: string;
  rookie: boolean;
  rarity: Rarity;
  ovr: number;
  /** MLB: last season (AVG HR RBI; pitchers ERA W SO or ERA SV SO). NHL: this season (G A PTS; W GAA SV%). */
  stats: StatLine | null;
  no: number;
  /** null when ESPN has no headshot (the card prints initials). */
  photo?: null;
}
export type MlbPlayerRow = ProPlayerRow;

/** A League of Legends team at Worlds 2026, from scripts/lol (Leaguepedia). */
export interface LolTeam {
  abbr: string; // "BLG"
  name: string; // name on the card, "Bilibili Gaming"
  full: string; // Leaguepedia's page name
  color: string;
  alt: string;
  logo: string | null; // Leaguepedia's square logo (remote; npm run photos makes a local copy)
  finish: string; // "Champion", "Runner-up", "Semifinals", ..., "Play-In"
}

/** One generated row per League of Legends card in lol.ts. */
export interface LolPlayerRow {
  id: string; // slug of the Leaguepedia page ("bin-chen-ze-bin")
  name: string; // in-game name, "Faker"
  realName: string;
  team: string; // team abbreviation
  pos: "TOP" | "JNG" | "MID" | "BOT" | "SUP";
  nation: string;
  rarity: Rarity;
  ovr: number;
  /** At Worlds 2026: games, KDA, win %. */
  stats: StatLine | null;
  /** Leaguepedia's photo (remote), or null. */
  photo: string | null;
  no: number;
}
export type NhlPlayerRow = ProPlayerRow;

/** One generated row per "The Champions" card in champions.ts: a player from a league's last title run. */
export interface ChampionRow {
  id: string; // card id, "CH1"
  league: "NBA" | "NFL" | "MLB" | "NHL" | "UCL" | "LoL";
  sport: Sport;
  /** Where the player's photo and base card come from: ESPN id, UEFA id or League slug. */
  espn?: string;
  uefa?: string | null;
  lol?: string;
  name: string;
  pos: string;
  nation: string;
  /** UEFA's squad photo for the title season (PSG). */
  photo?: string | null;
  /** The title run: per game (NBA) or totals. */
  stats: StatLine | null;
  /** 1 = led the team's run, 0 = the last one in; rates players with no base card. */
  share: number;
}

/** One generated row per football card in nfl.ts. */
export interface NflPlayerRow {
  id: string; // ESPN athlete id (also names the headshot)
  name: string;
  team: string; // team abbreviation
  pos: string; // QB, RB, WR, TE, LT, LG, C, RG, RT, DE, DT, NT, OLB, LB, CB, S, K, P
  jersey: string;
  college: string;
  rookie: boolean;
  rarity: Rarity;
  ovr: number;
  /** 2026 season totals so far, by position (QB: YDS TD INT, DB: TKL INT PD, ...). */
  stats: StatLine | null;
  /** Card number in the set, 1..n: team by team, offense, defense, specialists. */
  no: number;
  /** null when ESPN has no headshot (the card prints initials). */
  photo?: null;
}

export interface Player {
  id: string;
  espnId: string;
  /** Headshot URL when it does not come from ESPN's NBA cut-outs (UEFA's official squad photo). */
  photo?: string;
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
  career?: string[];
  /** Stat line override (Generational shows the game's box score). */
  stats?: StatLine;
  statLine?: string;
  /** Replaces the team · nation line under the name. */
  meta?: string;
  /** Shown on the stub when there are no stats. */
  note?: string;
  /** Card number within its set (Champions League and NFL cards). */
  no?: number;
  /** A first-year player in a set without a separate rookie list (NFL): the card gets the RC mark. */
  rookie?: boolean;
}
