// Hand-picked insert classes for Series 1. Players are referenced by ESPN id
// (the same id the base set uses). Flamin' Hot lives in nba-hot.ts (generated),
// and Courtside is the top 25 of the base set (see index.ts).
import type { ArrivalRow, ChampRow } from "./types";

/** Champs: active NBA Finals MVPs, with the years they won it. */
export const CHAMPS: ChampRow[] = [
  { id: "3934672", years: [2026] }, // Jalen Brunson
  { id: "4278073", years: [2025] }, // Shai Gilgeous-Alexander
  { id: "3917376", years: [2024] }, // Jaylen Brown
  { id: "3112335", years: [2023] }, // Nikola Jokic
  { id: "3975", years: [2022] }, // Stephen Curry
  { id: "3032977", years: [2021] }, // Giannis Antetokounmpo
  { id: "1966", years: [2012, 2013, 2016, 2020] }, // LeBron James
  { id: "6450", years: [2014, 2019] }, // Kawhi Leonard
  { id: "3202", years: [2017, 2018] }, // Kevin Durant
];

/** New Arrivals: notable trades of the 2026 offseason (ESPN trade tracker). `from` is the old team. */
export const ARRIVALS: ArrivalRow[] = [
  { id: "3032977", from: "MIL" }, // Giannis Antetokounmpo → Heat
  { id: "3917376", from: "BOS" }, // Jaylen Brown → 76ers
  { id: "6450", from: "LAC" }, // Kawhi Leonard → Raptors
  { id: "4432816", from: "CHA" }, // LaMelo Ball → Timberwolves
  { id: "4279888", from: "MEM" }, // Ja Morant → Trail Blazers
  { id: "4251", from: "PHI" }, // Paul George → Celtics
  { id: "3913176", from: "TOR" }, // Brandon Ingram → Clippers
  { id: "3064514", from: "MIN" }, // Julius Randle → Nets
  { id: "4395725", from: "MIA" }, // Tyler Herro → Bucks
  { id: "4066383", from: "CHA" }, // Miles Bridges → Suns
  { id: "4433136", from: "UTAH" }, // Walker Kessler → Lakers (sign-and-trade)
  { id: "4432848", from: "MIA" }, // Jaime Jaquez Jr. → Bucks
  { id: "4396971", from: "MIN" }, // Naz Reid → Hornets
  { id: "2991070", from: "POR" }, // Jerami Grant → Grizzlies
  { id: "4278067", from: "BKN" }, // Nic Claxton → Bulls
  { id: "3135045", from: "PHX" }, // Grayson Allen → Hornets
  { id: "4593125", from: "MEM" }, // Santi Aldama → Mavericks
];
