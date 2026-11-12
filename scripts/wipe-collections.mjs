// Relaunch wipe: deletes every card, trade, wishlist and activity row, resets
// collection counters, and gives everyone a full wallet plus 3 bonus tickets.
// Player accounts (usernames, Google links) are kept.
//
// Usage: DATABASE_URL=... DATABASE_URL_UNPOOLED=... node scripts/wipe-collections.mjs --yes
import { PrismaClient } from "@prisma/client";

if (!process.argv.includes("--yes")) {
  console.error("This permanently deletes all collections. Re-run with --yes to confirm.");
  process.exit(1);
}

const db = new PrismaClient();
const host = (process.env.DATABASE_URL ?? "").replace(/^.*@/, "").replace(/[/?].*$/, "");
console.log("database:", host || "(unknown)");

const before = {
  users: await db.user.count(),
  cards: await db.cardInstance.count(),
  trades: await db.trade.count(),
  wishes: await db.wish.count(),
  activity: await db.activity.count(),
};
console.log("before:", before);

const now = new Date();
await db.$transaction([
  db.tradeItem.deleteMany(),
  db.trade.deleteMany(),
  db.wish.deleteMany(),
  db.activity.deleteMany(),
  db.cardInstance.deleteMany(),
  db.user.updateMany({
    data: {
      packs: 3,
      packClock: now,
      bonusPacks: 3,
      lastDailyAt: null,
      pityCounter: 0,
      packsOpened: 0,
      shards: 0,
      showcase: "[]",
    },
  }),
]);

console.log("after:", {
  users: await db.user.count(),
  cards: await db.cardInstance.count(),
  trades: await db.trade.count(),
  wishes: await db.wish.count(),
  activity: await db.activity.count(),
});
await db.$disconnect();
