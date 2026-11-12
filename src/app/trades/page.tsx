import Link from "next/link";
import { redirect } from "next/navigation";
import { TradeCard } from "@/components/TradeCard";
import { getCurrentUser } from "@/lib/session";
import { tradesFor } from "@/lib/trades";

export default async function TradesPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/");
  const { incoming, outgoing, history, league } = await tradesFor(me.id);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl leading-none sm:text-6xl">
          <span className="text-accent">Trades</span>
        </h1>
        <Link href="/trades/new" className="btn btn-primary">
          New trade
        </Link>
      </div>

      <Section title="Offers for you" count={incoming.length} empty="No offers waiting. Go make one!">
        {incoming.map((t) => (
          <TradeCard key={t.id} trade={t} me={me.username} mode="incoming" />
        ))}
      </Section>

      <Section title="Your open offers" count={outgoing.length} empty="You have no open offers.">
        {outgoing.map((t) => (
          <TradeCard key={t.id} trade={t} me={me.username} mode="outgoing" />
        ))}
      </Section>

      <Section title="Your history" count={history.length} empty="No finished trades yet.">
        {history.map((t) => (
          <TradeCard key={t.id} trade={t} me={me.username} mode="history" />
        ))}
      </Section>

      <Section title="League trade log" count={league.length} empty="Nobody has traded yet." note="Every completed trade, from everyone.">
        {league.map((t) => (
          <TradeCard key={t.id} trade={t} me={me.username} mode="log" />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  count,
  empty,
  note,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-3xl">
        {title} {count > 0 && <span className="text-muted">({count})</span>}
      </h2>
      {note && <p className="text-sm text-muted">{note}</p>}
      {count === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-line px-4 py-6 text-center text-muted">{empty}</p>
      ) : (
        <div className="mt-3 space-y-4">{children}</div>
      )}
    </section>
  );
}
