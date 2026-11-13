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

/**
 * Deletes every card one player owns (recycled ones too), the trades those cards
 * were part of, and their pull activity; resets their binder counters.
 * Their tickets, wishlist and account stay. Other players are not touched.
 */
export async function wipeUserCards(userId: string) {
  const mine = await db.cardInstance.findMany({ where: { ownerId: userId }, select: { id: true } });
  const ids = mine.map((c) => c.id);
  const trades = await db.trade.findMany({
    where: { items: { some: { instanceId: { in: ids } } } },
    select: { id: true },
  });
  await db.$transaction([
    db.trade.deleteMany({ where: { id: { in: trades.map((t) => t.id) } } }), // trade items cascade
    db.cardInstance.deleteMany({ where: { id: { in: ids } } }),
    db.activity.deleteMany({ where: { userId, kind: "pull" } }),
    db.user.update({
      where: { id: userId },
      data: { showcase: "[]", shards: 0, pityCounter: 0, packsOpened: 0 },
    }),
  ]);
  return { cards: ids.length, trades: trades.length };
}
