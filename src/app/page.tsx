import { Card } from "@/components/Card";
import { UserLink } from "@/components/Feed";
import { LoginForm } from "@/components/LoginForm";
import { PackHub } from "@/components/PackHub";
import { cardView, getDesign, type Finish } from "@/lib/catalog";
import { db } from "@/lib/db";
import { FINISH_SUPPLY } from "@/lib/odds";
import { packStatus } from "@/lib/packs";
import { getCurrentUser } from "@/lib/session";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <Landing error={(await searchParams).error} />;

  const activity = await db.activity.findMany({
    where: { kind: "pull" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { user: { select: { username: true } } },
  });

  const pulls = activity.flatMap((a) => {
    const p = JSON.parse(a.payload) as { designId: string; finish: Finish; serialNo: number | null; grade: number };
    if (!getDesign(p.designId)) return [];
    return [{ id: a.id, who: a.user.username, at: a.createdAt, ...p, card: cardView(p.designId) }];
  });

  return (
    <div>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">
        Rip some <span className="text-accent">packs</span>
      </h1>
      <p className="mt-2 max-w-xl text-muted">
        One free pack every 4 hours, banked up to 3, plus a daily bonus. Every pack has at least one Rare or better.
      </p>

      <div className="mt-6">
        <PackHub initialStatus={packStatus(user)} />
      </div>

      <section className="mt-14">
        <h2 className="font-display text-3xl">Big pulls</h2>
        <p className="text-sm text-muted">Legendaries, Mythics, numbered cards and Gem Mint 10s, from everyone.</p>
        {pulls.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-muted">
            No big pulls yet. Be the first.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {pulls.map((p) => (
              <li key={p.id} className="space-y-1.5">
                <Card
                  card={p.card}
                  finish={p.finish}
                  serialNo={p.serialNo}
                  supply={p.serialNo ? (FINISH_SUPPLY[p.finish] ?? null) : null}
                  grade={p.grade}
                />
                <div className="font-cond text-xs leading-tight text-muted">
                  <UserLink name={p.who} /> ·{" "}
                  {p.at.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Landing({ error }: { error?: string }) {
  const showcase = [
    { id: "fb-lionel-messi+fb-cristiano-ronaldo-duo-the-rivalry", finish: "holo" as Finish },
    { id: "bb-michael-jordan-moment-the-last-shot", finish: "standard" as Finish },
    { id: "fb-lamine-yamal-star", finish: "foil" as Finish },
  ].filter((s) => getDesign(s.id));

  return (
    <div className="grid items-center gap-10 py-6 md:grid-cols-[1.1fr_1fr] md:py-14">
      <div>
        <h1 className="font-display text-6xl leading-[0.9] sm:text-8xl">
          Collect.
          <br />
          Rip. <span className="text-accent">Trade.</span>
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted">
          Free soccer & basketball card packs for you and your friends. Chase numbered Golds, one-of-one Masterpieces
          and Gem Mint 10s.
        </p>
        <div className="mt-8">
          <LoginForm error={error?.slice(0, 200)} />
        </div>
      </div>
      <div className="relative mx-auto h-[420px] w-full max-w-md" aria-hidden>
        {showcase.map((s, i) => (
          <div
            key={s.id}
            className="absolute w-52 sm:w-60"
            style={{
              left: `${8 + i * 22}%`,
              top: `${i === 1 ? 0 : 40}px`,
              transform: `rotate(${(i - 1) * 9}deg)`,
              zIndex: i === 1 ? 2 : 1,
            }}
          >
            <Card card={cardView(s.id)} finish={s.finish} tilt={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
