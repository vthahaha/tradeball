import { Card } from "@/components/Card";
import { UserLink } from "@/components/Feed";
import { LoginForm } from "@/components/LoginForm";
import { PackArt, PackHub } from "@/components/PackHub";
import { cardView, getDesign, type Finish } from "@/lib/catalog";
import { db } from "@/lib/db";
import { FINISH_SUPPLY } from "@/lib/odds";
import { packStatus } from "@/lib/packs";
import { getCurrentUser } from "@/lib/session";
import { InspectableCard } from "@/components/CardViewer";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <Landing error={(await searchParams).error} />;

  const activity = await db.activity.findMany({
    where: { kind: "pull" },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { user: { select: { username: true } } },
  });

  const pulls = activity.flatMap((a) => {
    const p = JSON.parse(a.payload) as { designId: string; finish: Finish; serialNo: number | null; grade: number };
    if (!getDesign(p.designId)) return [];
    return [{ id: a.id, who: a.user.username, at: a.createdAt, ...p, card: cardView(p.designId) }];
  });

  return (
    <div>
      <h1 className="font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.9]">
        Tonight&apos;s <span className="text-accent">tickets</span>
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Tear a ticket to rip a pack. A new free ticket every 4 hours, up to 3 in your wallet, plus one daily.
      </p>

      <div className="mt-7">
        <PackHub initialStatus={packStatus(user)} nextNo={user.packsOpened + 1} />
      </div>

      <section className="mt-14" aria-labelledby="big-pulls">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="big-pulls" className="font-display text-3xl">
            Big pulls
          </h2>
          <p className="hidden text-sm text-muted sm:block">Legends, Mythics, numbered cards and Gem Mint 10s, from everyone</p>
        </div>
        <div className="perf mt-3" aria-hidden />
        {pulls.length === 0 ? (
          <p className="mt-6 text-muted">No big pulls yet. The first Legend in the league could be yours.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
            {pulls.map((p) => (
              <li key={p.id}>
                <InspectableCard
                  card={p.card}
                  finish={p.finish}
                  serialNo={p.serialNo}
                  supply={p.serialNo ? (FINISH_SUPPLY[p.finish] ?? null) : null}
                  grade={p.grade}
                />
                <div className="mt-2 font-cond text-sm leading-tight text-muted">
                  <UserLink name={p.who} /> · {p.at.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
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
  const fan = [
    { id: "nba-5104157-base", finish: "foil" as Finish, x: "-58%", r: -14 },
    { id: "nba-3112335-base", finish: "standard" as Finish, x: "0%", r: 0 },
    { id: "nba-5142718-rookie", finish: "holo" as Finish, x: "58%", r: 14 },
  ].filter((s) => getDesign(s.id));

  return (
    <div className="grid items-center gap-12 py-4 md:grid-cols-[1fr_1.05fr] md:py-12">
      <div>
        <h1 className="font-display text-[clamp(3rem,8.5vw,6rem)] leading-[0.86]">
          Free packs.
          <br />
          Real <span className="text-accent">chase.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-muted">
          Basketball cards from this season&apos;s rosters, for you and your friends. Tear a free ticket every few hours, chase numbered
          Golds and one-of-one Masterpieces, and trade for the rest.
        </p>
        <div className="mt-8">
          <LoginForm error={error?.slice(0, 200)} />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[520px] pb-4" aria-hidden>
        <div className="relative mx-auto h-[300px] w-[46%] sm:h-[340px]">
          {fan.map((s) => (
            <div
              key={s.id}
              className="absolute inset-x-0 top-0"
              style={{ transform: `translateX(${s.x}) rotate(${s.r}deg)`, transformOrigin: "50% 120%", zIndex: s.r === 0 ? 2 : 1 }}
            >
              <Card card={cardView(s.id)} finish={s.finish} tilt={false} />
            </div>
          ))}
        </div>
        <div className="relative z-10 -mt-16">
          <PackArt type="basketball" no={1} />
        </div>
      </div>
    </div>
  );
}
