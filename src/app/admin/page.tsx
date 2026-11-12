import { notFound } from "next/navigation";
import { WipePanel } from "@/components/WipePanel";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.username)) notFound();

  const [users, cards, trades] = await Promise.all([db.user.count(), db.cardInstance.count(), db.trade.count()]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">
        Admin <span className="text-accent">desk</span>
      </h1>
      <p className="mt-3 text-muted">Signed in as @{user.username}. Only admins can see this page.</p>

      <section className="ticket-panel mt-8 px-6 py-5">
        <h2 className="font-display text-2xl">Relaunch wipe</h2>
        <p className="mt-2 text-sm text-muted">
          Deletes every card, trade, wishlist and activity entry for all {users} players, resets binders, shards and
          the Legendary guarantee, then gives everyone a full wallet plus 3 bonus tickets. Accounts and usernames stay.
          This cannot be undone.
        </p>
        <p className="mt-3 font-cond text-sm font-semibold text-muted">
          Right now: {cards} cards · {trades} trades
        </p>
        <WipePanel />
      </section>
    </div>
  );
}
