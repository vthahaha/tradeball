"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PulledCard } from "@/lib/packs";
import type { TradeView } from "@/lib/trades";
import { MiniCard } from "./TradeBuilder";

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

function CardRow({ label, cards }: { label: string; cards: PulledCard[] }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">{label}</div>
      {cards.length === 0 ? (
        <p className="mt-2 grid h-24 place-items-center rounded-lg border border-dashed border-line font-cond text-sm text-muted">
          Nothing
        </p>
      ) : (
        <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {cards.map((c) => (
            <li key={c.instanceId}>
              <MiniCard card={c} />
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
}: {
  trade: TradeView;
  me: string;
  mode: "incoming" | "outgoing" | "history" | "log";
}) {
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
      ? `@${trade.from} ⇄ @${trade.to}`
      : iAmSender
        ? `To @${trade.to}`
        : `From @${trade.from}`;

  return (
    <article className="rounded-2xl border border-line bg-panel/80 p-4">
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

      {trade.message && <p className="mt-2 text-sm italic text-text/90">&ldquo;{trade.message}&rdquo;</p>}

      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start">
        <CardRow label={leftLabel} cards={leftCards} />
        <div className="hidden self-center font-display text-3xl text-muted md:block" aria-hidden>
          ⇄
        </div>
        <CardRow label={rightLabel} cards={rightCards} />
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
