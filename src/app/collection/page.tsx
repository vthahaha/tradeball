import { redirect } from "next/navigation";
import { CollectionView, type OwnedCopy } from "@/components/CollectionView";
import { cardView, DESIGNS } from "@/lib/catalog";
import { db } from "@/lib/db";
import { hydrateInstance } from "@/lib/packs";
import { parseShowcase } from "@/lib/recycle";
import { getCurrentUser } from "@/lib/session";
import { ownersByDesign, wantersByDesign, wishlistOf } from "@/lib/trades";

export default async function CollectionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [instances, wishes, owners, wanters, inTrades] = await Promise.all([
    db.cardInstance.findMany({ where: { ownerId: user.id, recycledAt: null }, orderBy: { pulledAt: "desc" } }),
    wishlistOf(user.id),
    ownersByDesign(user.id),
    wantersByDesign(user.id),
    db.tradeItem.findMany({
      where: { trade: { status: "pending" }, instance: { ownerId: user.id } },
      select: { instanceId: true },
    }),
  ]);

  const copies: OwnedCopy[] = instances.flatMap((i) => {
    const card = hydrateInstance(i);
    if (!card) return [];
    return [
      {
        instanceId: i.id,
        designId: i.designId,
        finish: card.finish,
        serialNo: card.serialNo,
        supply: card.supply,
        grade: card.grade,
        pulledAt: i.pulledAt.toISOString(),
        pulledBy: i.pulledBy,
      },
    ];
  });

  return (
    <div>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">
        Your <span className="text-accent">binder</span>
      </h1>
      <CollectionView
        designs={DESIGNS.map((d) => cardView(d.id))}
        copies={copies}
        packsOpened={user.packsOpened}
        wishes={wishes}
        owners={owners}
        wanters={wanters}
        shards={user.shards}
        showcase={parseShowcase(user.showcase)}
        locked={inTrades.map((t) => t.instanceId)}
      />
    </div>
  );
}
