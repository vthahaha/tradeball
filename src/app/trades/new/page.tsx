import { redirect } from "next/navigation";
import { TradeBuilder } from "@/components/TradeBuilder";
import { db } from "@/lib/db";
import { hydrateInstance, type PulledCard } from "@/lib/packs";
import { getCurrentUser } from "@/lib/session";
import { getTrade, wishlistOf } from "@/lib/trades";

async function binder(ownerId: string): Promise<PulledCard[]> {
  const rows = await db.cardInstance.findMany({ where: { ownerId, recycledAt: null }, orderBy: { pulledAt: "desc" } });
  return rows.flatMap((r) => {
    const c = hydrateInstance(r);
    return c ? [c] : [];
  });
}

export default async function NewTradePage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; counter?: string; want?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/");
  const sp = await searchParams;

  let toName = sp.to?.toLowerCase();
  let preGive: string[] = [];
  let preGet: string[] = [];
  let counterOf: string | null = null;

  if (sp.counter) {
    const t = await getTrade(sp.counter);
    if (t && t.view.status === "pending" && t.toId === me.id) {
      counterOf = t.view.id;
      toName = t.view.from;
      // Start from their offer, flipped to my point of view.
      preGive = t.view.toCards.map((c) => c.instanceId);
      preGet = t.view.fromCards.map((c) => c.instanceId);
    }
  }

  const others = await db.user.findMany({
    where: { id: { not: me.id } },
    select: { username: true },
    orderBy: { username: "asc" },
  });
  const them = toName ? await db.user.findUnique({ where: { username: toName } }) : null;

  const [myCards, theirCards, myWishes, theirWishes] = await Promise.all([
    binder(me.id),
    them && them.id !== me.id ? binder(them.id) : Promise.resolve([]),
    wishlistOf(me.id),
    them ? wishlistOf(them.id) : Promise.resolve([]),
  ]);

  if (sp.want && them && preGet.length === 0) {
    const copy = theirCards.find((c) => c.designId === sp.want);
    if (copy) preGet = [copy.instanceId];
  }

  return (
    <div>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">
        {counterOf ? "Counter" : "New"} <span className="text-accent">trade</span>
      </h1>
      <TradeBuilder
        key={`${them?.username ?? ""}-${counterOf ?? ""}`}
        users={others.map((u) => u.username)}
        them={them && them.id !== me.id ? them.username : null}
        myCards={myCards}
        theirCards={theirCards}
        myWishes={myWishes}
        theirWishes={theirWishes}
        initialGive={preGive}
        initialGet={preGet}
        counterOf={counterOf}
      />
    </div>
  );
}
