import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Feed } from "@/components/Feed";
import { db } from "@/lib/db";
import { RARITIES } from "@/lib/catalog/types";
import { hydrateInstance, type PulledCard } from "@/lib/packs";
import { bestCards, feed, showcaseCards, userStats } from "@/lib/profile";
import { wishlistOf } from "@/lib/trades";
import { getCurrentUser } from "@/lib/session";
import { InspectableCard } from "@/components/CardViewer";

const FINISH_ORDER = ["standard", "foil", "holo", "gold", "black", "masterpiece"];

async function holdings(ownerId: string): Promise<PulledCard[]> {
  const rows = await db.cardInstance.findMany({ where: { ownerId, recycledAt: null } });
  return rows.flatMap((r) => {
    const c = hydrateInstance(r);
    return c ? [c] : [];
  });
}

/** One copy per design (the best finish), with how many copies of it there are. */
function byDesign(cards: PulledCard[]) {
  const m = new Map<string, { card: PulledCard; n: number }>();
  for (const c of cards) {
    const cur = m.get(c.designId);
    if (!cur) m.set(c.designId, { card: c, n: 1 });
    else {
      cur.n++;
      if (FINISH_ORDER.indexOf(c.finish) > FINISH_ORDER.indexOf(cur.card.finish)) cur.card = c;
    }
  }
  return m;
}

/** What two binders could swap: their cards I lack (my wishes first, rarest next) and mine they
 *  lack (their wishes first, then my duplicates, rarest next). */
async function swapMatch(meId: string, themId: string) {
  const [mine, theirs, myWish, theirWish] = await Promise.all([
    holdings(meId),
    holdings(themId),
    wishlistOf(meId),
    wishlistOf(themId),
  ]);
  const a = byDesign(mine);
  const b = byDesign(theirs);
  const rank = (c: PulledCard) => RARITIES.indexOf(c.rarity) * 100 + c.ovr;
  const myW = new Set(myWish);
  const theirW = new Set(theirWish);
  const get = [...b.values()]
    .filter((x) => !a.has(x.card.designId))
    .sort((x, y) => Number(myW.has(y.card.designId)) - Number(myW.has(x.card.designId)) || rank(y.card) - rank(x.card))
    .map((x) => ({ card: x.card, wished: myW.has(x.card.designId) }));
  const give = [...a.values()]
    .filter((x) => !b.has(x.card.designId))
    .sort(
      (x, y) =>
        Number(theirW.has(y.card.designId)) - Number(theirW.has(x.card.designId)) ||
        Number(y.n > 1) - Number(x.n > 1) ||
        rank(y.card) - rank(x.card),
    )
    .map((x) => ({ card: x.card, wished: theirW.has(x.card.designId), spare: x.n > 1 }));
  return { get, give };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const me = await getCurrentUser();
  if (!me) redirect("/");
  const { username } = await params;
  const user = await db.user.findUnique({ where: { username: decodeURIComponent(username).toLowerCase() } });
  if (!user) notFound();

  const isMe = user.id === me.id;
  const [stats, pinned, items] = await Promise.all([
    userStats(user.id),
    showcaseCards(user),
    feed({ userId: user.id, take: 15 }),
  ]);
  const shown = pinned.length > 0 ? pinned : await bestCards(user.id);
  const match = isMe ? null : await swapMatch(me.id, user.id);
  const swapHref = match
    ? `/trades/new?to=${encodeURIComponent(user.username)}&want=${match.get
        .slice(0, 3)
        .map((x) => encodeURIComponent(x.card.designId))
        .join(",")}&give=${match.give
        .slice(0, 3)
        .map((x) => encodeURIComponent(x.card.designId))
        .join(",")}`
    : "";

  const statTiles = [
    { label: "Cards", value: stats.cards },
    { label: "Unique", value: stats.unique },
    { label: "Set complete", value: `${stats.completion}%` },
    { label: "Packs opened", value: user.packsOpened },
    { label: "Trades", value: stats.trades },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none sm:text-7xl">
            <span className="text-accent">@</span>
            {user.username}
          </h1>
          <p className="mt-1 font-cond text-muted">
            Joined {user.createdAt.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        {isMe ? (
          <Link href="/collection" className="btn btn-ghost">
            Edit showcase in binder
          </Link>
        ) : (
          <Link href={`/trades/new?to=${encodeURIComponent(user.username)}`} className="btn btn-primary">
            Propose a trade
          </Link>
        )}
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statTiles.map((s) => (
          <div key={s.label} className="rounded-md border border-line bg-panel/80 px-4 py-3">
            <div className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">{s.label}</div>
            <div className="font-display text-3xl">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">{pinned.length > 0 ? "Showcase" : "Top cards"}</h2>
        {pinned.length === 0 && (
          <p className="text-sm text-muted">
            {isMe
              ? "Pin up to 5 cards from your binder to choose what shows here. Until then, these are your best cards."
              : `@${user.username} hasn't pinned a showcase yet, so here are their best cards.`}
          </p>
        )}
        {shown.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-line px-4 py-8 text-center text-muted">No cards yet.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {shown.map((c) => (
              <li key={c.instanceId}>
                <InspectableCard card={c} finish={c.finish} serialNo={c.serialNo} supply={c.supply} grade={c.grade} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {match && (match.get.length > 0 || match.give.length > 0) && (
        <section className="mt-10" aria-label="Swap match">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl">Swap match</h2>
              <p className="text-sm text-muted">
                @{user.username} has <span className="font-bold text-text">{match.get.length}</span> cards you don&apos;t, and you
                have <span className="font-bold text-text">{match.give.length}</span> they don&apos;t.
              </p>
            </div>
            {match.get.length > 0 && match.give.length > 0 && (
              <Link href={swapHref} className="btn btn-primary">
                Propose this swap
              </Link>
            )}
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {(
              [
                ["They have, you need", match.get, "On your wishlist"],
                ["You have, they need", match.give, "On their wishlist"],
              ] as const
            ).map(([title, list, wishLabel]) => (
              <div key={title} className="rounded-md border border-line bg-panel/80 p-4">
                <h3 className="field-label">
                  {title} ({list.length})
                </h3>
                {list.length === 0 ? (
                  <p className="mt-3 font-cond text-sm text-muted">Nothing here yet.</p>
                ) : (
                  <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6">
                    {list.slice(0, 12).map((x) => (
                      <li key={x.card.instanceId} className="relative">
                        <InspectableCard
                          card={x.card}
                          finish={x.card.finish}
                          serialNo={x.card.serialNo}
                          supply={x.card.supply}
                          grade={x.card.grade}
                          tilt={false}
                        />
                        {x.wished && (
                          <span className="tb-fresh is-wish" aria-label={wishLabel}>
                            ★
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {list.length > 12 && <p className="mt-2 font-cond text-sm text-muted">and {list.length - 12} more</p>}
              </div>
            ))}
          </div>
          <p className="mt-2 font-cond text-sm text-muted">
            The swap starts with up to three cards each way, wishlists first; change anything before you send it.
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-3xl">Recent activity</h2>
        <div className="mt-3">
          <Feed items={items} empty="No activity yet." />
        </div>
      </section>
    </div>
  );
}
