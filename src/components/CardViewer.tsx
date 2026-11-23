"use client";

// The full-screen card view. Any card in the app opens here: the card as large as the screen
// allows (its cqw type finally reads at full size), tap it to turn it over, tilt it with the
// pointer, and a facts panel beside it that says in plain type what the card's small print says.
// The binder adds its own actions below the facts through `children`.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { setLabel, type CardView, type Finish } from "@/lib/catalog";
import { Card, CardReverse, PARALLEL, cardNo, type CardProps } from "./Card";

const FINISH_NAME: Record<Finish, string> = {
  standard: "Standard",
  foil: "Foil",
  holo: "Holo",
  gold: "Gold",
  black: "Black",
  masterpiece: "Masterpiece",
};
const STAT_KEYS = ["PTS", "REB", "AST", "STL", "BLK", "3P%"] as const;

/** Basketball lines are per game; soccer and NFL lines are season totals (APP, G, A / YDS, TD, INT). */
function statHeading(card: CardView) {
  if (card.sport !== "basketball") return card.statLine ?? "This season";
  return card.statLine ? `${card.statLine} per game` : "Per game";
}

export interface CardViewerProps extends CardProps {
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** Extra panel content under the facts (the binder's wishlist, copies, trade links). */
  children?: ReactNode;
}

/** A card shown large with its facts. Render inside <AnimatePresence>. */
export function CardViewer({ onClose, onPrev, onNext, children, ...card }: CardViewerProps) {
  const c = card.card;
  const reduce = useReducedMotion();
  const [back, setBack] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const names = c.players.map((p) => p.name).join(" & ");

  // keyboard: Esc closes, arrows step, F or space turns the card; focus moves in and comes back
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      before?.focus?.();
    };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, select");
      if (e.key === "Escape") onClose();
      else if (typing) return;
      else if (e.key === "ArrowLeft" && onPrev) onPrev();
      else if (e.key === "ArrowRight" && onNext) onNext();
      else if (e.key === "f" || e.key === "F") setBack((b) => !b);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const facts: [string, ReactNode][] = [
    ["Rating", <b key="o" className="font-display text-2xl leading-none">{c.ovr}</b>],
    ["Card", cardNo(c)],
    ["Parallel", `${PARALLEL[c.rarity]} · ${c.rarity}`],
    ["Finish", card.finish ? FINISH_NAME[card.finish] : "Standard"],
  ];
  if (card.serialNo && card.supply)
    facts.push(["Serial", <b key="s" className="text-[#ffd76a]">{card.supply === 1 ? "1 of 1" : `${card.serialNo} / ${card.supply}`}</b>]);
  if (card.grade != null) facts.push(["Grade", card.grade === 10 ? "10 · Gem Mint" : String(card.grade)]);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#03050ad9] backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={names}
    >
      <div className="flex min-h-full items-start justify-center px-4 py-6 sm:items-center sm:py-10">
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          className="flex w-full max-w-5xl flex-col items-center gap-6 outline-none md:flex-row md:items-center md:gap-10"
          initial={reduce ? false : { scale: 0.94, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={reduce ? undefined : { scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* the card: as big as the viewport allows, never past 460px wide */}
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div
              className="relative aspect-[5/7] [perspective:1400px]"
              style={{ width: "min(86vw, calc((100dvh - 10rem) * 5 / 7), 460px)" }}
            >
              <motion.button
                type="button"
                className="absolute inset-0 block cursor-pointer [transform-style:preserve-3d]"
                onClick={() => setBack((b) => !b)}
                aria-label={back ? "Show the front" : "Turn the card over"}
                aria-pressed={back}
                animate={{ rotateY: back ? 180 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.3, 1.25, 0.5, 1] }}
              >
                <span className="absolute inset-0 block [backface-visibility:hidden]" aria-hidden={back}>
                  <Card {...card} />
                </span>
                <span
                  className="absolute inset-0 block [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  aria-hidden={!back}
                >
                  <CardReverse {...card} />
                </span>
              </motion.button>
            </div>
            <div className="flex items-center gap-2">
              {onPrev && (
                <button type="button" className="btn btn-ghost px-3 py-1.5 text-sm" onClick={onPrev} aria-label="Previous card">
                  ←
                </button>
              )}
              <span className="field-label">Tap the card to turn it over</span>
              {onNext && (
                <button type="button" className="btn btn-ghost px-3 py-1.5 text-sm" onClick={onNext} aria-label="Next card">
                  →
                </button>
              )}
            </div>
          </div>

          {/* the facts, in plain readable type */}
          <div className="w-full max-w-md md:max-w-none md:flex-1">
            <div
              className="font-cond text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: `var(--r-${c.rarity})` }}
            >
              {setLabel(c.type)}
            </div>
            {c.title && <p className="mt-1 font-cond text-lg font-bold uppercase tracking-[0.12em] text-muted">{c.title}</p>}
            <h2 className="mt-1 font-display text-4xl leading-none sm:text-5xl">{names}</h2>
            <p className="mt-2 font-cond text-muted">
              {[c.team, c.players[0]?.pos, c.players[0]?.nation].filter(Boolean).join(" · ")}
              {c.kicker && c.type !== "passports" ? ` · ${c.kicker}` : ""}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
              {facts.map(([k, v]) => (
                <div key={k} className="bg-panel px-3 py-2.5">
                  <dt className="field-label">{k}</dt>
                  <dd className="mt-1 font-cond text-base font-bold capitalize">{v}</dd>
                </div>
              ))}
            </dl>

            {c.stats && (
              <div className="mt-5">
                <h3 className="field-label">{statHeading(c)}</h3>
                <dl className="mt-2 grid grid-cols-6 gap-2">
                  {(c.sport !== "basketball" ? Object.keys(c.stats) : STAT_KEYS.filter((k) => c.stats![k] != null)).map((k) => (
                    <div key={k} className="rounded-md bg-panel-2 px-1 py-2 text-center">
                      <dd className="font-display text-xl leading-none">
                        {k === "3P%" ? c.stats![k].toFixed(1) : c.stats![k]}
                      </dd>
                      <dt className="mt-1 font-cond text-xs font-bold text-muted">{k}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {children}

            <button type="button" className="btn btn-ghost mt-6" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** A card that opens the full-screen view when tapped. For pages that show cards to look at. */
export function InspectableCard(props: CardProps & { label?: string }) {
  const [open, setOpen] = useState(false);
  const { label, ...card } = props;
  return (
    <>
      <button
        type="button"
        className="block w-full cursor-zoom-in text-left"
        onClick={() => setOpen(true)}
        aria-label={label ?? `Open ${card.card.players.map((p) => p.name).join(" & ")}`}
      >
        <Card {...card} small />
      </button>
      <AnimatePresence>{open && <CardViewer {...card} tilt onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
