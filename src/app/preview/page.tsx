import { notFound } from "next/navigation";
import { TurnableCard } from "@/components/Card";
import { isAdmin } from "@/lib/admin";
import { cardView, INSERT_NAMES, INSERT_POOLS, INSERT_TYPES, POOLS, RARITIES } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Insert preview" };

/**
 * Every insert card, to check splash art from insert-art.ts. Open on `npm run dev`
 * (no sign-in or database needed); on the live site only admins can see it.
 */
export default async function PreviewPage({ searchParams }: { searchParams: Promise<{ only?: string }> }) {
  if (process.env.NODE_ENV === "production") {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.username)) notFound();
  }
  const { only } = await searchParams;
  const show = only === "art" ? "art" : only === "missing" ? "missing" : "all";

  const groups = INSERT_TYPES.map((t) => ({
    t,
    cards: INSERT_POOLS[t].map((d) => cardView(d.id)).filter((v) => (show === "art" ? v.art : show === "missing" ? !v.art : true)),
    withArt: INSERT_POOLS[t].filter((d) => cardView(d.id).art).length,
    total: INSERT_POOLS[t].length,
  }));

  return (
    <div>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">
        Insert <span className="text-accent">preview</span>
      </h1>
      <p className="mt-3 text-muted">
        Splash art comes from <code className="text-text">src/lib/catalog/insert-art.ts</code>. A card showing initials
        on its scene has no art yet, or its image failed to load. Flip a card to see its back.
      </p>
      <nav className="mt-4 flex gap-2 font-cond text-sm font-semibold">
        {(["all", "art", "missing"] as const).map((k) => (
          <a
            key={k}
            href={k === "all" ? "/preview" : `/preview?only=${k}`}
            className={`rounded-md border px-3 py-1 ${show === k ? "border-accent text-accent" : "border-line text-muted"}`}
          >
            {k === "all" ? "All" : k === "art" ? "With art" : "No art yet"}
          </a>
        ))}
      </nav>
      {show === "all" && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">
            Base set <span className="font-cond text-base text-muted">one per edition</span>
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {RARITIES.flatMap((r) => POOLS.basketball[r].slice(0, 1)).map((d) => (
              <li key={d.id}>
                <TurnableCard card={cardView(d.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {groups
        .filter((g) => g.cards.length > 0)
        .map((g) => (
          <section key={g.t} className="mt-10">
            <h2 className="font-display text-2xl">
              {INSERT_NAMES[g.t]}{" "}
              <span className="font-cond text-base text-muted">
                {g.withArt}/{g.total} with art
              </span>
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {g.cards.map((v) => (
                <li key={v.designId}>
                  <TurnableCard card={v} />
                  <code className={`mt-1 block text-center text-xs ${v.art ? "text-accent" : "text-muted"}`}>
                    {v.designId}
                  </code>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
