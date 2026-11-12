import "server-only";
import { db } from "./db";

/**
 * Relaunch wipe: deletes every card, trade, wishlist and activity row, resets
 * collection counters, and gives everyone a full wallet plus 3 bonus tickets.
 * Player accounts are kept. Same logic as scripts/wipe-collections.mjs.
 */
export async function wipeCollections() {
  const count = async () => ({
    users: await db.user.count(),
    cards: await db.cardInstance.count(),
    trades: await db.trade.count(),
    wishes: await db.wish.count(),
    activity: await db.activity.count(),
  });
  const before = await count();
  await db.$transaction([
    db.tradeItem.deleteMany(),
    db.trade.deleteMany(),
    db.wish.deleteMany(),
    db.activity.deleteMany(),
    db.cardInstance.deleteMany(),
    db.user.updateMany({
      data: {
        packs: 3,
        packClock: new Date(),
        bonusPacks: 3,
        lastDailyAt: null,
        pityCounter: 0,
        packsOpened: 0,
        shards: 0,
        showcase: "[]",
      },
    }),
  ]);
  return { before, after: await count() };
}
