"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { INSERT_DESIGNS } from "@/lib/catalog";
import { isInsert, RARITIES } from "@/lib/catalog/types";
import type { PulledCard } from "@/lib/packs";
import { CloseIcon, StarIcon } from "./Icons";
import { Card } from "./Card";

const MAX = 10;
const FINISH_RANK = { standard: 0, foil: 1, holo: 2, gold: 3, black: 4, masterpiece: 5 } as const;

function sortCards(cards: PulledCard[]) {
  return [...cards].sort(
    (a, b) =>
      RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) ||
      FINISH_RANK[b.finish] - FINISH_RANK[a.finish] ||
      b.ovr - a.ovr,
  );
}

export function MiniCard({ card, badge }: { card: PulledCard; badge?: React.ReactNode }) {
  return (
    <div className="relative">
      <Card card={card} finish={card.finish} serialNo={card.serialNo} supply={card.supply} grade={card.grade} tilt={false} small />
      {badge}
    </div>
  );
}

function Side({
  title,
  owner,
  cards,
  selected,
  onToggle,
  highlight,
  highlightLabel,
}: {
  title: string;
  owner: string;
  cards: PulledCard[];
  selected: string[];
  onToggle: (id: string) => void;
  highlight: Set<string>;
  highlightLabel: string;
}) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string>("all");
  const [wantedOnly, setWantedOnly] = useState(false);
  const sorted = useMemo(() => sortCards(cards), [cards]);
  const picked = sorted.filter((c) => selected.includes(c.instanceId));
  const pool = sorted.filter((c) => {
    if (selected.includes(c.instanceId)) return false;
    if (kind === "insert" ? !isInsert(c.type) : kind !== "all" && c.type !== kind) return false;
    if (wantedOnly && !highlight.has(c.designId)) return false;
    const s = q.trim().toLowerCase();
    return !s || c.players.some((p) => p.name.toLowerCase().includes(s) || p.team.toLowerCase().includes(s));
  });

  return (
    <section className="flex min-w-0 flex-col rounded-md border border-line bg-panel/80 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-3xl">{title}</h2>
        <span className="font-cond text-sm text-muted">
          from @{owner} · {selected.length}/{MAX}
        </span>
      </div>

      {/* Selected tray */}
      <div className="mt-3 min-h-28 rounded-md border border-dashed border-line bg-bg-2/60 p-2">
        {picked.length === 0 ? (
          <p className="grid h-24 place-items-center text-center font-cond text-sm text-muted">
            Tap cards below to add them
          </p>
        ) : (
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {picked.map((c) => (
              <li key={c.instanceId}>
                <button
                  type="button"
                  className="block w-full cursor-pointer"
                  onClick={() => onToggle(c.instanceId)}
                  aria-label={`Remove ${c.players[0].name}`}
                >
                  <MiniCard
                    card={c}
                    badge={
                      <span className="absolute -right-1 -top-1 z-10 grid size-5 place-items-center rounded-full bg-danger text-xs font-bold text-white">
                        <CloseIcon className="size-3" />
                      </span>
                    }
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          aria-label={`Search ${owner}'s cards`}
          className="min-w-0 flex-1 rounded-full border border-line bg-bg-2 px-3 py-1.5 text-sm focus:border-accent"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          aria-label="Card type"
          className="rounded-full border border-line bg-bg-2 px-3 py-1.5 font-cond text-sm font-bold uppercase"
        >
          <option value="all">All</option>
          <option value="base">Base</option>
          <option value="rookie">Rookies</option>
          <option value="ucl">Champions League</option>
          <option value="nfl">NFL</option>
          <option value="mlb">MLB</option>
          <option value="nhl">NHL</option>
          <option value="lol">Worlds 2026</option>
          {INSERT_DESIGNS.length > 0 && <option value="insert">Inserts</option>}
        </select>
        {highlight.size > 0 && (
          <button
            type="button"
            aria-pressed={wantedOnly}
            onClick={() => setWantedOnly((v) => !v)}
            className={`rounded-full border px-3 py-1.5 font-cond text-sm font-bold uppercase ${
              wantedOnly ? "border-transparent bg-[#ffd76a] text-bg" : "border-line text-muted"
            }`}
          >
            <StarIcon filled className="mr-1 inline size-3.5 align-[-2px]" />{highlightLabel}
          </button>
        )}
      </div>

      {/* Pool */}
      {cards.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted">@{owner} has no cards yet.</p>
      ) : (
        <ul className="mt-3 grid max-h-[560px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
          {pool.map((c) => (
            <li key={c.instanceId}>
              <button
                type="button"
                className="block w-full cursor-pointer transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={selected.length >= MAX}
                onClick={() => onToggle(c.instanceId)}
                aria-label={`Add ${c.players.map((p) => p.name).join(" & ")}`}
              >
                <MiniCard
                  card={c}
                  badge={
                    highlight.has(c.designId) && (
                      <span
                        className="absolute -left-1 -top-1 z-10 rounded-full bg-[#ffd76a] px-1.5 font-cond text-xs font-extrabold text-bg"
                        title={highlightLabel}
                      >
                        <StarIcon filled className="size-3" />
                      </span>
                    )
                  }
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function TradeBuilder({
  users,
  them,
  myCards,
  theirCards,
  myWishes,
  theirWishes,
  initialGive,
  initialGet,
  counterOf,
}: {
  users: string[];
  them: string | null;
  myCards: PulledCard[];
  theirCards: PulledCard[];
  myWishes: string[];
  theirWishes: string[];
  initialGive: string[];
  initialGet: string[];
  counterOf: string | null;
}) {
  const router = useRouter();
  const [give, setGive] = useState(initialGive);
  const [get, setGet] = useState(initialGet);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (set: typeof setGive) => (id: string) =>
    set((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : xs.length >= MAX ? xs : [...xs, id]));

  async function send() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to: them, give, get, message, counterOf }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Couldn't send the offer");
    router.push("/trades");
    router.refresh();
  }

  if (users.length === 0) {
    return (
      <p className="mt-8 rounded-md border border-dashed border-line px-4 py-10 text-center text-muted">
        Nobody else has joined yet. Send your friends the link so they can sign up.
      </p>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="trade-with" className="font-cond text-sm font-bold uppercase tracking-[0.2em] text-muted">
          Trade with
        </label>
        <select
          id="trade-with"
          value={them ?? ""}
          disabled={!!counterOf}
          onChange={(e) => router.push(`/trades/new?to=${encodeURIComponent(e.target.value)}`)}
          className="rounded-lg border border-line bg-bg-2 px-3 py-2 font-cond text-lg font-bold"
        >
          <option value="" disabled>
            Pick a friend…
          </option>
          {users.map((u) => (
            <option key={u} value={u}>
              @{u}
            </option>
          ))}
        </select>
        {counterOf && <span className="font-cond text-sm text-muted">Countering their offer. Change anything you like.</span>}
      </div>

      {them && (
        <>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Side
              title="You give"
              owner="you"
              cards={myCards}
              selected={give}
              onToggle={toggle(setGive)}
              highlight={new Set(theirWishes)}
              highlightLabel={`@${them} wants`}
            />
            <Side
              title="You get"
              owner={them}
              cards={theirCards}
              selected={get}
              onToggle={toggle(setGet)}
              highlight={new Set(myWishes)}
              highlightLabel="On your wishlist"
            />
          </div>

          <div className="sticky bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-5 sm:bottom-0 border-t border-line bg-bg/90 px-4 py-3 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                placeholder="Add a message (optional)"
                aria-label="Message"
                className="min-w-0 flex-1 rounded-lg border border-line bg-bg-2 px-3 py-2 focus:border-accent"
              />
              <span className="font-cond text-sm text-muted">
                {give.length} for {get.length}
                {get.length === 0 && give.length > 0 ? " (a gift!)" : ""}
              </span>
              <Link href="/trades" className="btn btn-ghost">
                Cancel
              </Link>
              <button className="btn btn-primary min-w-36" onClick={send} disabled={busy || give.length + get.length === 0}>
                {busy ? "Sending…" : counterOf ? "Send counter" : "Send offer"}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 text-sm text-danger">
                {error}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
