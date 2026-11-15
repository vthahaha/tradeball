import Link from "next/link";
import type { FeedItem } from "@/lib/profile";
import { PlusIcon, SwapIcon } from "./Icons";
import { InspectableCard } from "./CardViewer";

const RARITY_TEXT: Record<string, string> = {
  common: "text-[var(--r-common)]",
  uncommon: "text-[var(--r-uncommon)]",
  rare: "text-[var(--r-rare)]",
  epic: "text-[var(--r-epic)]",
  legendary: "text-[var(--r-legendary)]",
  mythic: "text-[var(--r-mythic)]",
  grail: "text-[var(--r-grail)]",
};

function ago(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function UserLink({ name }: { name: string }) {
  return (
    <Link href={`/u/${encodeURIComponent(name)}`} className="font-bold text-text hover:text-accent">
      @{name}
    </Link>
  );
}

export function Feed({ items, empty = "Nothing here yet." }: { items: FeedItem[]; empty?: string }) {
  if (items.length === 0) {
    return <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-muted">{empty}</p>;
  }
  return (
    <ul className="ticket-panel ticket-list">
      {items.map((it) => (
        <li key={it.id} className="flex items-center gap-3 px-4 py-3">
          {it.kind === "pull" ? (
            <div className="w-12 shrink-0">
              <InspectableCard card={it.card} finish={it.card.finish} serialNo={it.card.serialNo} supply={it.card.supply} tilt={false} />
            </div>
          ) : (
            <div
              className="grid size-12 shrink-0 place-items-center rounded-md bg-panel-2 font-display text-2xl text-muted"
              aria-hidden
            >
              {it.kind === "trade" ? <SwapIcon className="size-6" /> : <PlusIcon className="size-6" />}
            </div>
          )}
          <p className="min-w-0 flex-1 text-sm leading-snug">
            <UserLink name={it.who} />{" "}
            {it.kind === "pull" && (
              <>
                pulled{" "}
                <span className="font-bold">{it.card.players.map((p) => p.name).join(" & ")}</span>
                {it.card.title ? <span className="text-muted"> · {it.card.title}</span> : null}{" "}
                <span className={`font-cond font-bold uppercase ${RARITY_TEXT[it.card.rarity]}`}>{it.card.rarity}</span>
                {it.card.serialNo && it.card.supply ? (
                  <span className="font-cond font-bold text-[#ffd76a]">
                    {" "}
                    {it.card.supply === 1 ? "1/1" : `#${it.card.serialNo}/${it.card.supply}`}
                  </span>
                ) : it.card.finish !== "standard" ? (
                  <span className="font-cond font-bold capitalize text-muted"> {it.card.finish}</span>
                ) : null}
                {it.card.grade === 10 && <span className="font-cond font-bold text-accent"> · GEM MINT</span>}
              </>
            )}
            {it.kind === "trade" && (
              <>
                traded with <UserLink name={it.withUser} />{" "}
                <span className="text-muted">
                  ({it.gave} for {it.got})
                </span>
              </>
            )}
            {it.kind === "join" && <>joined the league. Say hi with a trade.</>}
          </p>
          <span className="shrink-0 font-cond text-xs text-muted">{ago(it.at)}</span>
        </li>
      ))}
    </ul>
  );
}
