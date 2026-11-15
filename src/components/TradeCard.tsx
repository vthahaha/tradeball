"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PulledCard } from "@/lib/packs";
import type { TradeView } from "@/lib/trades";
import { SwapIcon } from "./Icons";
import { RARITIES } from "@/lib/catalog/types";
import { InspectableCard } from "./CardViewer";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#ffd76a] text-bg",
  accepted: "bg-accent text-accent-ink",
  declined: "bg-danger/20 text-danger",
  cancelled: "bg-panel-2 text-muted",
  countered: "bg-[#3b8bff33] text-[#8fbaff]",
  expired: "bg-panel-2 text-muted",
};

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** "1 Legendary · 2 Rare": what a side is worth at a glance, rarest first. */
function tally(cards: PulledCard[]) {
  const n = new Map<string, number>();
  for (const c of cards) n.set(c.rarity, (n.get(c.rarity) ?? 0) + 1);
  return [...RARITIES]
    .reverse()
    .filter((r) => n.has(r))
    .map((r) => `${n.get(r)} ${r}`)
    .join(" · ");
}

function CardRow({ label, cards, fresh }: { label: string; cards: PulledCard[]; fresh?: Set<string> }) {
  const newCount = fresh ? cards.filter((c) => !fresh.has(c.designId)).length : 0;
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">{label}</span>
        {cards.length > 0 && <span className="font-cond text-xs font-semibold capitalize text-muted">{tally(cards)}</span>}
        {newCount > 0 && <span className="font-cond text-xs font-bold text-accent">{newCount} new for you</span>}
      </div>
      {cards.length === 0 ? (
        <p className="mt-2 grid h-24 place-items-center rounded-lg border border-dashed border-line font-cond text-sm text-muted">
          Nothing
        </p>
      ) : (
        <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {cards.map((c) => (
            <li key={c.instanceId} className="relative">
              <InspectableCard card={c} finish={c.finish} serialNo={c.serialNo} supply={c.supply} grade={c.grade} tilt={false} />
              {fresh && !fresh.has(c.designId) && (
                <span className="tb-fresh" aria-label="New for you">
                  New
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TradeCard({
  trade,
  me,
  mode,
  mine,
}: {
  trade: TradeView;
  me: string;
  mode: "incoming" | "outgoing" | "history" | "log";
  /** Designs the viewer already owns: cards they would get that are not in here are marked new. */
  mine?: string[];
}) {
  const owned = mine && mode !== "log" && mode !== "history" ? new Set(mine) : undefined;
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "decline" | "cancel") {
    setBusy(action);
    setError(null);
    const res = await fetch(`/api/trades/${trade.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) setError(data.error ?? "Something went wrong");
    router.refresh();
  }

  const iAmSender = trade.from === me;
  // Always show from the viewer's side when they're involved.
  const [leftLabel, leftCards, rightLabel, rightCards] =
    mode === "log"
      ? [`@${trade.from} gave`, trade.fromCards, `@${trade.to} gave`, trade.toCards]
      : iAmSender
        ? ["You give", trade.fromCards, `@${trade.to} gives`, trade.toCards]
        : [`@${trade.from} gives`, trade.fromCards, "You give", trade.toCards];

  const headline =
    mode === "log"
      ? `@${trade.from} and @${trade.to}`
      : iAmSender
        ? `To @${trade.to}`
        : `From @${trade.from}`;

  return (
    <article className="ticket-panel p-4" style={{ "--notch-y": "2.9rem" } as React.CSSProperties}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-display text-2xl leading-none">{headline}</h3>
        {trade.isCounter && (
          <span className="rounded-full bg-[#3b8bff33] px-2 py-0.5 font-cond text-xs font-bold uppercase text-[#8fbaff]">
            Counter
          </span>
        )}
        <span className={`rounded-full px-2 py-0.5 font-cond text-xs font-bold uppercase ${STATUS_STYLE[trade.status] ?? ""}`}>
          {trade.status}
        </span>
        <span className="ml-auto font-cond text-sm text-muted">{when(trade.resolvedAt ?? trade.createdAt)}</span>
      </header>
      <div className="perf -mx-4 mt-3" aria-hidden />

      {trade.message && <p className="mt-2 text-sm italic text-text/90">&ldquo;{trade.message}&rdquo;</p>}

      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start">
        <CardRow label={leftLabel} cards={leftCards} fresh={iAmSender ? undefined : owned} />
        <div className="hidden self-center font-display text-3xl text-muted md:block" aria-hidden>
          <SwapIcon className="size-7" />
        </div>
        <CardRow label={rightLabel} cards={rightCards} fresh={iAmSender ? owned : undefined} />
      </div>

      {trade.stale && (
        <p className="mt-3 text-sm text-[#ffd76a]">
          Some of these cards have already changed hands. Accepting will fail.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      {mode === "incoming" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primary min-w-32" disabled={!!busy || trade.stale} onClick={() => act("accept")}>
            {busy === "accept" ? "Swapping…" : "Accept"}
          </button>
          <Link href={`/trades/new?counter=${trade.id}`} className="btn btn-ghost">
            Counter
          </Link>
          <button className="btn btn-ghost" disabled={!!busy} onClick={() => act("decline")}>
            Decline
          </button>
        </div>
      )}
      {mode === "outgoing" && (
        <div className="mt-4">
          <button className="btn btn-ghost" disabled={!!busy} onClick={() => act("cancel")}>
            {busy === "cancel" ? "Cancelling…" : "Cancel offer"}
          </button>
        </div>
      )}
    </article>
  );
}
