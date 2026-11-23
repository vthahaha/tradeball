import Link from "next/link";
import { redirect } from "next/navigation";
import { Feed } from "@/components/Feed";
import { db } from "@/lib/db";
import { bestCards, feed, showcaseCards, userStats } from "@/lib/profile";
import { getCurrentUser } from "@/lib/session";
import { Card } from "@/components/Card";

export default async function LeaguePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/");

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  const players = await Promise.all(
    users.map(async (u) => {
      const [stats, pinned] = await Promise.all([userStats(u.id), showcaseCards(u)]);
      const cards = (pinned.length > 0 ? pinned : await bestCards(u.id, 3)).slice(0, 3);
      return { u, stats, cards };
    }),
  );
  players.sort((a, b) => b.stats.unique - a.stats.unique || b.stats.cards - a.stats.cards);
  const items = await feed({ take: 40 });

  return (
    <div>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">
        The <span className="text-accent">league</span>
      </h1>
      <p className="mt-2 text-muted">Everyone in your group, ranked by how much of the set they own.</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <section>
          <h2 className="font-display text-3xl">Players</h2>
          <ol className="mt-3 space-y-3">
            {players.map(({ u, stats, cards }, i) => (
              <li key={u.id}>
                <Link
                  href={`/u/${encodeURIComponent(u.username)}`}
                  className={`ticket-row ${u.id === me.id ? "ring-1 ring-inset ring-accent/60" : ""}`}
                  aria-current={u.id === me.id ? "true" : undefined}
                >
                  <span className={`ticket-row__stub font-display text-3xl ${i === 0 ? "text-accent" : "text-muted"}`}>{i + 1}</span>
                  <div className="flex min-w-0 flex-1 items-center gap-4 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-2xl leading-none">
                      @{u.username}
                      {u.id === me.id && <span className="ml-2 font-cond text-sm text-accent">you</span>}
                    </div>
                    <div className="mt-1 font-cond text-sm text-muted">
                      {stats.unique} unique · {stats.cards} cards · {stats.trades} trades · {u.packsOpened} packs
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-2">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${stats.completion}%` }} />
                    </div>
                  </div>
                  <div className="hidden shrink-0 gap-1.5 sm:flex">
                    {cards.map((c) => (
                      <div key={c.instanceId} className="w-12">
                        <Card card={c} finish={c.finish} serialNo={c.serialNo} supply={c.supply} tilt={false} small />
                      </div>
                    ))}
                  </div>
                  <span className="font-display text-2xl">{stats.completion}%</span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-display text-3xl">Activity</h2>
          <div className="mt-3">
            <Feed items={items} empty="Quiet so far. Open a pack!" />
          </div>
        </section>
      </div>
    </div>
  );
}
