import "server-only";
import { cardView, DESIGNS, getDesign, SPORTS, type Finish, type Sport } from "./catalog";
import { db } from "./db";
import { FINISH_SUPPLY } from "./odds";
import { hydrateInstance, type PulledCard } from "./packs";
import { parseShowcase } from "./recycle";

export const SHOWCASE_MAX = 5;

export class ProfileError extends Error {}

export async function toggleShowcase(userId: string, instanceId: string, on: boolean) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    let list = parseShowcase(user.showcase);
    // Drop cards that were traded away or recycled.
    const live = await tx.cardInstance.findMany({
      where: { id: { in: [...list, instanceId] }, ownerId: userId, recycledAt: null },
      select: { id: true },
    });
    const liveIds = new Set(live.map((c) => c.id));
    list = list.filter((id) => liveIds.has(id));
    if (on) {
      if (!liveIds.has(instanceId)) throw new ProfileError("That card isn't yours.");
      if (!list.includes(instanceId)) {
        if (list.length >= SHOWCASE_MAX) throw new ProfileError(`Your showcase holds ${SHOWCASE_MAX} cards. Remove one first.`);
        list.push(instanceId);
      }
    } else {
      list = list.filter((id) => id !== instanceId);
    }
    await tx.user.update({ where: { id: userId }, data: { showcase: JSON.stringify(list) } });
    return list;
  });
}

export async function showcaseCards(user: { id: string; showcase: string }): Promise<PulledCard[]> {
  const ids = parseShowcase(user.showcase);
  if (ids.length === 0) return [];
  const rows = await db.cardInstance.findMany({ where: { id: { in: ids }, ownerId: user.id, recycledAt: null } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.flatMap((id) => {
    const r = byId.get(id);
    const c = r && hydrateInstance(r);
    return c ? [c] : [];
  });
}

const TOTAL = Object.fromEntries(SPORTS.map((s) => [s, DESIGNS.filter((d) => d.sport === s).length])) as Record<Sport, number>;

export async function userStats(userId: string) {
  const [designs, cards, trades] = await Promise.all([
    db.cardInstance.groupBy({ by: ["designId"], where: { ownerId: userId, recycledAt: null } }),
    db.cardInstance.count({ where: { ownerId: userId, recycledAt: null } }),
    db.trade.count({ where: { status: "accepted", OR: [{ fromId: userId }, { toId: userId }] } }),
  ]);
  const owned = Object.fromEntries(SPORTS.map((s) => [s, 0])) as Record<Sport, number>;
  for (const d of designs) {
    const design = getDesign(d.designId);
    if (design) owned[design.sport]++;
  }
  const unique = SPORTS.reduce((n, s) => n + owned[s], 0);
  return {
    cards,
    unique,
    completion: Math.round((unique / DESIGNS.length) * 100),
    basketball: { owned: owned.basketball, total: TOTAL.basketball },
    soccer: { owned: owned.soccer, total: TOTAL.soccer },
    football: { owned: owned.football, total: TOTAL.football },
    trades,
  };
}

export async function bestCards(userId: string, take = 5): Promise<PulledCard[]> {
  // "Best" = numbered first, then rarity, then rating. Done in memory: binders are small.
  const rows = await db.cardInstance.findMany({ where: { ownerId: userId, recycledAt: null } });
  const rank = (f: string) => ({ masterpiece: 5, black: 4, gold: 3, holo: 2, foil: 1 })[f] ?? 0;
  const order = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "grail"];
  return rows
    .flatMap((r) => {
      const c = hydrateInstance(r);
      return c ? [c] : [];
    })
    .sort((a, b) => order.indexOf(b.rarity) - order.indexOf(a.rarity) || rank(b.finish) - rank(a.finish) || b.ovr - a.ovr)
    .slice(0, take);
}

// ── Activity feed ─────────────────────────────────────────────

export type FeedItem =
  | { id: string; at: string; kind: "pull"; who: string; card: PulledCard }
  | { id: string; at: string; kind: "trade"; who: string; withUser: string; gave: number; got: number }
  | { id: string; at: string; kind: "join"; who: string };

export async function feed(opts: { userId?: string; take?: number } = {}): Promise<FeedItem[]> {
  const rows = await db.activity.findMany({
    where: opts.userId ? { userId: opts.userId } : {},
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 30,
    include: { user: { select: { username: true } } },
  });
  const users = await db.user.findMany({ select: { id: true, username: true } });
  const name = new Map(users.map((u) => [u.id, u.username]));

  return rows.flatMap((a): FeedItem[] => {
    const base = { id: a.id, at: a.createdAt.toISOString(), who: a.user.username };
    const p = JSON.parse(a.payload);
    if (a.kind === "pull") {
      if (!getDesign(p.designId)) return [];
      const finish = p.finish as Finish;
      return [
        {
          ...base,
          kind: "pull",
          card: {
            ...cardView(p.designId),
            instanceId: a.id,
            finish,
            serialNo: p.serialNo ?? null,
            supply: p.serialNo ? (FINISH_SUPPLY[finish] ?? null) : null,
            grade: p.grade,
          },
        },
      ];
    }
    if (a.kind === "trade") return [{ ...base, kind: "trade", withUser: name.get(p.toId) ?? "?", gave: p.gave, got: p.got }];
    if (a.kind === "join") return [{ ...base, kind: "join" }];
    return [];
  });
}
