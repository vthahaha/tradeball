"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
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

/** Rarity is the release tier, printed on the foil sticker and filled into the size run. */
export const TIER: Record<Rarity, { code: string; name: string; n: number }> = {
  common: { code: "GR", name: "General Release", n: 1 },
  uncommon: { code: "LTD", name: "Limited", n: 2 },
  rare: { code: "QS", name: "Quickstrike", n: 3 },
  epic: { code: "PE", name: "Player Exclusive", n: 4 },
  legendary: { code: "F&F", name: "Friends & Family", n: 5 },
  mythic: { code: "SAMPLE", name: "Sample", n: 6 },
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

const PAPER = "#f6f4ee";
const INK = "#14161c";
const KRAFT = "#b98d5c";
const NIGHT = "#141417";
const GOLD = "#d9ad3c";

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
function onto(ground: string, candidates: string[], min = 2.6) {
  return candidates.find((c) => contrast(ground, c) >= min) ?? [...candidates].sort((a, b) => contrast(ground, b) - contrast(ground, a))[0];
}

interface Box {
  board: string; // the box end
  lid: string; // the lid band
  print: string; // ink printed on the board
  tissue: string; // tissue paper lining the window
}

/** The box for a release tier, in the team's colourway; numbered finishes reprint it. */
function boxFor(rarity: Rarity, team: string, finish: Finish): Box {
  const [t1, t2] = teamColors(team);
  const alt = contrast(t2, PAPER) > 1.35 && contrast(t2, t1) > 1.25 ? t2 : mix(t1, "#000000", 0.45);
  let box: Box;
  switch (rarity) {
    case "common":
      box = { board: KRAFT, lid: mix(KRAFT, "#000000", 0.16), print: "#3b2a17", tissue: mix(t1, "#ffffff", 0.82) };
      break;
    case "uncommon":
      box = { board: t1, lid: mix(t1, "#000000", 0.28), print: onto(t1, [PAPER, t2, INK]), tissue: mix(t2, "#ffffff", 0.7) };
      break;
    case "rare":
      box = { board: alt, lid: t1, print: onto(alt, [PAPER, t1, INK]), tissue: mix(t1, "#ffffff", 0.75) };
      break;
    case "epic":
      box = { board: mix(t1, "#000000", 0.5), lid: NIGHT, print: onto(mix(t1, "#000000", 0.5), [t2, PAPER]), tissue: mix(t1, "#000000", 0.2) };
      break;
    case "legendary":
      box = { board: NIGHT, lid: "#050506", print: GOLD, tissue: mix(t1, "#000000", 0.35) };
      break;
    default:
      box = { board: NIGHT, lid: "#050506", print: PAPER, tissue: "#2a2a30" };
  }
  if (finish === "gold" || finish === "masterpiece") box = { ...box, print: GOLD };
  if (finish === "black") box = { board: "#0b0b0d", lid: "#000000", print: "#c9ced6", tissue: "#1d1d22" };
  return box;
}

function boxStyle(box: Box, t1: string, t2: string, f1: string): CSSProperties {
  return {
    "--board": box.board,
    "--lid": box.lid,
    "--print": box.print,
    "--tissue": box.tissue,
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
const lastName = (name: string) => {
  const parts = name.split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : name;
};

/** Name size steps down with length; the label wraps it to two lines, never clips it. */
function nameSize(name: string) {
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length));
  const n = Math.max(name.length / 1.7, longest);
  return n <= 7 ? 10 : n <= 9 ? 8.6 : n <= 11 ? 7.4 : n <= 13 ? 6.4 : n <= 16 ? 5.4 : 4.6;
}

/** Style code printed on the label: the card's id, shortened. */
function styleCode(id: string) {
  const m = id.match(/^nba-(\d+)-(\w+)$/);
  if (!m) return `S1-${id.toUpperCase()}`;
  const kind = m[2] === "base" ? "BS" : m[2] === "rookie" ? "RK" : m[2].slice(0, 2).toUpperCase();
  return `S1-${m[1]}-${kind}`;
}

/** A barcode whose bars come from the card id, so every card's is its own. */
function barcode(id: string) {
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const stops: string[] = [];
  let x = 0;
  for (let i = 0; i < 26; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const bar = 1 + ((h >>> 3) % 3);
    const gap = 1 + ((h >>> 7) % 2);
    stops.push(`currentColor ${x}% ${x + bar * 1.2}%`, `transparent ${x + bar * 1.2}% ${x + (bar + gap) * 1.2}%`);
    x += (bar + gap) * 1.2;
    if (x > 96) break;
  }
  return `linear-gradient(90deg, ${stops.join(", ")}, transparent ${x}%)`;
}

function metaLine(card: CardView) {
  const [p1, p2] = card.players;
  if (card.type === "duo" && p2) return `${p1.team}${p2.team !== p1.team ? ` / ${p2.team}` : ""}`;
  if (card.meta) return card.meta;
  if (card.fromTeam) return `${card.fromTeam} → ${card.team}`;
  if (card.type === "rookie" && p1.pick) return `${p1.team} · Pick ${p1.pick}${p1.college ? ` · ${p1.college}` : ""}`;
  return `${card.team}${p1.nation ? ` · ${p1.nation}` : ""}`;
}

const fmtStat = (singleGame: boolean, v: number) => (singleGame && Number.isInteger(v) ? String(v) : v.toFixed(1));

function useLook(card: CardView, finish: Finish) {
  const [t1, t2] = teamColors(card.team);
  const [f1] = card.fromTeam ? teamColors(card.fromTeam) : [t1];
  const insert = isInsert(card.type);
  const isDuo = card.type === "duo" && !!card.players[1];
  return {
    style: boxStyle(boxFor(card.rarity, card.team, finish), t1, t2, f1),
    insert,
    isDuo,
    singleGame: !!card.statLine?.endsWith(" game"),
    typeLabel: insert ? (INSERT_NAMES[card.type] ?? card.type) : card.type === "rookie" ? "Rookie" : isDuo ? "Duo" : null,
  };
}

// ── shared pieces ──

/** The box end: board, lid band, and whatever sits on it. */
function Box({
  className,
  dataset,
  style,
  label,
  children,
  tiltRef,
  onMove,
  onLeave,
}: {
  className?: string;
  dataset: Record<string, string | undefined>;
  style: CSSProperties;
  label?: string;
  children: ReactNode;
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
        <div className="tb-card__lid">
          <span className="tb-card__mark">Gate 7</span>
        </div>
        {children}
        <div className="tb-card__shine" />
        <div className="tb-card__glare" />
      </div>
    </div>
  );
}

function Sticker({ rarity }: { rarity: Rarity }) {
  return (
    <div className="tb-card__sticker" aria-hidden>
      <b>{TIER[rarity].code}</b>
    </div>
  );
}

function SizeRun({ rarity }: { rarity: Rarity }) {
  const t = TIER[rarity];
  return (
    <div className="tb-card__run">
      <span className="tb-card__run-name">{t.name}</span>
      <span className="tb-card__run-cells" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} className={i < t.n ? "is-on" : ""} />
        ))}
      </span>
    </div>
  );
}

function SerialLine({ id, finish, serialNo, supply, grade }: { id: string } & Pick<CardProps, "finish" | "serialNo" | "supply" | "grade">) {
  return (
    <div className="tb-card__code">
      <span className="tb-card__style">{styleCode(id)}</span>
      {serialNo && supply ? (
        <b className="tb-card__serial">{supply === 1 ? "1 of 1" : `${serialNo}/${supply}`}</b>
      ) : finish && FINISH_LABEL[finish] ? (
        <b className="tb-card__serial">{FINISH_LABEL[finish]}</b>
      ) : null}
      {grade != null && <i className={`tb-card__grade ${grade === 10 ? "is-gem" : ""}`}>G{grade}</i>}
    </div>
  );
}

// ── front: the box end ──

export function Card({ card, finish = "standard", serialNo, supply, grade, missing, tilt = true, className }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [p1, p2] = card.players;
  const { style, insert, isDuo, singleGame, typeLabel } = useLook(card, finish);
  // Base and rookie cards show the ESPN headshot, rising out of the window. Inserts show
  // their splash art once one is chosen (insert-art.ts); until then the initials.
  const imgSrc = insert ? card.art : !isDuo && p1.espnId ? headshotUrl(p1.espnId) : undefined;
  const showImg = !!imgSrc && !imgFailed;
  const name = isDuo ? `${lastName(p1.name)} & ${lastName(p2.name)}` : p1.name;
  const box = singleGame && card.stats ? Object.entries(card.stats) : [];

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

  return (
    <Box
      tiltRef={ref}
      onMove={onMove}
      onLeave={onLeave}
      className={`${missing ? "is-missing" : ""} ${className ?? ""}`}
      dataset={{
        rarity: card.rarity,
        tier: TIER[card.rarity].code.toLowerCase().replace(/[^a-z]/g, ""),
        finish,
        type: card.type,
        art: showImg ? (insert ? "splash" : "headshot") : "none",
      }}
      style={style}
      label={`${name}, ${TIER[card.rarity].name} (${card.rarity}) ${insert ? typeLabel : card.type}${finish !== "standard" ? `, ${finish}` : ""}, ${card.ovr} overall`}
    >
      <Sticker rarity={card.rarity} />
      <div className="tb-card__window">
        {!showImg && <div className="tb-card__mono">{isDuo ? `${initials(p1.name)}·${initials(p2.name)}` : initials(p1.name)}</div>}
        {insert && !showImg && (card.title || card.kicker) && (
          <div className="tb-card__moment">
            {card.kicker && <small>{card.kicker}</small>}
            {card.title}
          </div>
        )}
      </div>
      {showImg && (
        <div className="tb-card__figure">
          {/* eslint-disable-next-line @next/next/no-img-element -- ESPN cut-outs / chosen splash art, hotlinked on purpose */}
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
        </div>
      )}
      {insert && showImg && (card.title || card.kicker) && (
        <div className="tb-card__moment is-over">
          {card.kicker && <small>{card.kicker}</small>}
          {card.title}
        </div>
      )}
      {typeLabel && <div className="tb-card__type">{typeLabel}</div>}
      <div className="tb-card__label">
        <div className="tb-card__top">
          <div className="tb-card__name" style={{ fontSize: `${nameSize(name)}cqw` }}>
            {name}
          </div>
          <div className="tb-card__size">
            <span>OVR</span>
            <b>{card.ovr}</b>
            <span>{isDuo ? "Duo" : p1.pos}</span>
          </div>
        </div>
        {box.length > 0 ? (
          <div className="tb-card__box" title={card.statLine ?? undefined}>
            {box.map(([k, v]) => (
              <div key={k}>
                <b>{fmtStat(true, v)}</b>
                <span>{k}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="tb-card__colorway">
            <span className="tb-card__swatch" aria-hidden>
              <i style={{ background: "var(--f1)" }} />
              <i style={{ background: "var(--t1)" }} />
              <i style={{ background: "var(--t2)" }} />
            </span>
            <span className="tb-card__meta">{metaLine(card)}</span>
          </div>
        )}
        <div className="tb-card__foot">
          <div className="tb-card__foot-l">
            <SizeRun rarity={card.rarity} />
            <SerialLine id={card.designId} finish={finish} serialNo={serialNo} supply={supply} grade={grade} />
          </div>
          <span className="tb-card__barcode" style={{ backgroundImage: barcode(card.designId) }} aria-hidden />
        </div>
      </div>
    </Box>
  );
}

// ── reverse: the open box, tissue and the stat slip ──

export function CardReverse({ card, finish = "standard", serialNo, supply, grade, className }: CardProps) {
  const [p1, p2] = card.players;
  const { style, insert, isDuo, singleGame, typeLabel } = useLook(card, finish);
  const name = isDuo ? `${lastName(p1.name)} & ${lastName(p2.name)}` : p1.name;
  const stats = card.stats ? Object.entries(card.stats) : [];
  return (
    <Box
      className={`is-reverse ${className ?? ""}`}
      dataset={{ rarity: card.rarity, tier: TIER[card.rarity].code.toLowerCase().replace(/[^a-z]/g, ""), finish, type: card.type, art: "none" }}
      style={style}
      label={`Inside ${name}'s box`}
    >
      <Sticker rarity={card.rarity} />
      <div className="tb-card__tissue" aria-hidden />
      <div className="tb-card__slip">
        <div className="tb-card__slip-head">
          <span>{insert ? typeLabel : SET_NAME}</span>
          <span>
            {card.ovr} · {isDuo ? "Duo" : p1.pos}
          </span>
        </div>
        <div className="tb-card__slip-name" style={{ fontSize: `${nameSize(name) * 0.8}cqw` }}>
          {name}
        </div>
        {stats.length > 0 ? (
          <>
            <div className="tb-card__slip-grid">
              {stats.map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <b>{fmtStat(singleGame, v)}</b>
                </div>
              ))}
            </div>
            <p className="tb-card__slip-src">
              {singleGame ? [card.kicker, card.statLine].filter(Boolean).join(" · ") : card.statLine ? `${card.statLine} per game` : ""}
            </p>
          </>
        ) : (
          <p className="tb-card__slip-note">{card.note ?? "No stats yet"}</p>
        )}
        <div className="tb-card__slip-foot">
          <SizeRun rarity={card.rarity} />
          <SerialLine id={card.designId} finish={finish} serialNo={serialNo} supply={supply} grade={grade} />
        </div>
      </div>
    </Box>
  );
}

// ── turnable: box end and open box on one card ──

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
        {back ? "Close the box" : "Open the box"}
      </button>
    </div>
  );
}

// ── face-down (pack reveal): the closed lid, seen from above ──

/** The closed Gate 7 lid. Its release sticker gives the tier away before the flip. */
export function CardBack({ rarity, className }: { rarity?: string; className?: string }) {
  const r = ((rarity as Rarity) in TIER ? rarity : "common") as Rarity;
  return (
    <div className={`tb-lid ${className ?? ""}`} data-rarity={r}>
      <div className="tb-lid__top">
        <span className="tb-lid__mark">
          Gate
          <b>7</b>
        </span>
        <span className="tb-lid__set">{SET_NAME}</span>
        <div className="tb-card__sticker">
          <b>{TIER[r].code}</b>
        </div>
      </div>
    </div>
  );
}
