"use client";

// Opening a pack, one card at a time. The cards come off the stack from least to most exciting,
// so the best pull is always last. Tap to turn a card, tap again to send it to the strip below.
// Legendary and up charge before they turn: the back glows and trembles in its rarity colour
// (longer for Mythic and one-of-ones; a Grail also fills the room with aurora light), then the
// stamp lands as it turns. Sound is synthesised and can be muted; phones that can, buzz.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { RARITIES, setLabel } from "@/lib/catalog";
import type { PulledCard } from "@/lib/packs";
import { buzz, playCharge, playFlip, playReveal, setSoundOn, soundOn } from "@/lib/sound";
import { Card, CardBack } from "./Card";

const FINISH_RANK: Record<string, number> = { standard: 0, foil: 1, holo: 2, gold: 4, black: 5, masterpiece: 6 };
const hype = (c: PulledCard) => RARITIES.indexOf(c.rarity) * 10 + (FINISH_RANK[c.finish] ?? 0) + (c.serialNo ? 3 : 0);

/** 0 = no build-up, 1 = Legendary or numbered, 2 = Mythic or one-of-one, 3 = Grail. */
export function pullLevel(c: PulledCard) {
  if (c.rarity === "grail") return 3;
  if (c.rarity === "mythic" || c.supply === 1) return 2;
  if (c.rarity === "legendary" || c.serialNo) return 1;
  return 0;
}
const CHARGE_MS = [0, 900, 1500, 2300];
const GLOW = ["var(--r-rare)", "var(--r-legendary)", "var(--r-mythic)", "var(--r-grail)"];

/** The stamp a big pull gets: serial first, then the tier. */
export function pullLabel(c: PulledCard) {
  if (c.serialNo) return c.supply === 1 ? "One of one" : `No. ${c.serialNo} of ${c.supply}`;
  if (c.rarity === "grail") return "Grail pull";
  if (c.rarity === "mythic") return "Mythic pull";
  return "Legend pull";
}

const setOf = (c: PulledCard) => setLabel(c.type);

export function PackDeal({ cards, onDone }: { cards: PulledCard[]; onDone: () => void }) {
  const reduce = useReducedMotion();
  const order = useMemo(
    () => cards.map((c, i) => [c, i] as const).sort((a, b) => hype(a[0]) - hype(b[0]) || a[1] - b[1]).map(([, i]) => i),
    [cards],
  );
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<"down" | "charging" | "up">("down");
  const [sound, setSound] = useState(soundOn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const card = cards[order[pos]];
  const level = pullLevel(card);
  const last = pos === cards.length - 1;

  const reveal = useCallback(() => {
    setPhase("up");
    playFlip();
    playReveal(card.rarity, !!card.serialNo);
    buzz(level >= 2 ? [50, 40, 120] : level === 1 ? [40, 30, 70] : 8);
  }, [card, level]);

  const advance = useCallback(() => {
    if (phase === "charging") return;
    if (phase === "down") {
      const ms = reduce ? 0 : CHARGE_MS[level];
      if (!ms) return reveal();
      setPhase("charging");
      playCharge(ms / 1000);
      buzz(level >= 2 ? [20, 60, 20, 60, 20] : [15, 80, 15]);
      timer.current = setTimeout(reveal, ms);
      return;
    }
    if (last) onDone();
    else {
      setPos((p) => p + 1);
      setPhase("down");
    }
  }, [phase, reduce, level, reveal, last, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        advance();
      } else if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, onDone]);

  const up = phase === "up";
  const shown = order.slice(0, up ? pos + 1 : pos).map((i) => cards[i]);
  const names = card.players.map((p) => p.name).join(" & ");
  const hint = phase === "charging" ? "…" : !up ? "Tap to turn it over" : last ? "Tap to see your pack" : "Tap for the next card";

  return (
    <div
      className="tb-deal flex w-full flex-1 flex-col items-center"
      data-level={level}
      data-phase={phase}
      style={{ "--glow": GLOW[level] } as CSSProperties}
    >
      <div className="tb-deal__aura" aria-hidden />

      <div className="relative z-10 flex w-full max-w-md items-center justify-between gap-3">
        <span className="field-label">
          Card {pos + 1} of {cards.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost px-3 py-1.5 text-sm"
            aria-pressed={sound}
            onClick={() => {
              setSoundOn(!sound);
              setSound(!sound);
            }}
          >
            {sound ? "Sound on" : "Sound off"}
          </button>
          <button type="button" className="btn btn-ghost px-3 py-1.5 text-sm" onClick={onDone}>
            Skip to the end
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 py-6">
        <AnimatePresence>
          {up && level > 0 && (
            <motion.div
              key={`stamp-${card.instanceId}`}
              className="whitespace-nowrap rounded-md border-[4px] px-4 py-1 font-display text-[clamp(1.4rem,7vw,2.75rem)]"
              style={{ color: "var(--glow)", borderColor: "var(--glow)" }}
              initial={reduce ? { opacity: 0 } : { scale: 2.4, rotate: -14, opacity: 0 }}
              animate={{ scale: 1, rotate: -4, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 22, delay: 0.18 }}
            >
              {pullLabel(card)}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative" style={{ width: "min(76vw, calc((100dvh - 17rem) * 5 / 7), 360px)" }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.button
              key={card.instanceId}
              type="button"
              className="tb-deal__card relative block aspect-[5/7] w-full cursor-pointer [perspective:1200px]"
              onClick={advance}
              aria-label={up ? `${names}. ${hint}` : hint}
              initial={reduce ? { opacity: 0 } : { y: -30, scale: 0.92, opacity: 0, rotate: -3 }}
              animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { y: 220, scale: 0.18, opacity: 0, transition: { duration: 0.35 } }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <motion.span
                className="absolute inset-0 block [transform-style:preserve-3d]"
                animate={{ rotateY: up ? 180 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.3, 1.25, 0.5, 1] }}
              >
                <span className="tb-deal__back absolute inset-0 block [backface-visibility:hidden]">
                  <CardBack rarity={card.rarity} sport={card.sport} />
                </span>
                <span className="absolute inset-0 block [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <Card card={card} finish={card.finish} serialNo={card.serialNo} supply={card.supply} grade={card.grade} />
                </span>
              </motion.span>
              {up && card.isNew && (
                <motion.span
                  className="tb-new-stamp"
                  aria-hidden
                  initial={{ scale: 2.2, rotate: -22, opacity: 0 }}
                  animate={{ scale: 1, rotate: -9, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 520, damping: 20 }}
                >
                  New
                </motion.span>
              )}
            </motion.button>
          </AnimatePresence>
        </div>

        <div className="min-h-12 text-center" aria-live="polite">
          {up ? (
            <>
              <div className="font-display text-2xl leading-none">{names}</div>
              <div className="mt-1 font-cond text-sm font-bold uppercase tracking-[0.16em]" style={{ color: `var(--r-${card.rarity})` }}>
                {setOf(card)} · {card.rarity}
              </div>
            </>
          ) : (
            <div className="font-cond text-sm font-bold uppercase tracking-[0.22em] text-muted">{hint}</div>
          )}
        </div>
      </div>

      {/* the strip: what has come out so far, and what is left on the stack */}
      <ol className="relative z-10 flex w-full max-w-xl flex-wrap justify-center gap-1.5" aria-label="Cards so far">
        {shown.map((c) => (
          <li key={c.instanceId} className="w-9 sm:w-11">
            <Card card={c} finish={c.finish} serialNo={c.serialNo} supply={c.supply} tilt={false} />
          </li>
        ))}
        {Array.from({ length: cards.length - shown.length }, (_, i) => (
          <li key={`left-${i}`} className="w-9 opacity-40 sm:w-11" aria-hidden>
            <CardBack sport={cards[0]?.sport} />
          </li>
        ))}
      </ol>
    </div>
  );
}
