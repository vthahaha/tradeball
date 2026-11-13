// Series 1 insert classes, from "Insert Categories Set 1" and "Set 2 - Classic".
// Every card's id is the id from that document (NB1, HG2, GE9, ...): that is the
// key to use in insert-art.ts and what /admin lists.
//
// `player` is an ESPN athlete id for active players; team, position and season stats
// come from their base-set row in nba.ts (an unknown id fails the build). Retired
// players and legends are written out by hand with `legend`.
import type { Rarity, StatLine } from "./types";

export interface InsertClass {
  id: string;
  name: string;
  rarity: Rarity;
  /** Added to the player's OVR on this insert (capped at 99). */
  boost: number;
}

/** Display order follows the document. Odds per class live in odds.ts. */
export const INSERT_CLASSES: InsertClass[] = [
  { id: "newblood", name: "New Blood", rarity: "rare", boost: 2 },
  { id: "goodbyes", name: "Hard Goodbyes", rarity: "epic", boost: 0 },
  { id: "goldenboy", name: "Golden Boy", rarity: "rare", boost: 4 },
  { id: "generational", name: "Generational", rarity: "mythic", boost: 0 },
  { id: "stardom", name: "Ultimate Stardom", rarity: "legendary", boost: 3 },
  { id: "light", name: "The Light", rarity: "uncommon", boost: 3 },
  { id: "shadow", name: "The Shadow", rarity: "uncommon", boost: 3 },
  { id: "fortress", name: "Stone Fortress", rarity: "rare", boost: 3 },
  { id: "cult", name: "Cult Classic", rarity: "epic", boost: 0 },
  // Set 2, "Classic"
  { id: "botb", name: "Best of the Best", rarity: "legendary", boost: 3 },
  { id: "rivalries", name: "Rivalries", rarity: "epic", boost: 2 },
];

export interface Legend {
  name: string;
  pos: string;
  nation: string;
  ovr: number;
}

export interface InsertCard {
  id: string;
  cls: string;
  /** ESPN athlete id (active players). */
  player?: string;
  /** Retired players and legends, not on a 2026-27 roster. */
  legend?: Legend;
  /** Two-player cards (Rivalries): the second player, and the team they are coloured by. */
  player2?: string;
  legend2?: Legend;
  team2?: string;
  /** Team nickname to show and colour by, when not the player's current team. */
  team?: string;
  fromTeam?: string;
  title?: string;
  kicker?: string;
  stats?: StatLine;
  ovr?: number;
  /** Replaces the team · nation line under the name. */
  meta?: string;
  /** Shown on the stub when the card has no stats. */
  note?: string;
}

const L = (name: string, pos: string, nation: string, ovr: number): Legend => ({
  name,
  pos,
  nation,
  ovr,
});

// 1. New Blood: signed for a new team in the 2026 offseason
const NEW_BLOOD: InsertCard[] = [
  { id: "NB1", player: "3917376", fromTeam: "Celtics" }, // Jaylen Brown, BOS → PHI
  { id: "NB2", player: "1966", fromTeam: "Lakers" }, // LeBron James, LAL → PHI
  { id: "NB3", player: "3032977", fromTeam: "Bucks" }, // Giannis Antetokounmpo, MIL → MIA
  { id: "NB4", player: "4593125", fromTeam: "Grizzlies" }, // Santi Aldama, MEM → DAL
  { id: "NB5", player: "4433136", fromTeam: "Jazz" }, // Walker Kessler, UTA → LAL
  { id: "NB6", player: "6440", fromTeam: "Pistons" }, // Tobias Harris, DET → SAS
  { id: "NB7", player: "4351852", fromTeam: "Knicks" }, // Mitchell Robinson, NYK → BOS
  { id: "NB8", player: "6450", fromTeam: "Clippers" }, // Kawhi Leonard, LAC → TOR
  { id: "NB9", player: "4397020", fromTeam: "Thunder" }, // Lu Dort, OKC → ATL
  { id: "NB10", player: "4433247", fromTeam: "Warriors" }, // Jonathan Kuminga, GSW → MIN
  { id: "NB11", player: "4279888", fromTeam: "Grizzlies" }, // Ja Morant, MEM → POR
  { id: "NB12", player: "3978", fromTeam: "Kings" }, // DeMar DeRozan, SAC → DEN
  { id: "NB13", player: "4432816", fromTeam: "Hornets" }, // LaMelo Ball, CHA → MIN
  { id: "NB14", player: "3064514", fromTeam: "Timberwolves" }, // Julius Randle, MIN → BKN
  { id: "NB15", player: "2595516", fromTeam: "Heat" }, // Norman Powell, MIA → CHI
].map((c) => ({ ...c, cls: "newblood" }));

// 2. Hard Goodbyes: retired in 2026
const HARD_GOODBYES: InsertCard[] = [
  { id: "HG1", legend: L("Garrett Temple", "G", "USA", 78) },
  { id: "HG2", legend: L("Chris Paul", "G", "USA", 93) },
  { id: "HG3", legend: L("Kyle Lowry", "G", "USA", 88) },
  { id: "HG4", legend: L("Taj Gibson", "F", "USA", 80) },
  { id: "HG5", legend: L("Nicolas Batum", "F", "France", 82) },
  { id: "HG6", legend: L("Isaiah Whitehead", "G", "USA", 74) },
  { id: "HG7", legend: L("Malcolm Brogdon", "G", "USA", 82) },
  { id: "HG8", legend: L("Danilo Gallinari", "F", "Italy", 83) },
  { id: "HG9", legend: L("P.J. Tucker", "F", "USA", 79) },
  { id: "HG10", legend: L("Russell Westbrook", "G", "USA", 92) },
].map((c) => ({
  ...c,
  cls: "goodbyes",
  meta: "Retired · 2026",
  note: "Thanks for the memories",
}));

// 3. Golden Boy: U-23 breakout seasons
const GOLDEN_BOY: InsertCard[] = [
  { id: "GB1", player: "5104157" }, // Victor Wembanyama
  { id: "GB2", player: "5041939" }, // Cooper Flagg
  { id: "GB3", player: "5037871" }, // Dylan Harper
  { id: "GB4", player: "4845367" }, // Stephon Castle
  { id: "GB5", player: "5061575" }, // Kon Knueppel
  { id: "GB6", player: "5124612" }, // VJ Edgecombe
  { id: "GB7", player: "4433621" }, // Jalen Duren
  { id: "GB8", player: "5105565" }, // Donovan Clingan
  { id: "GB9", player: "4711294" }, // Matas Buzelis
  { id: "GB10", player: "4873138" }, // Ace Bailey
].map((c) => ({ ...c, cls: "goldenboy" }));

// 4. Generational: the game, as it happened (team = the team they played for that night)
const GAME = "2025-26 game";
const GENERATIONAL: InsertCard[] = (
  [
    {
      id: "GE1",
      player: "3112335",
      title: "56 · 16 · 15",
      kicker: "Christmas Day vs MIN",
      stats: { PTS: 56, REB: 16, AST: 15 },
    },
    {
      id: "GE2",
      player: "5104157",
      title: "12 BLK",
      kicker: "vs MIN",
      stats: { PTS: 11, REB: 15, BLK: 12 },
    },
    {
      id: "GE3",
      player: "3934672",
      title: "45 PTS",
      kicker: "Finals Game 5 vs SAS",
      stats: { PTS: 45 },
    },
    {
      id: "GE4",
      player: "3945274",
      title: "60 PTS",
      kicker: "vs MIA",
      stats: { PTS: 60 },
    },
    {
      id: "GE5",
      player: "6450",
      team: "Clippers",
      title: "55 · 11",
      kicker: "vs DET · 5 STL · 3 BLK",
      stats: { PTS: 55, REB: 11, STL: 5, BLK: 3 },
    },
    {
      id: "GE6",
      player: "5041939",
      title: "51 PTS",
      kicker: "vs ORL · Rookie record",
      stats: { PTS: 51 },
    },
    {
      id: "GE7",
      player: "4278073",
      title: "55 · 8 · 5",
      kicker: "Opening night vs IND",
      stats: { PTS: 55, REB: 8, AST: 5 },
    },
    {
      id: "GE8",
      player: "3975",
      title: "48 PTS",
      kicker: "vs POR · 12 threes",
      stats: { PTS: 48, "3PM": 12 },
    },
    {
      id: "GE9",
      player: "4066261",
      title: "83 PTS",
      kicker: "vs WAS",
      stats: { PTS: 83 },
    },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "generational", ovr: 99, note: GAME }));

// 5. Ultimate Stardom: the best players last season
const STARDOM: InsertCard[] = [
  { id: "US1", player: "4278073" }, // Shai Gilgeous-Alexander
  { id: "US2", player: "3945274" }, // Luka Doncic
  { id: "US3", player: "5104157" }, // Victor Wembanyama
  { id: "US4", player: "3934672" }, // Jalen Brunson
  { id: "US5", player: "3908809" }, // Donovan Mitchell
  { id: "US6", player: "4431678" }, // Tyrese Maxey
  { id: "US7", player: "4594268" }, // Anthony Edwards
  { id: "US8", player: "3112335" }, // Nikola Jokic
  { id: "US9", player: "1966" }, // LeBron James
  { id: "US10", player: "4432166" }, // Cade Cunningham
].map((c) => ({ ...c, cls: "stardom" }));

// 6. The Light: one notable player per Eastern Conference team
const THE_LIGHT: InsertCard[] = [
  { id: "TL1", player: "4869342" }, // Dyson Daniels, ATL
  { id: "TL2", player: "4397424" }, // Neemias Queta, BOS
  { id: "TL3", player: "5175643" }, // Egor Demin, BKN
  { id: "TL4", player: "4576060" }, // Ryan Kalkbrenner, CHA
  { id: "TL5", player: "4397189" }, // Jalen Smith, CHI
  { id: "TL6", player: "4066328" }, // Jarrett Allen, CLE
  { id: "TL7", player: "3157465" }, // Duncan Robinson, DET
  { id: "TL8", player: "4017837" }, // Ivica Zubac, IND
  { id: "TL9", player: "4601025" }, // Pelle Larsson, MIA
  { id: "TL10", player: "5105623" }, // Kel'el Ware, MIL
  { id: "TL11", player: "3062679" }, // Josh Hart, NYK
  { id: "TL12", player: "4277847" }, // Wendell Carter Jr., ORL
  { id: "TL13", player: "4351851" }, // Anfernee Simons, PHI
  { id: "TL14", player: "4395625" }, // RJ Barrett, TOR
  { id: "TL15", player: "5160992" }, // Alex Sarr, WAS
].map((c) => ({ ...c, cls: "light" }));

// 7. The Shadow: one notable player per Western Conference team
const THE_SHADOW: InsertCard[] = [
  { id: "TS1", player: "4432582" }, // Max Christie, DAL
  { id: "TS2", player: "3064290" }, // Aaron Gordon, DEN
  { id: "TS3", player: "4709138" }, // Brandin Podziemski, GSW
  { id: "TS4", player: "2991230" }, // Fred VanVleet, HOU
  { id: "TS5", player: "4066648" }, // Rui Hachimura, LAC
  { id: "TS6", player: "3907498" }, // Matisse Thybulle, LAL
  { id: "TS7", player: "4600663" }, // Zach Edey, MEM
  { id: "TS8", player: "4431671" }, // Jaden McDaniels, MIN
  { id: "TS9", player: "4397136" }, // Saddiq Bey, NOP
  { id: "TS10", player: "4683692" }, // Cason Wallace, OKC
  { id: "TS11", player: "3155526" }, // Dillon Brooks, PHO
  { id: "TS12", player: "4683678" }, // Scoot Henderson, POR
  { id: "TS13", player: "4594327" }, // Keegan Murray, SAC
  { id: "TS14", player: "4592479" }, // Julian Champagnie, SAS
  { id: "TS15", player: "4684793" }, // Kyle Filipowski, UTA
].map((c) => ({ ...c, cls: "shadow" }));

// 8. Stone Fortress: the best defenders (Wemby sits this one out)
const STONE_FORTRESS: InsertCard[] = [
  { id: "SF1", player: "3032976" }, // Rudy Gobert, MIN
  { id: "SF2", player: "4432158" }, // Evan Mobley, CLE
  { id: "SF3", player: "4277961" }, // Jaren Jackson Jr., UTA
  { id: "SF4", player: "4684742" }, // Ausar Thompson, DET
  { id: "SF5", player: "4433255" }, // Chet Holmgren, OKC
  { id: "SF6", player: "3078576" }, // Derrick White, BOS
  { id: "SF7", player: "3934719" }, // OG Anunoby, NYK
  { id: "SF8", player: "4433134" }, // Scottie Barnes, TOR
  { id: "SF9", player: "4431736" }, // Toumani Camara, POR
  { id: "SF10", player: "6589" }, // Draymond Green, GSW
  { id: "SF11", player: "4684740" }, // Amen Thompson, HOU
  { id: "SF12", player: "2991139" }, // Kris Dunn, LAC
].map((c) => ({ ...c, cls: "fortress" }));

// 9. Cult Classic: one franchise cult hero per team
const CULT_CLASSIC: InsertCard[] = [
  { id: "CC1", team: "Hawks", legend: L("Kevin Willis", "F", "USA", 84) },
  { id: "CC2", team: "Celtics", legend: L("Reggie Lewis", "F", "USA", 86) },
  { id: "CC3", team: "Nets", legend: L("Buck Williams", "F", "USA", 85) },
  {
    id: "CC4",
    team: "Hornets",
    legend: L("Bismack Biyombo", "C", "DR Congo", 78),
  },
  { id: "CC5", team: "Bulls", legend: L("Bob Love", "F", "USA", 85) },
  { id: "CC6", team: "Cavaliers", legend: L("Austin Carr", "G", "USA", 83) },
  { id: "CC7", team: "Mavericks", legend: L("Jason Terry", "G", "USA", 86) },
  { id: "CC8", team: "Nuggets", legend: L("Kiki Vandeweghe", "F", "USA", 85) },
  { id: "CC9", team: "Pistons", legend: L("Rick Mahorn", "F", "USA", 81) },
  { id: "CC10", team: "Warriors", legend: L("Chris Mullin", "F", "USA", 90) },
  {
    id: "CC11",
    team: "Rockets",
    legend: L("Rudy Tomjanovich", "F", "USA", 86),
  },
  { id: "CC12", team: "Pacers", legend: L("Victor Oladipo", "G", "USA", 85) },
  { id: "CC13", team: "Clippers", legend: L("Chris Kaman", "C", "USA", 82) },
  { id: "CC14", team: "Lakers", legend: L("Derek Fisher", "G", "USA", 83) },
  {
    id: "CC15",
    team: "Grizzlies",
    legend: L("Shareef Abdur-Rahim", "F", "USA", 86),
  },
  { id: "CC16", team: "Heat", legend: L("Rony Seikaly", "C", "Lebanon", 83) },
  { id: "CC17", team: "Bucks", legend: L("Michael Redd", "G", "USA", 87) },
  {
    id: "CC18",
    team: "Timberwolves",
    legend: L("Christian Laettner", "F", "USA", 83),
  },
  { id: "CC19", team: "Pelicans", legend: L("David West", "F", "USA", 85) },
  { id: "CC20", team: "Knicks", legend: L("Allan Houston", "G", "USA", 86) },
  { id: "CC21", team: "Thunder", legend: L("Gus Williams", "G", "USA", 87) },
  { id: "CC22", team: "Magic", legend: L("Rafer Alston", "G", "USA", 80) },
  {
    id: "CC23",
    team: "76ers",
    legend: L("Clarence Weatherspoon", "F", "USA", 81),
  },
  { id: "CC24", team: "Suns", legend: L("Kevin Johnson", "G", "USA", 89) },
  {
    id: "CC25",
    team: "Trail Blazers",
    legend: L("Jim Paxson", "G", "USA", 83),
  },
  { id: "CC26", team: "Kings", legend: L("DeMarcus Cousins", "C", "USA", 88) },
  { id: "CC27", team: "Spurs", legend: L("Bruce Bowen", "F", "USA", 82) },
  {
    id: "CC28",
    team: "Raptors",
    legend: L("Damon Stoudamire", "G", "USA", 84),
  },
  { id: "CC29", team: "Jazz", legend: L("Mark Eaton", "C", "USA", 82) },
  { id: "CC30", team: "Wizards", legend: L("Brendan Haywood", "C", "USA", 79) },
].map((c) => ({ ...c, cls: "cult", note: "Franchise cult hero" }));

// ── Set 2, "Classic" ──

// A. Best of the Best: Finals MVPs, coloured by the team they won it with
const BEST_OF_THE_BEST: InsertCard[] = (
  [
    { id: "BOTB1", player: "3934672", team: "Knicks", kicker: "2026" }, // Jalen Brunson
    { id: "BOTB2", player: "4278073", team: "Thunder", kicker: "2025" }, // Shai Gilgeous-Alexander
    { id: "BOTB3", player: "3917376", team: "Celtics", kicker: "2024" }, // Jaylen Brown
    { id: "BOTB4", player: "1966", team: "Cavaliers", kicker: "2016" }, // LeBron James
    {
      id: "BOTB5",
      team: "Mavericks",
      kicker: "2011",
      legend: L("Dirk Nowitzki", "F", "Germany", 95),
    },
    {
      id: "BOTB6",
      team: "Lakers",
      kicker: "2009",
      legend: L("Kobe Bryant", "G", "USA", 97),
    },
    {
      id: "BOTB7",
      team: "Spurs",
      kicker: "2005",
      legend: L("Tim Duncan", "F", "USA", 97),
    },
    {
      id: "BOTB8",
      team: "Pistons",
      kicker: "2004",
      legend: L("Chauncey Billups", "G", "USA", 90),
    },
    {
      id: "BOTB9",
      team: "SuperSonics",
      kicker: "1979",
      legend: L("Dennis Johnson", "G", "USA", 89),
    },
    {
      id: "BOTB10",
      team: "Rockets",
      kicker: "1994",
      legend: L("Hakeem Olajuwon", "C", "Nigeria", 97),
    },
    {
      id: "BOTB11",
      team: "Bulls",
      kicker: "1991",
      legend: L("Michael Jordan", "G", "USA", 99),
    },
    {
      id: "BOTB12",
      team: "Pistons",
      kicker: "1989",
      legend: L("Joe Dumars", "G", "USA", 90),
    },
    {
      id: "BOTB13",
      team: "76ers",
      kicker: "1983",
      legend: L("Moses Malone", "C", "USA", 95),
    },
    {
      id: "BOTB14",
      team: "Trail Blazers",
      kicker: "1977",
      legend: L("Bill Walton", "C", "USA", 92),
    },
    {
      id: "BOTB15",
      team: "Warriors",
      kicker: "1975",
      legend: L("Rick Barry", "F", "USA", 94),
    },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "botb", title: "Finals MVP", note: "Finals MVP" }));

// B. Rivalries: two players, each coloured by the team they fought it out for
const RIVALRIES: InsertCard[] = (
  [
    {
      id: "RV1",
      team: "Celtics",
      legend: L("Larry Bird", "F", "USA", 98),
      team2: "Lakers",
      legend2: L("Magic Johnson", "G", "USA", 98),
    },
    {
      id: "RV2",
      team: "Bulls",
      legend: L("Michael Jordan", "G", "USA", 99),
      team2: "Pistons",
      legend2: L("Isiah Thomas", "G", "USA", 94),
    },
    {
      id: "RV3",
      team: "Cavaliers",
      player: "1966",
      team2: "Warriors",
      player2: "3975",
    }, // LeBron James & Stephen Curry
    {
      id: "RV4",
      team: "Spurs",
      legend: L("Tim Duncan", "F", "USA", 97),
      team2: "Mavericks",
      legend2: L("Dirk Nowitzki", "F", "Germany", 95),
    },
    {
      id: "RV5",
      team: "Suns",
      legend: L("Charles Barkley", "F", "USA", 95),
      team2: "Jazz",
      legend2: L("Karl Malone", "F", "USA", 95),
    },
    {
      id: "RV6",
      team: "Timberwolves",
      player: "4594268",
      team2: "Thunder",
      player2: "4278073",
    }, // Anthony Edwards & Shai Gilgeous-Alexander
    {
      id: "RV7",
      team: "Celtics",
      legend: L("Bill Russell", "C", "USA", 97),
      team2: "76ers",
      legend2: L("Wilt Chamberlain", "C", "USA", 98),
    },
    {
      id: "RV8",
      team: "Bucks",
      legend: L("Kareem Abdul-Jabbar", "C", "USA", 98),
      team2: "Pistons",
      legend2: L("Bob Lanier", "C", "USA", 90),
    },
    {
      id: "RV9",
      team: "76ers",
      legend: L("Allen Iverson", "G", "USA", 95),
      team2: "Lakers",
      legend2: L("Kobe Bryant", "G", "USA", 97),
    },
    {
      id: "RV10",
      team: "Lakers",
      legend: L("Shaquille O'Neal", "C", "USA", 98),
      team2: "Magic",
      legend2: L("Dwight Howard", "C", "USA", 92),
    },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "rivalries", note: "Rivalries" }));

export const INSERT_CARDS: InsertCard[] = [
  ...NEW_BLOOD,
  ...HARD_GOODBYES,
  ...GOLDEN_BOY,
  ...GENERATIONAL,
  ...STARDOM,
  ...THE_LIGHT,
  ...THE_SHADOW,
  ...STONE_FORTRESS,
  ...CULT_CLASSIC,
  ...BEST_OF_THE_BEST,
  ...RIVALRIES,
];
