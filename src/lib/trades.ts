import "server-only";
import type { Prisma } from "@prisma/client";
import { getDesign } from "./catalog";
import { db } from "./db";
import { hydrateInstance, type PulledCard } from "./packs";

export const MAX_PER_SIDE = 10;

export class TradeError extends Error {}

type Tx = Prisma.TransactionClient;

const uniq = (xs: unknown) => (Array.isArray(xs) ? [...new Set(xs.map(String))] : []);

async function assertOwned(tx: Tx, ids: string[], ownerId: string) {
  if (ids.length === 0) return true;
  const n = await tx.cardInstance.count({ where: { id: { in: ids }, ownerId, recycledAt: null } });
  return n === ids.length;
}

export async function createTrade(
  fromId: string,
  input: { to: string; give: unknown; get: unknown; message?: unknown; counterOf?: unknown },
) {
  const give = uniq(input.give);
  const get = uniq(input.get);
  const message = typeof input.message === "string" ? input.message.trim().slice(0, 200) || null : null;
  if (give.length + get.length === 0) throw new TradeError("Pick at least one card.");
  if (give.length > MAX_PER_SIDE || get.length > MAX_PER_SIDE) {
    throw new TradeError(`Max ${MAX_PER_SIDE} cards per side.`);
  }

  return db.$transaction(async (tx) => {
    const to = await tx.user.findUnique({ where: { username: String(input.to ?? "").toLowerCase() } });
    if (!to) throw new TradeError("That player doesn't exist.");
    if (to.id === fromId) throw new TradeError("You can't trade with yourself.");

    if (!(await assertOwned(tx, give, fromId))) throw new TradeError("You don't own some of those cards anymore.");
    if (!(await assertOwned(tx, get, to.id))) throw new TradeError(`@${to.username} doesn't own some of those cards anymore.`);

    let parentId: string | null = null;
    if (input.counterOf) {
      const parent = await tx.trade.findUnique({ where: { id: String(input.counterOf) } });
      if (!parent || parent.status !== "pending") throw new TradeError("That offer is no longer open.");
      if (parent.toId !== fromId || parent.fromId !== to.id) throw new TradeError("You can only counter offers sent to you.");
      await tx.trade.update({ where: { id: parent.id }, data: { status: "countered", resolvedAt: new Date() } });
      parentId = parent.id;
    }

    return tx.trade.create({
      data: {
        fromId,
        toId: to.id,
        message,
        parentId,
        items: {
          create: [
            ...give.map((instanceId) => ({ instanceId, side: "from" })),
            ...get.map((instanceId) => ({ instanceId, side: "to" })),
          ],
        },
      },
    });
  });
}

export type TradeAction = "accept" | "decline" | "cancel";

export async function actOnTrade(userId: string, tradeId: string, action: TradeAction) {
  // Ownership failures expire the trade; that write must survive, so it runs
  // outside the transaction that throws.
  let expired = false;
  const result = await db.$transaction(async (tx) => {
    const trade = await tx.trade.findUnique({ where: { id: tradeId }, include: { items: true } });
    if (!trade) throw new TradeError("Trade not found.");
    if (trade.status !== "pending") throw new TradeError(`This trade is already ${trade.status}.`);

    if (action === "cancel") {
      if (trade.fromId !== userId) throw new TradeError("Only the sender can cancel.");
      return tx.trade.update({ where: { id: trade.id }, data: { status: "cancelled", resolvedAt: new Date() } });
    }
    if (trade.toId !== userId) throw new TradeError("Only the recipient can do that.");
    if (action === "decline") {
      return tx.trade.update({ where: { id: trade.id }, data: { status: "declined", resolvedAt: new Date() } });
    }

    // Accept: both sides must still own every card, then swap atomically.
    const fromIds = trade.items.filter((i) => i.side === "from").map((i) => i.instanceId);
    const toIds = trade.items.filter((i) => i.side === "to").map((i) => i.instanceId);
    const ok = (await assertOwned(tx, fromIds, trade.fromId)) && (await assertOwned(tx, toIds, trade.toId));
    if (!ok) {
      expired = true;
      return null;
    }

    if (fromIds.length) {
      await tx.cardInstance.updateMany({ where: { id: { in: fromIds } }, data: { ownerId: trade.toId } });
    }
    if (toIds.length) {
      await tx.cardInstance.updateMany({ where: { id: { in: toIds } }, data: { ownerId: trade.fromId } });
    }
    const done = await tx.trade.update({ where: { id: trade.id }, data: { status: "accepted", resolvedAt: new Date() } });

    // Any other open offer that included these cards can't happen anymore.
    await tx.trade.updateMany({
      where: {
        status: "pending",
        id: { not: trade.id },
        items: { some: { instanceId: { in: [...fromIds, ...toIds] } } },
      },
      data: { status: "expired", resolvedAt: new Date() },
    });

    await tx.activity.create({
      data: {
        userId: trade.fromId,
        kind: "trade",
        payload: JSON.stringify({ tradeId: trade.id, toId: trade.toId, gave: fromIds.length, got: toIds.length }),
      },
    });
    return done;
  });

  if (expired) {
    await db.trade.update({ where: { id: tradeId }, data: { status: "expired", resolvedAt: new Date() } });
    throw new TradeError("Some of these cards changed hands, so this offer expired.");
  }
  return result;
}

// ── Views ─────────────────────────────────────────────────────

const tradeInclude = {
  from: { select: { id: true, username: true } },
  to: { select: { id: true, username: true } },
  items: { include: { instance: true } },
} satisfies Prisma.TradeInclude;

type TradeRow = Prisma.TradeGetPayload<{ include: typeof tradeInclude }>;

export interface TradeView {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  resolvedAt: string | null;
  isCounter: boolean;
  from: string;
  to: string;
  fromCards: PulledCard[];
  toCards: PulledCard[];
  /** Pending, but some card already left its owner's binder. */
  stale: boolean;
}

function toView(t: TradeRow): TradeView {
  const side = (s: string) =>
    t.items.filter((i) => i.side === s).flatMap((i) => {
      const c = hydrateInstance(i.instance);
      return c ? [c] : [];
    });
  const stale =
    t.status === "pending" &&
    t.items.some((i) => i.instance.recycledAt || i.instance.ownerId !== (i.side === "from" ? t.fromId : t.toId));
  return {
    id: t.id,
    status: t.status,
    message: t.message,
    createdAt: t.createdAt.toISOString(),
    resolvedAt: t.resolvedAt?.toISOString() ?? null,
    isCounter: !!t.parentId,
    from: t.from.username,
    to: t.to.username,
    fromCards: side("from"),
    toCards: side("to"),
    stale,
  };
}

export async function tradesFor(userId: string) {
  const [incoming, outgoing, history, league] = await Promise.all([
    db.trade.findMany({ where: { toId: userId, status: "pending" }, include: tradeInclude, orderBy: { createdAt: "desc" } }),
    db.trade.findMany({ where: { fromId: userId, status: "pending" }, include: tradeInclude, orderBy: { createdAt: "desc" } }),
    db.trade.findMany({
      where: { OR: [{ fromId: userId }, { toId: userId }], status: { not: "pending" } },
      include: tradeInclude,
      orderBy: { resolvedAt: "desc" },
      take: 30,
    }),
    db.trade.findMany({ where: { status: "accepted" }, include: tradeInclude, orderBy: { resolvedAt: "desc" }, take: 12 }),
  ]);
  return {
    incoming: incoming.map(toView),
    outgoing: outgoing.map(toView),
    history: history.map(toView),
    league: league.map(toView),
  };
}

export async function getTrade(id: string) {
  const t = await db.trade.findUnique({ where: { id }, include: tradeInclude });
  return t ? { view: toView(t), fromId: t.fromId, toId: t.toId } : null;
}

export async function pendingIncomingCount(userId: string) {
  return db.trade.count({ where: { toId: userId, status: "pending" } });
}

// ── Wishlist ──────────────────────────────────────────────────

export async function setWish(userId: string, designId: string, on: boolean) {
  if (!getDesign(designId)) throw new TradeError("Unknown card.");
  if (on) {
    await db.wish.upsert({
      where: { userId_designId: { userId, designId } },
      create: { userId, designId },
      update: {},
    });
  } else {
    await db.wish.deleteMany({ where: { userId, designId } });
  }
}

export async function wishlistOf(userId: string) {
  const rows = await db.wish.findMany({ where: { userId }, select: { designId: true } });
  return rows.map((r) => r.designId);
}

/** designId → usernames (other than me) who own at least one copy. */
export async function ownersByDesign(excludeUserId: string) {
  const rows = await db.cardInstance.groupBy({
    by: ["designId", "ownerId"],
    where: { ownerId: { not: excludeUserId }, recycledAt: null },
  });
  const users = await db.user.findMany({ select: { id: true, username: true } });
  const name = new Map(users.map((u) => [u.id, u.username]));
  const out: Record<string, string[]> = {};
  for (const r of rows) (out[r.designId] ??= []).push(name.get(r.ownerId) ?? "?");
  return out;
}

/** designId → usernames (other than me) who want it. */
export async function wantersByDesign(excludeUserId: string) {
  const rows = await db.wish.findMany({
    where: { userId: { not: excludeUserId } },
    include: { user: { select: { username: true } } },
  });
  const out: Record<string, string[]> = {};
  for (const r of rows) (out[r.designId] ??= []).push(r.user.username);
  return out;
}
