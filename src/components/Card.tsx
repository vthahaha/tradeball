"use client";

import { useRef, useState, type CSSProperties } from "react";
import { headshotUrl, INSERT_NAMES, isInsert, SET_NAME, teamColors, type CardView, type Finish } from "@/lib/catalog";
import { SportIcon } from "./SportIcon";

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

const TYPE_LABEL: Record<string, string | null> = {
  base: null,
  rookie: "Rookie",
  duo: "Duo",
};

const FINISH_LABEL: Record<Finish, string | null> = {
  standard: null,
  foil: "Foil",
  holo: "Holo",
  gold: "Gold",
  black: "Black",
  masterpiece: "Masterpiece",
};

function initials(name: string) {
  const parts = name.replace(/[^\p{L}\s'-]/gu, "").split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** True for light kit colours (white, cream, yellow) where paper-white print would vanish. */
function isLightColor(color: string) {
  const hex = color.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    const lin = (c: number) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
    return L > 0.45;
  }
  const hsl = color.match(/hsl\(\s*[\d.]+\s+[\d.]+%\s+([\d.]+)%/);
  return hsl ? Number(hsl[1]) > 62 : false;
}

function lastName(name: string) {
  const parts = name.split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : name;
}

export function Card({ card, finish = "standard", serialNo, supply, grade, missing, tilt = true, className }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [faceFailed, setFaceFailed] = useState(false);
  const [p1, p2] = card.players;
  const [t1, t2] = teamColors(card.team);
  const [f1] = card.fromTeam ? teamColors(card.fromTeam) : [t1];
  const isDuo = card.type === "duo" && p2;
  const insert = isInsert(card.type);
  // Base and rookie cards show the ESPN headshot. Inserts show their splash art once one
  // is chosen (insert-art.ts), and the initials until then. Failed loads fall back too.
  const imgSrc = insert ? card.art : !isDuo && p1.espnId ? headshotUrl(p1.espnId) : undefined;
  const showImg = !!imgSrc && !faceFailed;
  const name = isDuo ? `${lastName(p1.name)} & ${lastName(p2.name)}` : p1.name;
  const artTitle = card.title;
  const showTitle = insert && (artTitle || card.kicker);
  const typeLabel = insert ? (INSERT_NAMES[card.type] ?? card.type) : (TYPE_LABEL[card.type] ?? null);

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

  const statEntries = card.stats ? Object.entries(card.stats) : [];
  // Season averages and percentages show one decimal; whole numbers (single-game lines) stay whole.
  const singleGame = !!card.statLine?.endsWith(" game");
  const fmtStat = (k: string, v: number) => (singleGame && Number.isInteger(v) ? String(v) : v.toFixed(1));

  return (
    <div
      ref={ref}
      className={`tb-card ${missing ? "is-missing" : ""} ${className ?? ""}`}
      data-rarity={card.rarity}
      data-finish={finish}
      data-sport={card.sport}
      data-type={card.type}
      data-art={!insert && isLightColor(t1) ? "light" : undefined}
      style={{ "--t1": t1, "--t2": t2, "--f1": f1 } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={`${name}, ${card.rarity} ${card.type}${finish !== "standard" ? `, ${finish}` : ""}`}
    >
      <div className="tb-card__stock">
        <div className="tb-card__face">
          <div className="tb-card__art">
            {showImg ? (
              // eslint-disable-next-line @next/next/no-img-element -- ESPN cut-outs / chosen splash art, hotlinked on purpose
              <img
                className={insert ? "tb-card__splash" : "tb-card__face-img"}
                src={imgSrc}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                referrerPolicy="no-referrer"
                onError={() => setFaceFailed(true)}
              />
            ) : (
              <div className={`tb-card__mono ${isDuo ? "is-duo" : ""}`}>
                {isDuo ? `${initials(p1.name)}·${initials(p2.name)}` : initials(p1.name)}
              </div>
            )}
            {showTitle && (
              <div className="tb-card__moment">
                {card.kicker && <small>{card.kicker}</small>}
                {artTitle}
              </div>
            )}
            <div className="tb-card__ovr">
              <b>{card.ovr}</b>
              <span>{isDuo ? "DUO" : p1.pos}</span>
            </div>
            <SportIcon sport={card.sport} className="tb-card__sport" />
            {typeLabel && <div className="tb-card__type">{typeLabel}</div>}
          </div>
          <div className="tb-card__band">
            <div className={`tb-card__name ${name.length > 17 ? "is-long" : ""}`}>{name}</div>
            <div className="tb-card__meta">
              {isDuo
                ? `${p1.team}${p2.team !== p1.team ? ` / ${p2.team}` : ""}`
                : card.meta
                  ? card.meta
                  : card.fromTeam
                  ? `${card.fromTeam} → ${card.team}`
                  : card.type === "rookie" && p1.pick
                    ? `${p1.team} · Pick ${p1.pick}${p1.college ? ` · ${p1.college}` : ""}`
                    : `${card.team}${p1.nation ? ` · ${p1.nation}` : ""}`}
            </div>
          </div>
          <div className="tb-card__stub">
            {statEntries.length > 0 ? (
              <div
                className="tb-card__stats"
                title={card.statLine ? (singleGame ? card.statLine : `${card.statLine} per game`) : undefined}
              >
                {statEntries.map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <b>{fmtStat(k, v)}</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tb-card__nostats">{card.note ?? "No stats yet"}</div>
            )}
            <div className="tb-card__foot">
              <span>
                {serialNo && supply ? (
                  <span className="tb-card__serial">{supply === 1 ? "No. 1 of 1" : `No. ${serialNo}/${supply}`}</span>
                ) : (
                  <>
                    {SET_NAME}
                    {FINISH_LABEL[finish] ? ` · ${FINISH_LABEL[finish]}` : ""}
                  </>
                )}
              </span>
              {grade != null && <span className={`tb-card__grade ${grade === 10 ? "is-gem" : ""}`}>G{grade}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="tb-card__shine" />
      <div className="tb-card__glare" />
    </div>
  );
}

const CLASS_LABEL: Record<string, string> = {
  common: "General",
  uncommon: "Reserved",
  rare: "Club",
  epic: "Premium",
  legendary: "Legend",
  mythic: "Mythic",
};

/** The back of the ticket. The stub's colour gives the class away before the flip. */
export function CardBack({ rarity, className }: { rarity?: string; className?: string }) {
  return (
    <div className={`tb-back ${className ?? ""}`} data-rarity={rarity}>
      <div className="tb-back__face">
        <div className="tb-back__print">
          <div>
            <div className="tb-back__logo">
              GATE
              <br />
              <span className="tb-back__seven">7</span>
            </div>
            <span className="tb-back__admit">Admit one</span>
          </div>
        </div>
        <div className="tb-back__stub">{(rarity && CLASS_LABEL[rarity]) ?? SET_NAME}</div>
      </div>
    </div>
  );
}
