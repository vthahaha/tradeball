"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { INSERT_DESIGNS } from "@/lib/catalog";
import { INSERTS_PER_PACK } from "@/lib/odds";
import type { Rarity } from "@/lib/catalog/types";
import type { PackStatus, PackType, PulledCard } from "@/lib/packs";
import { Card, CardBack } from "./Card";
import { CardViewer } from "./CardViewer";
import { PackDeal } from "./PackDeal";
import { CheckIcon, TicketIcon } from "./Icons";
import { SportIcon } from "./SportIcon";

/** `inserts`: whether this pack's last slots are inserts (soccer has no insert sets yet). */
const PACKS: { type: PackType; name: string; gate: string; seat: string; inserts: boolean }[] = [
  { type: "basketball", name: "Hoops", gate: "BB", seat: "8", inserts: true },
  { type: "soccer", name: "Champions", gate: "FC", seat: "8", inserts: false },
  { type: "football", name: "Gridiron", gate: "FB", seat: "8", inserts: false },
  { type: "baseball", name: "Diamond", gate: "BB", seat: "8", inserts: false },
  { type: "hockey", name: "Faceoff", gate: "HK", seat: "8", inserts: false },
];
const hasInserts = (p: (typeof PACKS)[number]) => p.inserts && INSERT_DESIGNS.length > 0;

/** The ball printed on the wrapper. */
function PackBall({ type }: { type: PackType }) {
  if (type === "baseball")
    return (
      <svg className="tb-pack__ball" viewBox="0 0 100 100" aria-hidden>
        {/* a baseball: white hide, two curved seams with their red stitches */}
        <circle cx="50" cy="50" r="46" fill="#f7f7f2" stroke="#14213d" strokeWidth="2.4" />
        <path d="M24 12 C40 32 40 68 24 88 M76 12 C60 32 60 68 76 88" fill="none" stroke="#c62828" strokeWidth="2.6" />
        <path
          d="M30 22 l6 -3 M33 30 l7 -2 M35 38 l7 -1 M36 46 l7 0 M36 54 l7 0 M35 62 l7 1 M33 70 l7 2 M30 78 l6 3 M70 22 l-6 -3 M67 30 l-7 -2 M65 38 l-7 -1 M64 46 l-7 0 M64 54 l-7 0 M65 62 l-7 1 M67 70 l-7 2 M70 78 l-6 3"
          fill="none"
          stroke="#c62828"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  if (type === "hockey")
    return (
      <svg className="tb-pack__ball" viewBox="0 0 100 100" aria-hidden>
        {/* a puck, tipped toward us: black rubber, a knurled rim, a sheen on the face */}
        <ellipse cx="50" cy="62" rx="44" ry="20" fill="#0b0f17" stroke="#14213d" strokeWidth="2.4" />
        <rect x="6" y="40" width="88" height="22" fill="#0b0f17" />
        <ellipse cx="50" cy="40" rx="44" ry="20" fill="#1d2433" stroke="#14213d" strokeWidth="2.4" />
        <path d="M10 46 V58 M18 49 V61 M26 51 V63 M34 52 V64 M42 53 V65 M50 53 V66 M58 53 V65 M66 52 V64 M74 51 V63 M82 49 V61 M90 46 V58" stroke="#2b3446" strokeWidth="2" />
        <ellipse cx="40" cy="35" rx="18" ry="5" fill="#ffffff1f" />
      </svg>
    );
  if (type === "football")
    return (
      <svg className="tb-pack__ball" viewBox="0 0 100 100" aria-hidden>
        {/* a football end-on at an angle, with its laces */}
        <g transform="rotate(-35 50 50)">
          <ellipse cx="50" cy="50" rx="46" ry="29" fill="#8a4a24" stroke="#14213d" strokeWidth="2.4" />
          <path d="M16 36 Q12 50 16 64 M84 36 Q88 50 84 64" fill="none" stroke="#f7f7f2" strokeWidth="3.2" />
          <path d="M34 50 H66" stroke="#f7f7f2" strokeWidth="3" />
          <path d="M38 44 V56 M44 44 V56 M50 44 V56 M56 44 V56 M62 44 V56" stroke="#f7f7f2" strokeWidth="2.6" />
        </g>
      </svg>
    );
  if (type === "soccer")
    return (
      <svg className="tb-pack__ball" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="46" fill="#f7f7f2" stroke="#14213d" strokeWidth="2.4" />
        {/* a centre pentagon, five seams out to five cut-off panels at the rim */}
        <path d="M50 33 L66 45 L60 64 L40 64 L34 45 Z" fill="#14213d" />
        <path
          d="M50 33 V12 M66 45 L86 38 M60 64 L72 82 M40 64 L28 82 M34 45 L14 38"
          fill="none"
          stroke="#14213d"
          strokeWidth="2.4"
        />
        <path d="M38 5 L50 12 L62 5 A46 46 0 0 0 38 5 Z" fill="#14213d" />
        <path d="M95 44 L86 38 L89 26 A46 46 0 0 1 95 44 Z" fill="#14213d" />
        <path d="M80 87 L72 82 L84 76 A46 46 0 0 1 80 87 Z" fill="#14213d" />
        <path d="M20 87 L28 82 L16 76 A46 46 0 0 0 20 87 Z" fill="#14213d" />
        <path d="M5 44 L14 38 L11 26 A46 46 0 0 0 5 44 Z" fill="#14213d" />
      </svg>
    );
  return (
    <svg className="tb-pack__ball" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="46" fill="#e2691f" stroke="#14213d" strokeWidth="2.4" />
      <path
        d="M50 4 V96 M4 50 H96 M20 14 C34 30 34 70 20 86 M80 14 C66 30 66 70 80 86"
        fill="none"
        stroke="#14213d"
        strokeWidth="2.4"
      />
    </svg>
  );
}

const BIG: Rarity[] = ["legendary", "mythic", "grail"];
const isBig = (c: PulledCard) => BIG.includes(c.rarity) || !!c.serialNo;

// One shared 1-second clock. The server snapshot is 0, so the countdown renders a
// placeholder on the server and starts ticking only in the browser (no hydration mismatch).
let clockNow = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;
function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  if (!clockTimer) {
    clockNow = Date.now();
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    clockListeners.delete(cb);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}
function useNow() {
  return useSyncExternalStore(
    subscribeClock,
    () => clockNow || Date.now(),
    () => 0,
  );
}

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

const pad = (n: number) => String(n).padStart(4, "0");

/** A pack: a foil hobby wrapper with a crimped end to tear. `no` is the player's next pack number. */
export function PackArt({ type, no, torn = false }: { type: PackType; no: number; torn?: boolean }) {
  const p = PACKS.find((x) => x.type === type)!;
  const reduce = useReducedMotion();
  return (
    <div className="tb-pack" data-pack={type}>
      <div className="tb-pack__ticket">
        <div className="tb-pack__body">
          <PackBall type={type} />
          <div className="tb-pack__label">
            <div className="tb-pack__brand">
              <SportIcon sport={type} />
              <span className="truncate">Gate 7 · Series 1</span>
            </div>
            <div className="tb-pack__name">{p.name}</div>
            <div className="tb-pack__fields">
              <div>
                Cards<b>{p.seat}</b>
              </div>
              <div>
                Floor<b>Rare+</b>
              </div>
              {hasInserts(p) && (
                <div>
                  Inserts<b>{INSERTS_PER_PACK}</b>
                </div>
              )}
            </div>
          </div>
        </div>
        <motion.div
          className="tb-pack__stub"
          animate={torn ? (reduce ? { opacity: 0 } : { rotate: 16, x: "18%", y: "120%", opacity: 0 }) : {}}
          transition={{ duration: 0.42, ease: [0.5, 0, 0.75, 0] }}
          style={{ transformOrigin: "0% 0%" }}
        >
          <span className="tb-pack__tear">Tear here</span>
          <span className="tb-pack__no">No. {pad(no)}</span>
          <span className="tb-pack__barcode" />
        </motion.div>
      </div>
    </div>
  );
}

/** The guarantee as fixed cells: filled = a pack opened since the last Legendary. */
function PityCells({ value, limit }: { value: number; limit: number }) {
  return (
    <div className="mt-2 grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[3px]" aria-hidden>
      {Array.from({ length: limit }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 rounded-[1px] ${i < value ? "bg-hoops" : "border border-line"}`}
          style={i === limit - 1 ? { background: "var(--stamp)", border: 0 } : undefined}
        />
      ))}
    </div>
  );
}

export function PackHub({ initialStatus, nextNo }: { initialStatus: PackStatus; nextNo: number }) {
  const router = useRouter();
  const now = useNow();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState<PackType | "daily" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<{ type: PackType; cards: PulledCard[]; no: number } | null>(null);
  const [opened, setOpened] = useState(0);

  // Take fresh server status after router.refresh() (adjust-state-during-render pattern).
  const [prevInitial, setPrevInitial] = useState(initialStatus);
  if (prevInitial !== initialStatus) {
    setPrevInitial(initialStatus);
    setStatus(initialStatus);
  }

  // When the timer runs out, refresh from the server.
  useEffect(() => {
    if (now && status.nextAt && now >= status.nextAt) router.refresh();
  }, [now, status.nextAt, router]);

  const no = nextNo + opened;

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
      setOpening({ type, cards: data.cards, no });
      setOpened((n) => n + 1);
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

  const noPacks = status.total === 0 && !status.unlimited;
  const toGo = status.pityLimit - status.pity;

  return (
    <div className="flex flex-col">
      {/* Ticket shelf */}
      <section aria-label="Packs" className="flex w-full max-w-xl flex-col gap-6">
        {PACKS.map((p) => (
          <motion.button
            key={p.type}
            type="button"
            aria-label={`Tear a ${p.name} ticket to open a pack`}
            className="group block w-full cursor-pointer text-left disabled:cursor-not-allowed disabled:opacity-45"
            whileHover={noPacks ? undefined : { y: -6, rotate: -0.8 }}
            whileTap={noPacks ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            disabled={noPacks || busy !== null}
            onClick={() => open(p.type)}
          >
            <PackArt type={p.type} no={no} />
            <span className="mt-2 flex items-center justify-between font-cond text-sm font-bold text-muted">
              <span>8 cards · 1 Rare or better{hasInserts(p) ? ` · ${INSERTS_PER_PACK} inserts` : ""}</span>
              <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {busy === p.type ? "Tearing…" : "Tear →"}
              </span>
            </span>
          </motion.button>
        ))}
      </section>

      {error && (
        <p role="alert" className="mt-5 rounded-md border border-stamp/50 bg-stamp/10 px-4 py-2.5 text-sm font-semibold text-stamp">
          {error}
        </p>
      )}

      {/* Season-ticket wallet */}
      <section
        aria-label="Your ticket wallet"
        className="ticket-panel order-first mb-6 grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4 sm:grid-cols-[auto_auto_auto_1fr_auto] sm:items-center sm:gap-x-8 sm:px-6 sm:py-5 md:order-none md:mb-0 md:mt-8"
      >
        <div>
          <div className="field-label">Tickets in wallet</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-5xl leading-none text-accent">{status.unlimited ? "∞" : status.total}</span>
            <span className="font-cond text-sm font-semibold text-muted">
              {status.unlimited
                ? "Admin · unlimited"
                : `${status.timed}/${status.max} free${status.bonus > 0 ? ` + ${status.bonus} bonus` : ""}`}
            </span>
          </div>
        </div>
        <div className="perf-v hidden self-stretch sm:block" aria-hidden />
        <div>
          <div className="field-label">Next free ticket</div>
          <div className="mt-1 font-display text-3xl leading-none" style={{ fontStretch: "100%" }}>
            {!status.nextAt ? (
              <span className="text-muted">Wallet full</span>
            ) : now ? (
              fmt(status.nextAt - now)
            ) : (
              <span className="text-muted">–:––</span>
            )}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="field-label">
            Legendary guarantee · <span className="text-text">{toGo} to go</span>
          </div>
          <PityCells value={status.pity} limit={status.pityLimit} />
        </div>
        <button
          className={`btn col-span-2 sm:col-span-1 ${status.dailyClaimable ? "btn-paper" : "btn-ghost"}`}
          onClick={claimDaily}
          disabled={!status.dailyClaimable || busy !== null}
        >
          {status.dailyClaimable ? (
            <>
              <TicketIcon className="size-4" /> Claim daily ticket
            </>
          ) : (
            <>
              <CheckIcon className="size-4" /> Daily claimed
            </>
          )}
        </button>
      </section>

      <AnimatePresence>
        {opening && (
          <PackOpening
            key={opening.cards[0]?.instanceId}
            type={opening.type}
            no={opening.no}
            cards={opening.cards}
            canOpenAnother={status.total > 0 || status.unlimited}
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
    </div>
  );
}

// ───────────────────────────── Opening sequence ─────────────────────────────

function PackOpening({
  type,
  no,
  cards,
  canOpenAnother,
  onAnother,
  onClose,
}: {
  type: PackType;
  no: number;
  cards: PulledCard[];
  canOpenAnother: boolean;
  onAnother: () => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"pack" | "torn" | "deal" | "cards">("pack");
  const [flipped, setFlipped] = useState<boolean[]>(() => cards.map(() => false));
  // a face-up card opens in the full-screen viewer
  const [inspect, setInspect] = useState<number | null>(null);
  const allFlipped = flipped.every(Boolean);

  function tear() {
    if (stage !== "pack") return;
    setStage("torn");
    setTimeout(() => setStage("deal"), 520);
  }

  function flip(i: number) {
    if (flipped[i]) {
      setInspect(i);
      return;
    }
    setFlipped((f) => f.map((v, j) => (j === i ? true : v)));
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
      if (i < cards.length && !isBig(c)) setTimeout(step, 200);
    };
    step();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (inspect !== null) return; // the viewer closes itself
        if (allFlipped) onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspect, allFlipped, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-bg-2 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Opening a pack"
    >
      {stage === "deal" ? (
        <PackDeal
          cards={cards}
          onDone={() => {
            setFlipped(cards.map(() => true));
            setStage("cards");
          }}
        />
      ) : stage !== "cards" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <motion.button
            type="button"
            className="w-[min(92vw,520px)] cursor-pointer"
            aria-label="Tear the ticket"
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={stage === "torn" ? { scale: 1.02, y: -6, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={tear}
            autoFocus
          >
            <PackArt type={type} no={no} torn={stage === "torn"} />
          </motion.button>
          <p className="font-cond text-sm font-bold uppercase tracking-[0.22em] text-muted">
            {stage === "torn" ? "Admitted" : "Tap the ticket to tear the stub"}
          </p>
        </div>
      ) : (
        <div className="my-auto flex w-full flex-col items-center">
          <div className="grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-8">
            {cards.map((c, i) => (
              <motion.button
                type="button"
                key={c.instanceId}
                className="relative aspect-[5/7] w-full cursor-pointer [perspective:1000px]"
                initial={{ y: -40, x: -60, opacity: 0, rotate: -8 }}
                animate={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 24 }}
                onClick={() => flip(i)}
                aria-label={
                  flipped[i]
                    ? `${c.players.map((p) => p.name).join(" & ")}${c.isNew ? ", new to your binder" : ""}. Open it`
                    : `Flip card ${i + 1}`
                }
              >
                <motion.div
                  className="absolute inset-0 [transform-style:preserve-3d]"
                  animate={{ rotateY: flipped[i] ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: [0.3, 1.3, 0.5, 1] }}
                >
                  <div className="absolute inset-0 [backface-visibility:hidden]">
                    <CardBack rarity={c.rarity} />
                  </div>
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <Card card={c} finish={c.finish} serialNo={c.serialNo} supply={c.supply} grade={c.grade} />
                  </div>
                </motion.div>
                <AnimatePresence>
                  {flipped[i] && c.isNew && (
                    <motion.span
                      className="tb-new-stamp"
                      aria-hidden
                      initial={{ scale: 2.2, rotate: -22, opacity: 0 }}
                      animate={{ scale: 1, rotate: -9, opacity: 1 }}
                      transition={{ delay: 0.32, type: "spring", stiffness: 520, damping: 20 }}
                    >
                      New
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!allFlipped ? (
              <button className="btn btn-primary min-w-40" onClick={revealAll}>
                Flip them all
              </button>
            ) : (
              <>
                {canOpenAnother && (
                  <button className="btn btn-primary min-w-40" onClick={onAnother}>
                    Tear another
                  </button>
                )}
                <button className="btn btn-ghost min-w-32" onClick={onClose}>
                  Done
                </button>
              </>
            )}
          </div>
          {allFlipped && <PackSummary cards={cards} />}
        </div>
      )}

      <AnimatePresence>
        {inspect !== null && (
          <CardViewer
            key={cards[inspect].instanceId}
            card={cards[inspect]}
            finish={cards[inspect].finish}
            serialNo={cards[inspect].serialNo}
            supply={cards[inspect].supply}
            grade={cards[inspect].grade}
            onClose={() => setInspect(null)}
            onPrev={inspect > 0 && flipped[inspect - 1] ? () => setInspect(inspect - 1) : undefined}
            onNext={inspect < cards.length - 1 && flipped[inspect + 1] ? () => setInspect(inspect + 1) : undefined}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PackSummary({ cards }: { cards: PulledCard[] }) {
  const best = [...cards].sort((a, b) => b.ovr - a.ovr)[0];
  const shiny = cards.filter((c) => c.finish !== "standard").length;
  const fresh = cards.filter((c) => c.isNew).length;
  return (
    <p className="mt-4 text-center font-cond text-sm font-semibold text-muted">
      Best pull: <span className="font-bold text-text">{best.players.map((p) => p.name).join(" & ")}</span> ({best.ovr})
      {fresh > 0 && ` · ${fresh} new to your binder`}
      {shiny > 0 && ` · ${shiny} special finish${shiny > 1 ? "es" : ""}`}
    </p>
  );
}
