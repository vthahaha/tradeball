import "server-only";
import type { User } from "@prisma/client";
import {
  cardView,
  getDesign,
  INSERT_POOLS,
  POOLS,
  RARITIES,
  type CardView,
  type Finish,
  type InsertType,
  type Rarity,
  type Sport,
} from "./catalog";
import { isAdmin } from "./admin";
import { db } from "./db";
import {
  CARDS_PER_PACK,
  INSERTS_PER_PACK,
  cooldownMs,
  FINISH_SUPPLY,
  GUARANTEED_WEIGHTS,
  INSERT_CLASS_WEIGHTS,
  MAX_BANKED_PACKS,
  PITY_LIMIT,
  PITY_WEIGHTS,
  RARITY_WEIGHTS,
  rollFinish,
  rollGrade,
  weightedPick,
} from "./odds";

export const PACK_TYPES = {
  basketball: { name: "Hoops Pack", sports: ["basketball"] as Sport[] },
  soccer: { name: "Champions Pack", sports: ["soccer"] as Sport[] },
  football: { name: "Gridiron Pack", sports: ["football"] as Sport[] },
  baseball: { name: "Diamond Pack", sports: ["baseball"] as Sport[] },
  hockey: { name: "Faceoff Pack", sports: ["hockey"] as Sport[] },
  esports: { name: "Nexus Pack", sports: ["esports"] as Sport[] },
};
export type PackType = keyof typeof PACK_TYPES;

// ── Pack timer ────────────────────────────────────────────────

export function timedPacks(user: Pick<User, "packs" | "packClock">, now = Date.now()) {
  const cd = cooldownMs();
  const clock = user.packClock.getTime();
  const earned = Math.max(0, Math.floor((now - clock) / cd));
  const available = Math.min(MAX_BANKED_PACKS, user.packs + earned);
  if (available >= MAX_BANKED_PACKS) {
    // Full bank: the clock is paused; it restarts from "now" when one is spent.
    return { available, nextAt: null as number | null, clockIfSpent: now };
  }
  const newClock = clock + earned * cd;
  return { available, nextAt: newClock + cd, clockIfSpent: newClock };
}

export function isDailyClaimable(user: Pick<User, "lastDailyAt">, now = new Date()) {
  if (!user.lastDailyAt) return true;
  return user.lastDailyAt.toDateString() !== now.toDateString();
}

export function packStatus(user: User) {
  const t = timedPacks(user);
  return {
    unlimited: isAdmin(user.username),
    timed: t.available,
    bonus: user.bonusPacks,
    total: t.available + user.bonusPacks,
    max: MAX_BANKED_PACKS,
    nextAt: t.nextAt,
    dailyClaimable: isDailyClaimable(user),
    pity: user.pityCounter,
    pityLimit: PITY_LIMIT,
  };
}
export type PackStatus = ReturnType<typeof packStatus>;

// ── Rolling ───────────────────────────────────────────────────

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function rollDesign(sport: Sport, weights: Partial<Record<Rarity, number>>) {
  let rarity = weightedPick(weights) as Rarity;
  // A tier with no cards yet (Series 1 has no Mythics) falls back to the next tier down.
  while (POOLS[sport][rarity].length === 0 && RARITIES.indexOf(rarity) > 0) {
    rarity = RARITIES[RARITIES.indexOf(rarity) - 1];
  }
  return pick(POOLS[sport][rarity]);
}

/** The insert slot. A sport with no insert classes yet (soccer) rolls a normal card instead. */
function rollInsert(sport: Sport) {
  const classes = (Object.keys(INSERT_CLASS_WEIGHTS) as InsertType[]).filter((c) => INSERT_POOLS[c]?.[0]?.sport === sport);
  if (classes.length === 0) return rollDesign(sport, RARITY_WEIGHTS);
  const cls = weightedPick(classes.map((c) => [c, INSERT_CLASS_WEIGHTS[c] ?? 0] as [InsertType, number])) as InsertType;
  return pick(INSERT_POOLS[cls]);
}

const isLegendaryPlus = (r: Rarity) => RARITIES.indexOf(r) >= RARITIES.indexOf("legendary");

export interface PulledCard extends CardView {
  instanceId: string;
  finish: Finish;
  serialNo: number | null;
  supply: number | null;
  grade: number;
  /** True when this pull is the first copy of the card in the owner's binder. */
  isNew?: boolean;
}

export class PackError extends Error {}

export async function openPack(userId: string, type: PackType): Promise<{ cards: PulledCard[] }> {
  const pack = PACK_TYPES[type];
  if (!pack) throw new PackError("Unknown pack type");

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const t = timedPacks(user);

    // Spend a timed pack first (keeps the timer running), then bonus packs.
    // Admins open packs without spending anything.
    let userUpdate: { packs?: number; packClock?: Date; bonusPacks?: number };
    if (isAdmin(user.username)) {
      userUpdate = {};
    } else if (t.available > 0) {
      userUpdate = { packs: t.available - 1, packClock: new Date(t.clockIfSpent) };
    } else if (user.bonusPacks > 0) {
      userUpdate = { bonusPacks: user.bonusPacks - 1 };
    } else {
      throw new PackError("No packs left. The next one is on its way.");
    }

    // Decide which sport each slot uses.
    const sports: Sport[] =
      pack.sports.length === 1
        ? Array(CARDS_PER_PACK).fill(pack.sports[0])
        : Array.from({ length: CARDS_PER_PACK }, (_, i) => pack.sports[i % 2]);

    const pityHit = user.pityCounter >= PITY_LIMIT - 1;
    // Slots: 1..n-2 normal base/rookie rolls, n-1 guaranteed Rare+ (pity applies), n = insert.
    const designs = sports.map((sport, i) => {
      if (i >= CARDS_PER_PACK - INSERTS_PER_PACK) return rollInsert(sport);
      if (i === CARDS_PER_PACK - INSERTS_PER_PACK - 1) return rollDesign(pick(pack.sports), pityHit ? PITY_WEIGHTS : GUARANTEED_WEIGHTS);
      return rollDesign(sport, RARITY_WEIGHTS);
    });

    // Which of these cards does the player already own? Anything else is NEW
    // (only the first copy if the same new card comes twice in one pack).
    const owned = new Set(
      (
        await tx.cardInstance.findMany({
          where: { ownerId: user.id, recycledAt: null, designId: { in: designs.map((d) => d.id) } },
          select: { designId: true },
          distinct: ["designId"],
        })
      ).map((c) => c.designId),
    );

    const cards: PulledCard[] = [];
    for (const design of designs) {
      const isNew = !owned.has(design.id);
      owned.add(design.id);
      let finish = rollFinish();
      let serialNo: number | null = null;
      const supply = FINISH_SUPPLY[finish] ?? null;
      if (supply) {
        const minted = await tx.cardInstance.count({ where: { designId: design.id, finish } });
        if (minted >= supply) finish = "holo"; // sold out → still shiny
        else serialNo = minted + 1;
      }
      const grade = rollGrade();
      const inst = await tx.cardInstance.create({
        data: { designId: design.id, ownerId: user.id, finish, serialNo, grade, pulledBy: user.username },
      });
      cards.push({
        ...cardView(design.id),
        instanceId: inst.id,
        finish,
        serialNo,
        supply: serialNo ? (FINISH_SUPPLY[finish] ?? null) : null,
        grade,
        isNew,
      });
    }

    // Reveal order: rarest last, for drama.
    cards.sort((a, b) => RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity));

    const gotLegendary = cards.some((c) => isLegendaryPlus(c.rarity));
    await tx.user.update({
      where: { id: user.id },
      data: {
        ...userUpdate,
        pityCounter: gotLegendary ? 0 : user.pityCounter + 1,
        packsOpened: { increment: 1 },
      },
    });

    const notable = cards.filter((c) => isLegendaryPlus(c.rarity) || c.serialNo !== null || c.grade === 10);
    for (const c of notable) {
      await tx.activity.create({
        data: {
          userId: user.id,
          kind: "pull",
          payload: JSON.stringify({
            designId: c.designId,
            finish: c.finish,
            serialNo: c.serialNo,
            supply: c.supply,
            grade: c.grade,
            pack: type,
          }),
        },
      });
    }

    return { cards };
  });
}

export async function claimDaily(userId: string) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (!isDailyClaimable(user)) throw new PackError("Daily pack already claimed. Come back tomorrow.");
    return tx.user.update({
      where: { id: userId },
      data: { bonusPacks: { increment: 1 }, lastDailyAt: new Date() },
    });
  });
}

export function hydrateInstance(inst: {
  id: string;
  designId: string;
  finish: string;
  serialNo: number | null;
  grade: number;
}): PulledCard | null {
  if (!getDesign(inst.designId)) return null; // design removed from catalog
  const finish = inst.finish as Finish;
  return {
    ...cardView(inst.designId),
    instanceId: inst.id,
    finish,
    serialNo: inst.serialNo,
    supply: inst.serialNo ? (FINISH_SUPPLY[finish] ?? null) : null,
    grade: inst.grade,
  };
}
