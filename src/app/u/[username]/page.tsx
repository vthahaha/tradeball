import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Feed } from "@/components/Feed";
import { db } from "@/lib/db";
import { bestCards, feed, showcaseCards, userStats } from "@/lib/profile";
import { getCurrentUser } from "@/lib/session";
import { InspectableCard } from "@/components/CardViewer";

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

      <section className="mt-10">
        <h2 className="font-display text-3xl">Recent activity</h2>
        <div className="mt-3">
          <Feed items={items} empty="No activity yet." />
        </div>
      </section>
    </div>
  );
}
