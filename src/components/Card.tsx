"use client";

import { useRef, type CSSProperties } from "react";
import { SET_NAME, teamColors, type CardView, type Finish } from "@/lib/catalog";
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

const TYPE_LABEL: Record<CardView["type"], string | null> = {
  base: null,
  rookie: "Rookie",
  star: "Star",
  captain: "Captain",
  icon: "Icon",
  moment: "Moment",
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

function lastName(name: string) {
  const parts = name.split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : name;
}

export function Card({ card, finish = "standard", serialNo, supply, grade, missing, tilt = true, className }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [p1, p2] = card.players;
  const [t1, t2] = teamColors(p1.team);
  const isDuo = card.type === "duo" && p2;
  const name = isDuo ? `${lastName(p1.name)} & ${lastName(p2.name)}` : p1.name;
  const showTitle = card.type === "moment" || ((card.type === "icon" || isDuo) && card.title);
  const typeLabel = TYPE_LABEL[card.type];

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

  const statEntries = Object.entries(card.stats);

  return (
    <div
      ref={ref}
      className={`tb-card ${missing ? "is-missing" : ""} ${className ?? ""}`}
      data-rarity={card.rarity}
      data-finish={finish}
      data-sport={card.sport}
      style={{ "--t1": t1, "--t2": t2 } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={`${name}, ${card.rarity} ${card.type}${finish !== "standard" ? `, ${finish}` : ""}`}
    >
      <div className="tb-card__frame">
        <div className="tb-card__inner">
          <div className="tb-card__art">
            <div className={`tb-card__mono ${isDuo ? "is-duo" : ""}`}>
              {isDuo ? `${initials(p1.name)}·${initials(p2.name)}` : initials(p1.name)}
            </div>
            {showTitle && (
              <div className="tb-card__moment">
                {card.year && <small>{card.year}</small>}
                {card.title}
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
              {isDuo ? `${p1.team}${p2.team !== p1.team ? ` / ${p2.team}` : ""}` : `${p1.team} · ${p1.nation}`}
            </div>
          </div>
          <div className="tb-card__stats">
            {statEntries.map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <div className="tb-card__foot">
            <span>
              {serialNo && supply ? (
                <span className="tb-card__serial">
                  {supply === 1 ? "1 / 1" : `#${serialNo} / ${supply}`}
                </span>
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
      <div className="tb-card__shine" />
      <div className="tb-card__glare" />
    </div>
  );
}

export function CardBack({ rarity, className }: { rarity?: string; className?: string }) {
  return (
    <div className={`tb-back ${className ?? ""}`} data-rarity={rarity}>
      <div className="tb-back__face">
        <div className="tb-back__logo">
          TRADE
          <br />
          BALL
          <small>{SET_NAME}</small>
        </div>
      </div>
    </div>
  );
}
