import "server-only";
import { getDesign, RARITIES, type Finish, type Rarity } from "./catalog";
import { db } from "./db";
import { NUMBERED_FINISHES as NUMBERED, SHARDS_PER_PACK, shardValueFor } from "./odds";

const FINISH_RANK: Record<Finish, number> = { standard: 0, foil: 1, holo: 2, gold: 3, black: 4, masterpiece: 5 };

export class RecycleError extends Error {}

export function shardValue(designId: string, finish: Finish) {
  const d = getDesign(designId);
  return d ? shardValueFor(d.rarity, finish) : 0;
}

export function parseShowcase(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String).slice(0, 5) : [];
  } catch {
    return [];
  }
}

/** Cards that can never be recycled right now: numbered, in an open trade, or showcased. */
async function lockedIds(userId: string, showcase: string[]) {
  const pending = await db.tradeItem.findMany({
    where: { trade: { status: "pending" }, instance: { ownerId: userId } },
    select: { instanceId: true },
  });
  return new Set([...pending.map((p) => p.instanceId), ...showcase]);
}

/**
 * Plan which copies "Recycle extras" would take: keep the best copy of every
 * card, recycle the rest up to `maxRarity`.
 */
export async function planExtras(userId: string, maxRarity: Rarity) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const locked = await lockedIds(userId, parseShowcase(user.showcase));
  const cap = RARITIES.indexOf(maxRarity);
  const owned = await db.cardInstance.findMany({ where: { ownerId: userId, recycledAt: null } });

  const byDesign = new Map<string, typeof owned>();
  for (const c of owned) byDesign.set(c.designId, [...(byDesign.get(c.designId) ?? []), c]);

  const picks: { id: string; shards: number }[] = [];
  for (const [designId, copies] of byDesign) {
    const d = getDesign(designId);
    if (!d || copies.length < 2 || RARITIES.indexOf(d.rarity) > cap) continue;
    const sorted = [...copies].sort(
      (a, b) => FINISH_RANK[b.finish as Finish] - FINISH_RANK[a.finish as Finish] || b.grade - a.grade,
    );
    for (const c of sorted.slice(1)) {
      if (locked.has(c.id) || NUMBERED.includes(c.finish as Finish)) continue;
      picks.push({ id: c.id, shards: shardValue(designId, c.finish as Finish) });
    }
  }
  const shards = picks.reduce((s, p) => s + p.shards, 0);
  return { ids: picks.map((p) => p.id), cards: picks.length, shards, current: user.shards };
}

/** Recycle specific copies. Always keeps at least one copy of each card. */
export async function recycle(userId: string, ids: string[]) {
  const unique = [...new Set(ids.map(String))];
  if (unique.length === 0) throw new RecycleError("Nothing to recycle.");

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const showcase = parseShowcase(user.showcase);
    const cards = await tx.cardInstance.findMany({ where: { id: { in: unique }, ownerId: userId, recycledAt: null } });
    if (cards.length !== unique.length) throw new RecycleError("Some of those cards aren't yours anymore.");

    const pending = await tx.tradeItem.count({ where: { instanceId: { in: unique }, trade: { status: "pending" } } });
    if (pending > 0) throw new RecycleError("Some of those cards are in an open trade. Cancel it first.");
    if (cards.some((c) => NUMBERED.includes(c.finish as Finish))) {
      throw new RecycleError("Numbered cards (Gold, Black, 1/1) can't be recycled.");
    }
    if (cards.some((c) => showcase.includes(c.id))) throw new RecycleError("Take it out of your showcase first.");

    // Keep at least one copy of every card.
    const designIds = [...new Set(cards.map((c) => c.designId))];
    const counts = await tx.cardInstance.groupBy({
      by: ["designId"],
      where: { ownerId: userId, recycledAt: null, designId: { in: designIds } },
      _count: true,
    });
    for (const row of counts) {
      const removing = cards.filter((c) => c.designId === row.designId).length;
      if (row._count - removing < 1) throw new RecycleError("You can only recycle duplicates. Keep at least one copy.");
    }

    const gained = cards.reduce((s, c) => s + shardValue(c.designId, c.finish as Finish), 0);
    const total = user.shards + gained;
    const packs = Math.floor(total / SHARDS_PER_PACK);

    await tx.cardInstance.updateMany({ where: { id: { in: unique } }, data: { recycledAt: new Date() } });
    const updated = await tx.user.update({
      where: { id: userId },
      data: { shards: total % SHARDS_PER_PACK, bonusPacks: { increment: packs } },
    });
    return { recycled: cards.length, gained, packsEarned: packs, shards: updated.shards };
  });
}
