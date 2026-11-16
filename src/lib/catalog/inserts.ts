// Series 1 insert classes, from "Insert Categories Set 1", "Set 2 - Classic", "Set 3" and "Set 4".
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
  { id: "goldenboy", name: "Golden Boy", rarity: "legendary", boost: 4 },
  { id: "generational", name: "Generational", rarity: "mythic", boost: 0 },
  { id: "stardom", name: "Ultimate Stardom", rarity: "mythic", boost: 3 },
  { id: "light", name: "The Light", rarity: "uncommon", boost: 3 },
  { id: "shadow", name: "The Shadow", rarity: "uncommon", boost: 3 },
  { id: "fortress", name: "Stone Fortress", rarity: "rare", boost: 3 },
  { id: "cult", name: "Cult Classic", rarity: "rare", boost: 0 },
  // Set 2, "Classic"
  { id: "botb", name: "Best of the Best", rarity: "legendary", boost: 3 },
  { id: "rivalries", name: "Rivalries", rarity: "legendary", boost: 2 },
  // Set 3
  { id: "flash", name: "Flash of Brilliance", rarity: "epic", boost: 2 },
  { id: "wizards", name: "Time Wizards", rarity: "rare", boost: 0 },
  { id: "founders", name: "Founding Father", rarity: "epic", boost: 0 },
  { id: "dreamteam", name: "The Dream Team", rarity: "mythic", boost: 0 },
  // Set 4
  { id: "lunar", name: "Lunar New Year", rarity: "epic", boost: 3 },
  { id: "dotd", name: "Day of the Dead", rarity: "epic", boost: 1 },
  { id: "thirdeye", name: "The Third Eye", rarity: "epic", boost: 3 },
  // Set 5
  { id: "passports", name: "Passports", rarity: "uncommon", boost: 2 },
  { id: "snipers", name: "Snipers", rarity: "uncommon", boost: 2 },
  { id: "dimers", name: "Dimers", rarity: "uncommon", boost: 2 },
  { id: "snatchers", name: "Snatchers", rarity: "uncommon", boost: 2 },
  // Set 6
  { id: "thanksgiving", name: "Thanksgiving", rarity: "epic", boost: 2 },
  { id: "sparkplug", name: "Spark Plug", rarity: "epic", boost: 2 },
  { id: "villains", name: "Supervillains", rarity: "rare", boost: 1 },
  { id: "circus", name: "The Circus", rarity: "epic", boost: 1 },
  // Grail
  { id: "iconic", name: "Iconic Moments", rarity: "grail", boost: 0 },
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
  { id: "HG1", team: "Kings", legend: L("Garrett Temple", "G", "USA", 78) },
  { id: "HG2", team: "Clippers", legend: L("Chris Paul", "G", "USA", 93) },
  { id: "HG3", team: "Raptors", legend: L("Kyle Lowry", "G", "USA", 88) },
  { id: "HG4", team: "Knicks", legend: L("Taj Gibson", "F", "USA", 80) },
  { id: "HG5", team: "Hornets", legend: L("Nicolas Batum", "F", "France", 82) },
  { id: "HG6", team: "Nets", legend: L("Isaiah Whitehead", "G", "USA", 74) },
  { id: "HG7", team: "Pacers", legend: L("Malcolm Brogdon", "G", "USA", 82) },
  { id: "HG8", team: "Nuggets", legend: L("Danilo Gallinari", "F", "Italy", 83) },
  { id: "HG9", team: "Rockets", legend: L("P.J. Tucker", "F", "USA", 79) },
  { id: "HG10", team: "Thunder", legend: L("Russell Westbrook", "G", "USA", 92) },
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
  { id: "US4", player: "3934672", ovr: 99 }, // Jalen Brunson, 2026 Finals MVP
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
  { id: "CC2", team: "Celtics", legend: L("Rajon Rondo", "G", "USA", 86) },
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

// B. Rivalries: two players, left to right as they stand in the chosen photo, each coloured
// by the jersey they wear in it
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
      team: "Lakers",
      player: "1966",
      team2: "Warriors",
      player2: "3975",
    }, // LeBron James & Stephen Curry
    {
      id: "RV4",
      team: "Mavericks",
      legend: L("Dirk Nowitzki", "F", "Germany", 95),
      team2: "Spurs",
      legend2: L("Tim Duncan", "F", "USA", 97),
    },
    {
      id: "RV5",
      team: "Rockets",
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
      team2: "Lakers",
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
      team: "Lakers",
      legend: L("Kobe Bryant", "G", "USA", 97),
      team2: "76ers",
      legend2: L("Allen Iverson", "G", "USA", 95),
    },
    {
      id: "RV10",
      team: "Cavaliers",
      legend: L("Shaquille O'Neal", "C", "USA", 98),
      team2: "Magic",
      legend2: L("Dwight Howard", "C", "USA", 92),
    },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "rivalries", note: "Rivalries" }));

// ── Set 3 ──

// 1. Flash of Brilliance: the flashiest players to do it, coloured by their signature team
const FLASH: InsertCard[] = (
  [
    { id: "FB1", team: "Kings", legend: L("Jason Williams", "G", "USA", 82) },
    { id: "FB2", team: "Hawks", legend: L("Pete Maravich", "G", "USA", 92) },
    { id: "FB3", team: "Raptors", legend: L("Vince Carter", "G", "USA", 91) },
    { id: "FB4", team: "Lakers", legend: L("Magic Johnson", "G", "USA", 98) },
    { id: "FB5", team: "76ers", legend: L("Allen Iverson", "G", "USA", 95) },
    { id: "FB6", team: "Warriors", player: "3975" }, // Stephen Curry
    { id: "FB7", team: "Mavericks", player: "6442" }, // Kyrie Irving
    { id: "FB8", team: "SuperSonics", legend: L("Shawn Kemp", "F", "USA", 89) },
    { id: "FB9", team: "Suns", legend: L("Steve Nash", "G", "Canada", 93) },
    { id: "FB10", team: "Heat", legend: L("Dwyane Wade", "G", "USA", 95) },
    {
      id: "FB11",
      team: "Spurs",
      legend: L("Manu Ginobili", "G", "Argentina", 89),
    },
    {
      id: "FB12",
      team: "Clippers",
      legend: L("Blake Griffin", "F", "USA", 88),
    },
    { id: "FB13", team: "Nuggets", player: "3112335" }, // Nikola Jokic
    { id: "FB14", team: "Knicks", legend: L("Jamal Crawford", "G", "USA", 83) },
    { id: "FB15", team: "Grizzlies", player: "4279888" }, // Ja Morant
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "flash" }));

// 2. Time Wizards: players who were ahead of their time
const TIME_WIZARDS: InsertCard[] = (
  [
    {
      id: "TW1",
      team: "Trail Blazers",
      legend: L("Arvydas Sabonis", "C", "Lithuania", 88),
    },
    {
      id: "TW2",
      team: "Jazz",
      legend: L("Andrei Kirilenko", "F", "Russia", 86),
    },
    { id: "TW3", team: "Heat", legend: L("Chris Bosh", "F", "USA", 89) },
    {
      id: "TW4",
      team: "Kings",
      legend: L("Peja Stojakovic", "F", "Serbia", 86),
    },
    { id: "TW5", team: "Suns", legend: L("Shawn Marion", "F", "USA", 88) },
    {
      id: "TW6",
      team: "Pistons",
      legend: L("Rasheed Wallace", "F", "USA", 87),
    },
    { id: "TW7", team: "Bulls", legend: L("Toni Kukoc", "F", "Croatia", 86) },
    { id: "TW8", team: "Lakers", legend: L("Lamar Odom", "F", "USA", 86) },
    { id: "TW9", team: "Braves", legend: L("Bob McAdoo", "C", "USA", 91) },
    { id: "TW10", team: "Mavericks", legend: L("Sam Perkins", "F", "USA", 82) },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "wizards" }));

// 3. Founding Father: the first icons of younger franchises, on draft night
// (kicker = the franchise's founding year, note = draft year, meta = pick number)
const FOUNDING_FATHERS: InsertCard[] = (
  [
    {
      id: "FF1",
      note: "1981",
      meta: "1",
      team: "Mavericks",
      kicker: "1980",
      legend: L("Mark Aguirre", "F", "USA", 87),
    },
    {
      id: "FF2",
      note: "1991",
      meta: "1",
      team: "Hornets",
      kicker: "1988",
      legend: L("Larry Johnson", "F", "USA", 86),
    },
    {
      id: "FF3",
      note: "1989",
      meta: "4",
      team: "Heat",
      kicker: "1988",
      legend: L("Glenn Rice", "F", "USA", 87),
    },
    {
      id: "FF4",
      note: "1995",
      meta: "5",
      team: "Timberwolves",
      kicker: "1989",
      legend: L("Kevin Garnett", "F", "USA", 96),
    },
    {
      id: "FF5",
      note: "1992",
      meta: "1",
      team: "Magic",
      kicker: "1989",
      legend: L("Shaquille O'Neal", "C", "USA", 98),
    },
    {
      id: "FF6",
      note: "1995",
      meta: "7",
      team: "Raptors",
      kicker: "1995",
      legend: L("Damon Stoudamire", "G", "USA", 84),
    },
    {
      id: "FF7",
      note: "1996",
      meta: "3",
      team: "Vancouver Grizzlies",
      kicker: "1995",
      legend: L("Shareef Abdur-Rahim", "F", "USA", 86),
    },
    {
      id: "FF8",
      note: "1999",
      meta: "3",
      team: "New Orleans Hornets",
      kicker: "2002",
      legend: L("Baron Davis", "G", "USA", 87),
    },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "founders" }));

// 4. The Dream Team: the 1992 Olympic roster, coloured by their club at the time
const DREAM_TEAM: InsertCard[] = (
  [
    { id: "DT1", team: "76ers", legend: L("Charles Barkley", "F", "USA", 95) },
    { id: "DT2", team: "Celtics", legend: L("Larry Bird", "F", "USA", 98) },
    {
      id: "DT3",
      team: "Trail Blazers",
      legend: L("Clyde Drexler", "G", "USA", 93),
    },
    { id: "DT4", team: "Knicks", legend: L("Patrick Ewing", "C", "USA", 93) },
    { id: "DT5", team: "Bulls", legend: L("Michael Jordan", "G", "USA", 99) },
    { id: "DT6", team: "Lakers", legend: L("Magic Johnson", "G", "USA", 98) },
    {
      id: "DT7",
      team: "Duke",
      legend: L("Christian Laettner", "F", "USA", 83),
    },
    { id: "DT8", team: "Jazz", legend: L("Karl Malone", "F", "USA", 95) },
    { id: "DT9", team: "Warriors", legend: L("Chris Mullin", "F", "USA", 90) },
    { id: "DT10", team: "Bulls", legend: L("Scottie Pippen", "F", "USA", 93) },
    { id: "DT11", team: "Spurs", legend: L("David Robinson", "C", "USA", 95) },
    { id: "DT12", team: "Jazz", legend: L("John Stockton", "G", "USA", 93) },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "dreamteam", kicker: "Barcelona 1992" }));

// ── Set 4 ──

// 1. Lunar New Year: one player for each animal of the zodiac (kicker = the animal)
const LUNAR_NEW_YEAR: InsertCard[] = (
  [
    { id: "LNY1", kicker: "Mouse", team: "Knicks", legend: L("Carmelo Anthony", "F", "USA", 92) },
    { id: "LNY2", kicker: "Ox", player: "4066259" }, // De'Aaron Fox
    { id: "LNY3", kicker: "Tiger", team: "Pistons", legend: L("Ben Wallace", "C", "USA", 88) },
    { id: "LNY4", kicker: "Cat", team: "Cavaliers", legend: L("Mark Price", "G", "USA", 87) },
    { id: "LNY5", kicker: "Dragon", player: "4396993" }, // Tyrese Haliburton
    { id: "LNY6", kicker: "Snake", team: "Celtics", legend: L("Isaiah Thomas", "G", "USA", 87) },
    { id: "LNY7", kicker: "Horse", team: "Mavericks", legend: L("Dirk Nowitzki", "F", "Germany", 96) },
    { id: "LNY8", kicker: "Goat", player: "4914336" }, // Shaedon Sharpe
    { id: "LNY9", kicker: "Monkey", team: "SuperSonics", legend: L("Gary Payton", "G", "USA", 93) },
    { id: "LNY10", kicker: "Chicken", team: "Wizards", player: "6580" }, // Bradley Beal
    { id: "LNY11", kicker: "Dog", team: "Heat", legend: L("Dwyane Wade", "G", "USA", 95) },
    { id: "LNY12", kicker: "Pig", team: "Magic", legend: L("Penny Hardaway", "G", "USA", 89) },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "lunar" }));

// 2. Day of the Dead
const DAY_OF_THE_DEAD: InsertCard[] = (
  [
    { id: "DD1", player: "5037871" }, // Dylan Harper
    { id: "DD2", player: "4871144" }, // Alperen Sengun
    { id: "DD3", player: "4432816" }, // LaMelo Ball
    { id: "DD4", player: "6430" }, // Jimmy Butler
    { id: "DD5", player: "3936299" }, // Jamal Murray
    { id: "DD6", player: "3136193" }, // Devin Booker
    { id: "DD7", player: "4066648" }, // Rui Hachimura
    { id: "DD8", player: "4066336" }, // Lauri Markkanen
    { id: "DD9", player: "3059318" }, // Joel Embiid
    { id: "DD10", player: "4701230" }, // Jalen Johnson
    { id: "DD11", player: "3136195" }, // Karl-Anthony Towns
    { id: "DD12", player: "4433134" }, // Scottie Barnes
    { id: "DD13", player: "3149673" }, // Pascal Siakam
    { id: "DD14", player: "5142718" }, // AJ Dybantsa
    { id: "DD15", player: "4871145" }, // Josh Giddey
    { id: "DD16", team: "Lakers", legend: L("James Worthy", "F", "USA", 92) },
    { id: "DD17", team: "Trail Blazers", legend: L("Clyde Drexler", "G", "USA", 93) },
    { id: "DD18", team: "Grizzlies", legend: L("Zach Randolph", "F", "USA", 87) },
    { id: "DD19", team: "Thunder", legend: L("Russell Westbrook", "G", "USA", 92) },
    { id: "DD20", team: "Mavericks", legend: L("Jason Kidd", "G", "USA", 94) },
    { id: "DD21", team: "New Orleans Hornets", legend: L("Baron Davis", "G", "USA", 87) },
    { id: "DD22", team: "Kings", legend: L("Oscar Robertson", "G", "USA", 97) },
    { id: "DD23", team: "Celtics", legend: L("Paul Pierce", "F", "USA", 93) },
    { id: "DD24", team: "Pistons", legend: L("Isiah Thomas", "G", "USA", 95) },
    { id: "DD25", team: "Heat", legend: L("Ray Allen", "G", "USA", 93) },
    { id: "DD26", team: "Cavaliers", legend: L("Anderson Varejão", "C", "Brazil", 80) },
    { id: "DD27", team: "Magic", legend: L("Dwight Howard", "C", "USA", 92) },
    { id: "DD28", team: "Hornets", legend: L("Alonzo Mourning", "C", "USA", 91) },
    { id: "DD29", team: "Nets", legend: L("Drazen Petrovic", "G", "Croatia", 87) },
    { id: "DD30", team: "Bucks", legend: L("Glenn Robinson", "F", "USA", 86) },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "dotd" }));

// 3. The Third Eye
const THIRD_EYE: InsertCard[] = (
  [
    { id: "TE1", player: "6442" }, // Kyrie Irving
    { id: "TE2", player: "4251" }, // Paul George
    { id: "TE3", player: "5175737" }, // Yaxel Lendeborg
    { id: "TE4", player: "4278053" }, // Davion Mitchell
    { id: "TE5", player: "4278104" }, // Michael Porter Jr.
    { id: "TE6", player: "2595516" }, // Norman Powell
    { id: "TE7", player: "5217746" }, // Yang Hansen
    { id: "TE8", player: "4432573" }, // Paolo Banchero
    { id: "TE9", player: "4395725" }, // Tyler Herro
    { id: "TE10", player: "5144091" }, // Jeremiah Fears
    { id: "TE11", player: "2530530" }, // T.J. McConnell
    { id: "TE12", player: "4593803" }, // Jalen Williams
    { id: "TE13", player: "4684742" }, // Ausar Thompson
    { id: "TE14", player: "3147657" }, // Mikal Bridges
    { id: "TE15", player: "4066457" }, // Austin Reaves
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "thirdeye" }));

// ── Set 5 ──

// 1. Passports: players from abroad (kicker = the ISO 3166 alpha-3 code, as on a passport)
const PASSPORTS: InsertCard[] = (
  [
    { id: "PA1", kicker: "FRA", player: "5104157" }, // Victor Wembanyama
    { id: "PA2", kicker: "SVN", player: "3945274" }, // Luka Doncic
    { id: "PA3", kicker: "SRB", player: "3112335" }, // Nikola Jokic
    { id: "PA4", kicker: "SWE", player: "4601025" }, // Pelle Larsson
    { id: "PA5", kicker: "ESP", player: "4593125" }, // Santi Aldama
    { id: "PA6", kicker: "DOM", player: "3213" }, // Al Horford
    { id: "PA7", kicker: "FIN", player: "4066336" }, // Lauri Markkanen
    { id: "PA8", kicker: "BHS", player: "5124612" }, // VJ Edgecombe
    { id: "PA9", kicker: "GEO", player: "4348700" }, // Goga Bitadze
    { id: "PA10", kicker: "DEU", player: "3032979", ovr: 95 }, // Dennis Schroder
    { id: "PA11", kicker: "LVA", player: "3102531" }, // Kristaps Porzingis
    { id: "PA12", kicker: "LTU", player: "3155942" }, // Domantas Sabonis
    { id: "PA13", kicker: "SEN", player: "4997530" }, // Khalifa Diop
    { id: "PA14", kicker: "BIH", player: "3102530" }, // Jusuf Nurkic
    { id: "PA15", kicker: "TUR", player: "4871144" }, // Alperen Sengun
    { id: "PA16", kicker: "HRV", player: "4997538" }, // Karlo Matkovic
    { id: "PA17", kicker: "COD", player: "4433247" }, // Jonathan Kuminga
    { id: "PA18", kicker: "CAN", player: "4278073" }, // Shai Gilgeous-Alexander
    { id: "PA19", kicker: "GRC", player: "3032977" }, // Giannis Antetokounmpo
    { id: "PA20", kicker: "SSD", player: "5203685" }, // Khaman Maluach
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "passports" }));

// 2-4. Snipers, Dimers, Snatchers: the shooters, passers and rebounders, one colour each
const SNIPERS: InsertCard[] = (
  [
    { id: "SN1", player: "4066320" }, // Desmond Bane
    { id: "SN2", player: "4065804" }, // Sam Hauser
    { id: "SN3", player: "2595516" }, // Norman Powell
    { id: "SN4", player: "3157465" }, // Duncan Robinson
    { id: "SN5", player: "5061575" }, // Kon Knueppel
    { id: "SN6", player: "3913174" }, // Luke Kennard
    { id: "SN7", player: "3202" }, // Kevin Durant
    { id: "SN8", player: "4683778" }, // Jared McCain
    { id: "SN9", player: "6606" }, // Damian Lillard
    { id: "SN10", player: "3975" }, // Stephen Curry
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "snipers" }));

const DIMERS: InsertCard[] = (
  [
    { id: "DI1", player: "4278053" }, // Davion Mitchell
    { id: "DI2", player: "4277905" }, // Trae Young
    { id: "DI3", player: "3992" }, // James Harden
    { id: "DI4", player: "4395725" }, // Tyler Herro
    { id: "DI5", player: "1966" }, // LeBron James
    { id: "DI6", player: "4065733" }, // Ty Jerome
    { id: "DI7", player: "4432816" }, // LaMelo Ball
    { id: "DI8", player: "5142620" }, // Darius Acuff Jr.
    { id: "DI9", player: "4066259" }, // De'Aaron Fox
    { id: "DI10", player: "4433627" }, // Keyonte George
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "dimers" }));

// ST, not SN as in the document: Snipers already use SN1-SN10 and card ids must be unique
const SNATCHERS: InsertCard[] = (
  [
    { id: "ST1", player: "4701230" }, // Jalen Johnson
    { id: "ST2", player: "4278104" }, // Michael Porter Jr.
    { id: "ST3", player: "4017837" }, // Ivica Zubac
    { id: "ST4", player: "3136195" }, // Karl-Anthony Towns
    { id: "ST5", player: "4433134" }, // Scottie Barnes
    { id: "ST6", player: "4278078" }, // P.J. Washington
    { id: "ST7", player: "3448" }, // Brook Lopez
    { id: "ST8", player: "4433136" }, // Walker Kessler
    { id: "ST9", player: "4869780" }, // Derik Queen
    { id: "ST10", player: "3112335" }, // Nikola Jokic
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "snatchers" }));

// ── Set 6 ──

// 1. Thanksgiving
const THANKSGIVING: InsertCard[] = (
  [
    { id: "TH1", player: "4845367" }, // Stephon Castle
    { id: "TH2", player: "4065648" }, // Jayson Tatum
    { id: "TH3", player: "4278039" }, // Nickeil Alexander-Walker
    { id: "TH4", player: "3908809" }, // Donovan Mitchell
    { id: "TH5", player: "5041955" }, // Darryn Peterson
    { id: "TH6", player: "4900671" }, // Ajay Mitchell
    { id: "TH7", player: "4566434" }, // Franz Wagner
    { id: "TH8", player: "3064440" }, // Zach LaVine
    { id: "TH9", team: "Suns", legend: L("Amar'e Stoudemire", "F", "USA", 90) },
    { id: "TH10", team: "Nets", legend: L("Kenyon Martin", "F", "USA", 84) },
    { id: "TH11", team: "Nuggets", legend: L("Antonio McDyess", "F", "USA", 84) },
    { id: "TH12", team: "Mavericks", legend: L("Rolando Blackman", "G", "USA", 86) },
    { id: "TH13", team: "Warriors", legend: L("Monta Ellis", "G", "USA", 85) },
    { id: "TH14", team: "Hornets", legend: L("Larry Johnson", "F", "USA", 86) },
    { id: "TH15", team: "Knicks", legend: L("Jeremy Lin", "G", "USA", 80) },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "thanksgiving" }));

// 2. Spark Plug: the instant offense off the bench
const SPARK_PLUG: InsertCard[] = (
  [
    { id: "SPL1", team: "Clippers", legend: L("Lou Williams", "G", "USA", 84) },
    { id: "SPL2", team: "Clippers", legend: L("Jamal Crawford", "G", "USA", 83) },
    { id: "SPL3", player: "4395723" }, // Keldon Johnson
    { id: "SPL4", player: "4066354" }, // Payton Pritchard
    { id: "SPL5", team: "Celtics", legend: L("Kevin McHale", "F", "USA", 92) },
    { id: "SPL6", team: "Pacers", legend: L("Detlef Schrempf", "F", "Germany", 86) },
    { id: "SPL7", team: "Bucks", legend: L("Ricky Pierce", "G", "USA", 83) },
    { id: "SPL8", team: "Rockets", legend: L("Eric Gordon", "G", "USA", 82) },
    { id: "SPL9", team: "Spurs", legend: L("Manu Ginobili", "G", "Argentina", 89) },
    { id: "SPL10", team: "Mavericks", legend: L("Jason Terry", "G", "USA", 84) },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "sparkplug" }));

// 3. Supervillains: the league's favourite people to boo
const SUPERVILLAINS: InsertCard[] = (
  [
    { id: "VI1", player: "6589" }, // Draymond Green
    { id: "VI2", player: "3155526" }, // Dillon Brooks
    { id: "VI3", team: "Pistons", legend: L("Bill Laimbeer", "C", "USA", 85) },
    { id: "VI4", team: "Timberwolves", legend: L("Christian Laettner", "F", "USA", 83) },
    { id: "VI5", team: "Rockets", legend: L("Vernon Maxwell", "G", "USA", 80) },
    { id: "VI6", team: "Pacers", legend: L("Stephen Jackson", "F", "USA", 82) },
    { id: "VI7", team: "Lakers", legend: L("Rick Fox", "F", "Canada", 80) },
    { id: "VI8", team: "Knicks", legend: L("J.R. Smith", "G", "USA", 81) },
    { id: "VI9", team: "Spurs", legend: L("Bruce Bowen", "F", "USA", 80) },
    { id: "VI10", team: "Bulls", legend: L("Dennis Rodman", "F", "USA", 89) },
    { id: "VI11", team: "Clippers", legend: L("Patrick Beverley", "G", "USA", 80) },
    { id: "VI12", team: "Kings", legend: L("Vlade Divac", "C", "Serbia", 86) },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "villains" }));

// 4. The Circus
const THE_CIRCUS: InsertCard[] = (
  [
    { id: "CI1", team: "Hawks", legend: L("Jeff Teague", "G", "USA", 82) },
    { id: "CI2", team: "Lakers", legend: L("Nick Young", "G", "USA", 78) },
    { id: "CI3", team: "Rockets", legend: L("Russell Westbrook", "G", "USA", 92) },
    { id: "CI4", player: "4278129" }, // Deandre Ayton
    { id: "CI5", team: "Warriors", legend: L("JaVale McGee", "C", "USA", 78) },
    { id: "CI6", player: "2991235" }, // Steven Adams
    { id: "CI7", team: "Celtics", legend: L("Brian Scalabrine", "F", "USA", 70) },
    { id: "CI8", player: "4432816" }, // LaMelo Ball
    { id: "CI9", player: "3032977" }, // Giannis Antetokounmpo
    { id: "CI10", team: "Bucks", legend: L("Robin Lopez", "C", "USA", 75) },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "circus" }));

// ── Grail ──

// Iconic Moments: the plays everyone has replayed (title = the moment, kicker = the date,
// meta = where it happened)
const ICONIC_MOMENTS: InsertCard[] = (
  [
    {
      id: "IM1",
      title: "The Last Shot",
      kicker: "June 14, 1998",
      meta: "Finals · Game 6 · at Utah",
      team: "Bulls",
      legend: L("Michael Jordan", "G", "USA", 99),
    },
    {
      id: "IM2",
      title: "The Block",
      kicker: "June 19, 2016",
      meta: "Finals · Game 7 · at Golden State",
      team: "Cavaliers",
      player: "1966",
    }, // LeBron James
    {
      id: "IM3",
      title: "The 38 Feet",
      kicker: "Feb 27, 2016",
      meta: "Overtime · at Oklahoma City",
      team: "Warriors",
      player: "3975",
    }, // Stephen Curry
    {
      id: "IM4",
      title: "The Stepover",
      kicker: "June 6, 2001",
      meta: "Finals · Game 1 · at Los Angeles",
      team: "76ers",
      legend: L("Allen Iverson", "G", "USA", 95),
    },
    {
      id: "IM5",
      title: "The 100th Point",
      kicker: "March 2, 1962",
      meta: "vs Knicks · Hershey, PA",
      team: "Philadelphia Warriors",
      legend: L("Wilt Chamberlain", "C", "USA", 98),
    },
  ] as Omit<InsertCard, "cls">[]
).map((c) => ({ ...c, cls: "iconic" }));

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
  ...FLASH,
  ...TIME_WIZARDS,
  ...FOUNDING_FATHERS,
  ...DREAM_TEAM,
  ...LUNAR_NEW_YEAR,
  ...DAY_OF_THE_DEAD,
  ...THIRD_EYE,
  ...PASSPORTS,
  ...SNIPERS,
  ...DIMERS,
  ...SNATCHERS,
  ...THANKSGIVING,
  ...SPARK_PLUG,
  ...SUPERVILLAINS,
  ...THE_CIRCUS,
  ...ICONIC_MOMENTS,
];
