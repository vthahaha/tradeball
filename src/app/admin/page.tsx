import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/ConfirmAction";
import { isAdmin } from "@/lib/admin";
import { cardView, INSERT_DESIGNS, INSERT_NAMES, INSERT_POOLS, INSERT_TYPES } from "@/lib/catalog";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.username)) notFound();

  const [users, cards, trades, myCards] = await Promise.all([
    db.user.count(),
    db.cardInstance.count(),
    db.trade.count(),
    db.cardInstance.count({ where: { ownerId: user.id } }),
  ]);
  const withArt = INSERT_DESIGNS.filter((d) => cardView(d.id).art).length;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">
        Admin <span className="text-accent">desk</span>
      </h1>
      <p className="mt-3 text-muted">Signed in as @{user.username}. Only admins can see this page.</p>

      <section className="ticket-panel mt-8 px-6 py-5">
        <h2 className="font-display text-2xl">Delete my cards</h2>
        <p className="mt-2 text-sm text-muted">
          Deletes every card in your own binder ({myCards} right now, recycled ones included), the trades they were part
          of and your big-pull feed entries, and resets your showcase, shards, pack count and Legendary guarantee. Your
          tickets, wishlist and account stay. Other players are not affected. This cannot be undone.
        </p>
        <ConfirmAction
          endpoint="/api/admin/my-cards"
          keyword="DELETE"
          label="Delete my cards"
          busyLabel="Deleting…"
          done="mine"
        />
      </section>

      <section className="ticket-panel mt-6 px-6 py-5">
        <h2 className="font-display text-2xl">Relaunch wipe</h2>
        <p className="mt-2 text-sm text-muted">
          Deletes every card, trade, wishlist and activity entry for all {users} players, resets binders, shards and
          the Legendary guarantee, then gives everyone a full wallet plus 3 bonus tickets. Accounts and usernames stay.
          This cannot be undone.
        </p>
        <p className="mt-3 font-cond text-sm font-semibold text-muted">
          Right now: {cards} cards · {trades} trades
        </p>
        <ConfirmAction
          endpoint="/api/admin/wipe"
          keyword="WIPE"
          label="Wipe and relaunch"
          busyLabel="Wiping…"
          done="wipe"
        />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Insert splash art</h2>
        <p className="mt-2 text-sm text-muted">
          Add an image for any card below in <code className="text-text">src/lib/catalog/insert-art.ts</code>, keyed by
          its card id. Cards without art show the player&apos;s initials. {withArt} of {INSERT_DESIGNS.length} have art.
        </p>
        {INSERT_TYPES.map((t) => (
          <div key={t} className="mt-6">
            <h3 className="field-label">
              {INSERT_NAMES[t]} · {INSERT_POOLS[t].length}
            </h3>
            <ul className="mt-2 divide-y divide-line/60 rounded-md border border-line bg-panel/80 font-cond text-sm">
              {INSERT_POOLS[t].map((d) => {
                const v = cardView(d.id);
                return (
                  <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
                    <span className="truncate">
                      <span className="font-bold text-text">{v.players[0].name}</span>
                      <span className="text-muted"> · {v.title ?? v.kicker ?? v.team}</span>
                    </span>
                    <code className={`shrink-0 select-all ${v.art ? "text-accent" : "text-muted"}`}>{d.id}</code>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
