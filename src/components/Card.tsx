"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { headshotUrl, INSERT_NAMES, isInsert, SET_NAME, teamColors, type CardView, type Finish, type Rarity } from "@/lib/catalog";

export interface CardProps {
  card: CardView;
  finish?: Finish;
  serialNo?: number | null;
  supply?: number | null;
  grade?: number | null;
  missing?: boolean;
  tilt?: boolean;
  className?: string;
}

/** Rarity is the jersey edition. */
export const EDITION: Record<Rarity, string> = {
  common: "Home",
  uncommon: "Away",
  rare: "Alternate",
  epic: "City",
  legendary: "Classic",
  mythic: "Game-worn",
};

const FINISH_LABEL: Record<Finish, string | null> = {
  standard: null,
  foil: "Foil",
  holo: "Holo",
  gold: "Gold",
  black: "Black",
  masterpiece: "Masterpiece",
};

// ── colour ──

const PAPER = "#f4f2ea";
const INK = "#14213d";
const CITY = "#17181c";
const CREAM = "#ece0c2";
const GOLD = "#d4a72c";

function rgb(hex: string): [number, number, number] {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  const n = m ? parseInt(m[1], 16) : 0x333333;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum(hex: string) {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
function mix(a: string, b: string, t: number) {
  const [p, q] = [rgb(a), rgb(b)];
  return "#" + p.map((c, i) => Math.round(c + (q[i] - c) * t).toString(16).padStart(2, "0")).join("");
}
/** First candidate that reads on `ground`, else whichever reads best. */
function onto(ground: string, candidates: string[], min = 2.4) {
  return candidates.find((c) => contrast(ground, c) >= min) ?? [...candidates].sort((a, b) => contrast(ground, b) - contrast(ground, a))[0];
}

interface Kit {
  fab: string; // jersey fabric
  num: string; // twill number + wordmark
  trim: string; // collar, armholes, hem
}

/** The jersey for an edition, from the team's two colours; numbered finishes restitch it. */
function kitFor(rarity: Rarity, team: string, finish: Finish): Kit {
  const [t1, t2] = teamColors(team);
  let kit: Kit;
  switch (rarity) {
    case "common": {
      const num = onto(PAPER, [t1, t2, INK], 3);
      kit = { fab: PAPER, num, trim: num };
      break;
    }
    case "uncommon": {
      const num = onto(t1, [t2, PAPER, INK]);
      kit = { fab: t1, num, trim: num };
      break;
    }
    case "rare": {
      const fab = contrast(t2, PAPER) > 1.35 && contrast(t2, t1) > 1.25 ? t2 : mix(t1, "#000000", 0.5);
      kit = { fab, num: onto(fab, [t1, PAPER, INK]), trim: onto(fab, [PAPER, t1, INK]) };
      break;
    }
    case "epic": {
      const num = onto(CITY, [t1, t2, PAPER], 2.6);
      kit = { fab: CITY, num, trim: num };
      break;
    }
    case "legendary":
      kit = { fab: CREAM, num: onto(CREAM, [t1, t2, INK], 3), trim: GOLD };
      break;
    default:
      kit = { fab: mix(t1, "#000000", 0.35), num: PAPER, trim: GOLD };
  }
  if (finish === "gold" || finish === "masterpiece") kit = { ...kit, num: GOLD, trim: GOLD };
  if (finish === "black") kit = { fab: "#0b0b0d", num: "#c9ced6", trim: "#c9ced6" };
  return kit;
}

function kitStyle(kit: Kit, t1: string, t2: string, f1: string): CSSProperties {
  // the twill's stitched border: a colour that separates the number from itself
  const edge = onto(kit.num, [t2, t1, kit.fab, INK, PAPER].filter((c) => c !== kit.num), 1.8);
  return {
    "--fab": kit.fab,
    "--num": kit.num,
    "--edge": edge,
    "--trim": kit.trim,
    "--on-fab": onto(kit.fab, [PAPER, INK], 4.5),
    "--on-trim": onto(kit.trim, [PAPER, INK], 4.5),
    "--t1": t1,
    "--t2": t2,
    "--f1": f1,
  } as CSSProperties;
}

// ── text ──

function initials(name: string) {
  const parts = name.replace(/[^\p{L}\s'-]/gu, "").split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function splitName(name: string): [string, string] {
  const parts = name.split(" ");
  return parts.length > 1 ? [parts[0], parts.slice(1).join(" ")] : ["", name];
}

/**
 * The surname arched across the chest. The size is fitted to the length and, past a
 * dozen letters, the text is squeezed to the arc's width, so a name never clips.
 */
function Wordmark({ text, top = false }: { text: string; top?: boolean }) {
  const id = useId();
  const len = Math.max(text.length, 3);
  const size = Math.min(12, 84 / (len * 0.8));
  const squeeze = len * 0.8 * size > 82;
  return (
    <svg className={`tb-card__wordmark ${top ? "is-top" : ""}`} viewBox="0 0 100 30" aria-hidden>
      <path id={id} d="M7 27 Q50 5 93 27" fill="none" />
      <text fontSize={size} textAnchor="middle" {...(squeeze ? { textLength: 82, lengthAdjust: "spacingAndGlyphs" } : {})}>
        <textPath href={`#${id}`} startOffset="50%">
          {text.toUpperCase()}
        </textPath>
      </text>
    </svg>
  );
}

/** The jersey: fabric, cut and hem. Front, reverse and face-down back all wear it. */
function Jersey({
  className,
  dataset,
  style,
  hem,
  children,
  label,
  tiltRef,
  onMove,
  onLeave,
}: {
  className?: string;
  dataset: Record<string, string | undefined>;
  style: CSSProperties;
  hem: ReactNode;
  children: ReactNode;
  label?: string;
  tiltRef?: React.Ref<HTMLDivElement>;
  onMove?: (e: React.PointerEvent) => void;
  onLeave?: () => void;
}) {
  const data = Object.fromEntries(Object.entries(dataset).map(([k, v]) => [`data-${k}`, v]));
  return (
    <div
      ref={tiltRef}
      className={`tb-card ${className ?? ""}`}
      {...data}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <div className="tb-card__stock">
        <div className="tb-card__face">
          <div className="tb-card__art">{children}</div>
          <div className="tb-card__hem">{hem}</div>
          <div className="tb-card__collar" aria-hidden />
        </div>
        <div className="tb-card__shine" />
        <div className="tb-card__glare" />
      </div>
    </div>
  );
}

function JockTag({ ovr, pos }: { ovr: number | string; pos: string }) {
  return (
    <div className="tb-card__jock">
      <b>{ovr}</b>
      <span>{pos}</span>
    </div>
  );
}

function EditionTag({ rarity, label }: { rarity: Rarity; label: string }) {
  return (
    <div className="tb-card__edition">
      <b>{rarity}</b>
      <span>{label}</span>
    </div>
  );
}

function metaLine(card: CardView) {
  const [p1, p2] = card.players;
  if (card.type === "duo" && p2) return `${p1.team}${p2.team !== p1.team ? ` / ${p2.team}` : ""}`;
  if (card.meta) return card.meta;
  if (card.fromTeam) return `${card.fromTeam} → ${card.team}`;
  if (card.type === "rookie" && p1.pick) return `${p1.team} · Pick ${p1.pick}${p1.college ? ` · ${p1.college}` : ""}`;
  return `${card.team}${p1.nation ? ` · ${p1.nation}` : ""}`;
}

function SerialLine({ finish, serialNo, supply, grade }: Pick<CardProps, "finish" | "serialNo" | "supply" | "grade">) {
  return (
    <span className="tb-card__serial">
      {serialNo && supply ? (
        <b>{supply === 1 ? "No. 1 of 1" : `No. ${serialNo}/${supply}`}</b>
      ) : (
        <>
          {SET_NAME}
          {finish && FINISH_LABEL[finish] ? ` · ${FINISH_LABEL[finish]}` : ""}
        </>
      )}
      {grade != null && <i className={grade === 10 ? "is-gem" : ""}>G{grade}</i>}
    </span>
  );
}

function useCardLook(card: CardView, finish: Finish) {
  const [t1, t2] = teamColors(card.team);
  const [f1] = card.fromTeam ? teamColors(card.fromTeam) : [t1];
  const kit = kitFor(card.rarity, card.team, finish);
  const insert = isInsert(card.type);
  const isDuo = card.type === "duo" && !!card.players[1];
  const singleGame = !!card.statLine?.endsWith(" game");
  const typeLabel = insert ? (INSERT_NAMES[card.type] ?? card.type) : card.type === "rookie" ? "Rookie" : isDuo ? "Duo" : null;
  return { style: kitStyle(kit, t1, t2, f1), insert, isDuo, singleGame, typeLabel };
}

const fmtStat = (singleGame: boolean, v: number) => (singleGame && Number.isInteger(v) ? String(v) : v.toFixed(1));

// ── front ──

export function Card({ card, finish = "standard", serialNo, supply, grade, missing, tilt = true, className }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [p1, p2] = card.players;
  const { style, insert, isDuo, singleGame, typeLabel } = useCardLook(card, finish);
  // Base and rookie cards wear the ESPN headshot; inserts show their splash art once one
  // is chosen (insert-art.ts). Without either, the twill number carries the card.
  const imgSrc = insert ? card.art : !isDuo && p1.espnId ? headshotUrl(p1.espnId) : undefined;
  const showImg = !!imgSrc && !imgFailed;
  const [first, last] = isDuo ? ["", `${splitName(p1.name)[1]} & ${splitName(p2.name)[1]}`] : splitName(p1.name);
  const twill = isDuo ? "" : p1.jersey || initials(p1.name);
  const statEntries = singleGame && card.stats ? Object.entries(card.stats) : [];

  function onMove(e: React.PointerEvent) {
    if (!tilt || missing || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const s = ref.current.style;
    s.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    s.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    s.setProperty("--gx", `${x * 100}%`);
    s.setProperty("--gy", `${y * 100}%`);
    s.setProperty("--go", "1");
  }
  function onLeave() {
    const s = ref.current?.style;
    if (!s) return;
    s.setProperty("--ry", "0deg");
    s.setProperty("--rx", "0deg");
    s.setProperty("--go", "0");
  }

  const name = isDuo ? last : p1.name;
  return (
    <Jersey
      tiltRef={ref}
      onMove={onMove}
      onLeave={onLeave}
      className={`${missing ? "is-missing" : ""} ${className ?? ""}`}
      dataset={{
        rarity: card.rarity,
        edition: EDITION[card.rarity].toLowerCase().replace(/[^a-z]/g, ""),
        finish,
        type: card.type,
        art: showImg ? (insert ? "splash" : "headshot") : "none",
      }}
      style={style}
      label={`${name}, ${card.rarity} ${insert ? typeLabel : card.type}${finish !== "standard" ? `, ${finish}` : ""}, ${card.ovr} overall`}
      hem={
        <>
          <JockTag ovr={card.ovr} pos={isDuo ? "Duo" : p1.pos} />
          <div className="tb-card__hemtext">
            <span className="tb-card__meta">{metaLine(card)}</span>
            <SerialLine finish={finish} serialNo={serialNo} supply={supply} grade={grade} />
          </div>
          <EditionTag rarity={card.rarity} label={insert ? "Insert" : EDITION[card.rarity]} />
        </>
      }
    >
      {twill && <div className="tb-card__mono">{twill}</div>}
      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element -- ESPN cut-outs / chosen splash art, hotlinked on purpose
        <img
          className={insert ? "tb-card__splash" : "tb-card__face-img"}
          src={imgSrc}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      )}
      <div className="tb-card__chest">
        <Wordmark text={last} />
        {first && <span className="tb-card__first">{first}</span>}
      </div>
      {typeLabel && <div className="tb-card__type">{typeLabel}</div>}
      {insert && (card.title || card.kicker) && (
        <div className="tb-card__moment">
          {card.kicker && <small>{card.kicker}</small>}
          {card.title}
        </div>
      )}
      {statEntries.length > 0 && (
        <div className="tb-card__box" title={card.statLine ?? undefined}>
          {statEntries.map(([k, v]) => (
            <div key={k}>
              <b>{fmtStat(true, v)}</b>
              <span>{k}</span>
            </div>
          ))}
        </div>
      )}
    </Jersey>
  );
}

// ── reverse: the jersey back, with the stat sheet ──

export function CardReverse({ card, finish = "standard", serialNo, supply, grade, className }: CardProps) {
  const [p1, p2] = card.players;
  const { style, insert, isDuo, singleGame, typeLabel } = useCardLook(card, finish);
  const surname = isDuo ? `${splitName(p1.name)[1]} & ${splitName(p2.name)[1]}` : splitName(p1.name)[1];
  const twill = isDuo ? "" : p1.jersey || initials(p1.name);
  const stats = card.stats ? Object.entries(card.stats) : [];
  return (
    <Jersey
      className={`is-reverse ${className ?? ""}`}
      dataset={{ rarity: card.rarity, edition: EDITION[card.rarity].toLowerCase().replace(/[^a-z]/g, ""), finish, type: card.type, art: "none" }}
      style={style}
      label={`Back of ${isDuo ? surname : p1.name}`}
      hem={
        <>
          <JockTag ovr={card.ovr} pos={isDuo ? "Duo" : p1.pos} />
          <div className="tb-card__hemtext">
            <span className="tb-card__meta">{metaLine(card)}</span>
            <SerialLine finish={finish} serialNo={serialNo} supply={supply} grade={grade} />
          </div>
          <EditionTag rarity={card.rarity} label={insert ? (typeLabel ?? "Insert") : EDITION[card.rarity]} />
        </>
      }
    >
      <div className="tb-card__chest is-back">
        <Wordmark text={surname} top />
      </div>
      {twill && <div className="tb-card__mono is-back">{twill}</div>}
      <div className="tb-card__sheet">
        {stats.length > 0 ? (
          <>
            <div className="tb-card__sheet-grid">
              {stats.map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <b>{fmtStat(singleGame, v)}</b>
                </div>
              ))}
            </div>
            <p className="tb-card__sheet-src">
              {singleGame ? [card.kicker, card.statLine].filter(Boolean).join(" · ") : card.statLine ? `${card.statLine} per game` : ""}
            </p>
          </>
        ) : (
          <p className="tb-card__sheet-note">{card.note ?? "No stats yet"}</p>
        )}
      </div>
    </Jersey>
  );
}

// ── turnable: front and back on one card ──

export function TurnableCard(props: CardProps) {
  const [back, setBack] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative aspect-[5/7] w-full [perspective:1200px]">
        <motion.div
          className="absolute inset-0 [transform-style:preserve-3d]"
          animate={{ rotateY: back ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.42, ease: [0.3, 1.25, 0.5, 1] }}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]" aria-hidden={back}>
            <Card {...props} />
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden={!back}>
            <CardReverse {...props} />
          </div>
        </motion.div>
      </div>
      <button type="button" className="btn btn-ghost px-4 py-1.5 text-sm" onClick={() => setBack((b) => !b)} aria-pressed={back}>
        {back ? "Show the front" : "Turn it around"}
      </button>
    </div>
  );
}

// ── face-down back (pack reveal) ──

/** The Gate 7 house jersey, folded face-down. The edition tag gives the rarity away before the flip. */
export function CardBack({ rarity, className }: { rarity?: string; className?: string }) {
  const r = (rarity as Rarity) ?? "common";
  const style = {
    "--fab": "#1b2a52",
    "--num": PAPER,
    "--edge": "#ff7a45",
    "--trim": "#ff7a45",
    "--on-fab": PAPER,
    "--on-trim": INK,
  } as CSSProperties;
  return (
    <Jersey
      className={`is-house ${className ?? ""}`}
      dataset={{ rarity: r, finish: "standard", type: "house", art: "none" }}
      style={style}
      hem={
        <>
          <JockTag ovr="G7" pos={SET_NAME} />
          <div className="tb-card__hemtext" />
          <EditionTag rarity={r} label={EDITION[r] ?? ""} />
        </>
      }
    >
      <div className="tb-card__chest is-back">
        <Wordmark text="Gate" top />
      </div>
      <div className="tb-card__mono is-back">7</div>
    </Jersey>
  );
}
