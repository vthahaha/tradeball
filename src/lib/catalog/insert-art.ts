// Splash art for insert cards, keyed by card design id. Until an entry exists,
// the card shows the player's initials on its insert background.
//
// Add an image by URL or by a file in /public, e.g.
//   "nba-3934672-champs": "/art/brunson-champs.webp",
//   "nba-4278073-hot": "https://example.com/sga.png",
// Design ids: nba-<espnId>-champs | -courtside | -hot | -arrival
// (the full list is at /admin, or search nba.ts / inserts.ts for the ESPN id).
export const INSERT_ART: Record<string, string> = {};
