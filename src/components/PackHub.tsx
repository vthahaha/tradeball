"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Rarity } from "@/lib/catalog/types";
import type { PackStatus, PackType, PulledCard } from "@/lib/packs";
import { Card, CardBack } from "./Card";
import { SportIcon } from "./SportIcon";

const PACKS: { type: PackType; name: string; sub: string }[] = [
  { type: "soccer", name: "Soccer", sub: "6 cards · 1 Rare+" },
  { type: "basketball", name: "Hoops", sub: "6 cards · 1 Rare+" },
  { type: "mixed", name: "Mixed", sub: "3 + 3 · 1 Rare+" },
];

const BIG: Rarity[] = ["legendary", "mythic"];

function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}:${String(sec).padStart(2, "0")}`;
}

export function PackArt({ type, small }: { type: PackType; small?: boolean }) {
  const p = PACKS.find((x) => x.type === type)!;
  return (
    <div className="tb-pack" data-pack={type}>
      <div className="tb-pack__body">
      <div className="tb-pack__brand">TRADEBALL</div>
      {type === "mixed" ? (
        <div className="flex" style={{ gap: "2cqw" }}>
          <SportIcon sport="soccer" className="tb-pack__icon" />
          <SportIcon sport="basketball" className="tb-pack__icon" />
        </div>
      ) : (
        <SportIcon sport={type === "soccer" ? "soccer" : "basketball"} className="tb-pack__icon" />
      )}
      <div className="tb-pack__name">{p.name}</div>
      {!small && <div className="tb-pack__sub">Series 1</div>}
      </div>
    </div>
  );
}

export function PackHub({ initialStatus }: { initialStatus: PackStatus }) {
  const router = useRouter();
  const now = useNow();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState<PackType | "daily" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<{ type: PackType; cards: PulledCard[] } | null>(null);

  // Take fresh server status after router.refresh() (adjust-state-during-render pattern).
  const [prevInitial, setPrevInitial] = useState(initialStatus);
  if (prevInitial !== initialStatus) {
    setPrevInitial(initialStatus);
    setStatus(initialStatus);
  }

  // When the timer runs out, refresh from the server.
  useEffect(() => {
    if (status.nextAt && now >= status.nextAt) router.refresh();
  }, [now, status.nextAt, router]);

  async function open(type: PackType) {
    setBusy(type);
    setError(null);
    try {
      const res = await fetch("/api/packs/open", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus(data.status);
      setOpening({ type, cards: data.cards });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function claimDaily() {
    setBusy("daily");
    setError(null);
    try {
      const res = await fetch("/api/packs/daily", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus(data.status);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const noPacks = status.total === 0;

  return (
    <>
      {/* Pack wallet */}
      <section className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-line bg-panel/80 px-5 py-4">
        <div>
          <div className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">Packs ready</div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl leading-none text-accent">{status.total}</span>
            <span className="font-cond text-sm text-muted">
              {status.timed}/{status.max} free{status.bonus > 0 ? ` + ${status.bonus} bonus` : ""}
            </span>
          </div>
        </div>
        <div className="min-w-36">
          <div className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">Next free pack</div>
          <div className="font-display text-3xl leading-tight">
            {status.nextAt ? fmt(status.nextAt - now) : <span className="text-muted">Bank full</span>}
          </div>
        </div>
        <div className="min-w-44 flex-1">
          <div className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Legendary guarantee
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-2">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(status.pity / status.pityLimit) * 100}%`,
                background: "linear-gradient(90deg, var(--r-epic), var(--r-legendary))",
              }}
            />
          </div>
          <div className="mt-1 font-cond text-xs text-muted">
            {status.pityLimit - status.pity} pack{status.pityLimit - status.pity === 1 ? "" : "s"} until a guaranteed
            Legendary+
          </div>
        </div>
        <button className="btn btn-ghost" onClick={claimDaily} disabled={!status.dailyClaimable || busy !== null}>
          {status.dailyClaimable ? "Claim daily pack" : "Daily claimed ✓"}
        </button>
      </section>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Pack shelf */}
      <section className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
        {PACKS.map((p) => (
          <div key={p.type} className="flex flex-col items-center gap-3 sm:gap-4">
            <motion.button
              type="button"
              aria-label={`Open ${p.name} pack`}
              className="w-full max-w-60 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={noPacks ? undefined : { y: -8, rotate: -1.5 }}
              whileTap={noPacks ? undefined : { scale: 0.97 }}
              disabled={noPacks || busy !== null}
              onClick={() => open(p.type)}
            >
              <PackArt type={p.type} />
            </motion.button>
            <div className="w-full text-center sm:w-auto">
              <div className="hidden font-cond text-sm text-muted sm:block">{p.sub}</div>
              <button
                className="btn btn-primary mt-2 w-full px-2 text-xs sm:w-auto sm:min-w-40 sm:px-4 sm:text-[0.95rem]"
                onClick={() => open(p.type)}
                disabled={noPacks || busy !== null}
              >
                {busy === p.type ? "Opening…" : "Open"}
              </button>
            </div>
          </div>
        ))}
      </section>

      <AnimatePresence>
        {opening && (
          <PackOpening
            key={opening.cards[0]?.instanceId}
            type={opening.type}
            cards={opening.cards}
            canOpenAnother={status.total > 0}
            onAnother={() => {
              const t = opening.type;
              setOpening(null);
              open(t);
            }}
            onClose={() => {
              setOpening(null);
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ───────────────────────────── Opening sequence ─────────────────────────────

function PackOpening({
  type,
  cards,
  canOpenAnother,
  onAnother,
  onClose,
}: {
  type: PackType;
  cards: PulledCard[];
  canOpenAnother: boolean;
  onAnother: () => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"pack" | "cards">("pack");
  const [flipped, setFlipped] = useState<boolean[]>(() => cards.map(() => false));
  const [spotlight, setSpotlight] = useState<PulledCard | null>(null);
  const allFlipped = flipped.every(Boolean);

  function flip(i: number) {
    if (flipped[i]) return;
    setFlipped((f) => f.map((v, j) => (j === i ? true : v)));
    const c = cards[i];
    if (BIG.includes(c.rarity) || c.serialNo) setTimeout(() => setSpotlight(c), 450);
  }

  function revealAll() {
    const next = flipped.findIndex((f) => !f);
    if (next === -1) return;
    // Flip the rest one after another; stop at a big pull so it gets its moment.
    let i = next;
    const step = () => {
      flip(i);
      const c = cards[i];
      i++;
      if (i < cards.length && !(BIG.includes(c.rarity) || c.serialNo)) setTimeout(step, 220);
    };
    step();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (spotlight) setSpotlight(null);
        else if (allFlipped) onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spotlight, allFlipped, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[#03050acc] px-4 py-8 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Pack opening"
    >
      {stage === "pack" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <motion.button
            type="button"
            className="w-56 cursor-pointer sm:w-64"
            aria-label="Tear open the pack"
            initial={{ scale: 0.6, y: 80, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: [0, -2, 2, -2, 2, 0] }}
            transition={{ duration: 0.6, rotate: { delay: 0.6, duration: 0.5, repeat: Infinity, repeatDelay: 1.2 } }}
            whileHover={{ scale: 1.04 }}
            onClick={() => setStage("cards")}
          >
            <PackArt type={type} />
          </motion.button>
          <p className="font-cond text-sm font-bold uppercase tracking-[0.25em] text-muted">Tap the pack to tear it open</p>
        </div>
      ) : (
        <>
          <div className="grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
            {cards.map((c, i) => (
              <motion.button
                type="button"
                key={c.instanceId}
                className="relative aspect-[5/7] w-full cursor-pointer [perspective:1000px]"
                initial={{ y: -200, opacity: 0, rotate: (i - 2.5) * 6 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                onClick={() => flip(i)}
                aria-label={flipped[i] ? c.players.map((p) => p.name).join(" & ") : `Flip card ${i + 1}`}
              >
                <motion.div
                  className="absolute inset-0 [transform-style:preserve-3d]"
                  animate={{ rotateY: flipped[i] ? 180 : 0 }}
                  transition={{ duration: 0.55, ease: [0.3, 1.4, 0.5, 1] }}
                >
                  <div className="absolute inset-0 [backface-visibility:hidden]">
                    <CardBack rarity={c.rarity} />
                  </div>
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <Card card={c} finish={c.finish} serialNo={c.serialNo} supply={c.supply} grade={c.grade} />
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!allFlipped ? (
              <button className="btn btn-primary min-w-40" onClick={revealAll}>
                Reveal all
              </button>
            ) : (
              <>
                {canOpenAnother && (
                  <button className="btn btn-primary min-w-40" onClick={onAnother}>
                    Open another
                  </button>
                )}
                <button className="btn btn-ghost min-w-32" onClick={onClose}>
                  Done
                </button>
              </>
            )}
          </div>
          {allFlipped && <PackSummary cards={cards} />}
        </>
      )}

      <AnimatePresence>{spotlight && <Spotlight card={spotlight} onClose={() => setSpotlight(null)} />}</AnimatePresence>
    </motion.div>
  );
}

function PackSummary({ cards }: { cards: PulledCard[] }) {
  const best = [...cards].sort((a, b) => b.ovr - a.ovr)[0];
  const shiny = cards.filter((c) => c.finish !== "standard").length;
  return (
    <p className="mt-4 text-center font-cond text-sm text-muted">
      Best pull: <span className="font-bold text-text">{best.players.map((p) => p.name).join(" & ")}</span> ({best.ovr})
      {shiny > 0 && ` · ${shiny} special finish${shiny > 1 ? "es" : ""}`}
    </p>
  );
}

const SPOT_LABEL: Partial<Record<Rarity, string>> = { legendary: "Legendary pull", mythic: "MYTHIC PULL" };

function Spotlight({ card, onClose }: { card: PulledCard; onClose: () => void }) {
  const label = card.serialNo
    ? card.supply === 1
      ? "ONE OF ONE"
      : `Numbered #${card.serialNo}/${card.supply}`
    : (SPOT_LABEL[card.rarity] ?? "Big pull");
  const color = card.rarity === "mythic" || card.supply === 1 ? "var(--r-mythic)" : "var(--r-legendary)";
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center gap-6 px-4"
      style={{ background: `radial-gradient(circle at 50% 45%, color-mix(in oklab, ${color} 35%, transparent), #03050af2 60%)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="font-display text-center text-5xl sm:text-7xl"
        style={{ color, textShadow: `0 0 40px ${color}` }}
        initial={{ scale: 2.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        {label}
      </motion.div>
      <motion.div
        className="w-64 sm:w-80"
        initial={{ scale: 0.4, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 14 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card card={card} finish={card.finish} serialNo={card.serialNo} supply={card.supply} grade={card.grade} />
      </motion.div>
      <p className="font-cond text-sm uppercase tracking-[0.25em] text-muted">Tap anywhere to continue</p>
    </motion.div>
  );
}
