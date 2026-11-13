"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type CSSProperties } from "react";
import {
  headshotUrl,
  INSERT_NAMES,
  isInsert,
  SET_NAME,
  teamColors,
  type CardView,
  type Finish,
  type Rarity,
} from "@/lib/catalog";
import { fmtStat, initials, lastName, nameSize } from "./cardText";
import { InsertFront } from "./InsertCard";

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

/** The parallel each rarity is printed in: the border colour says it before any word does. */
export const PARALLEL: Record<Rarity, string> = {
  common: "Base",
  uncommon: "Silver",
  rare: "Blue",
  epic: "Purple",
  legendary: "Gold",
  mythic: "Prismatic",
};

const FINISH_LABEL: Record<Finish, string | null> = {
  standard: null,
  foil: "Foil",
  holo: "Holo",
  gold: "Gold",
  black: "Black",
  masterpiece: "Masterpiece",
};

/** The small print under a base card's name: draft pick for rookies, nation for everyone else. */
function baseMeta(card: CardView) {
  const p = card.players[0];
  if (card.type === "rookie" && p.pick)
    return `Pick ${p.pick}${p.college ? ` · ${p.college}` : ""}`;
  return p.nation || card.team;
}

function cardNo(card: CardView) {
  if (isInsert(card.type)) return card.designId;
  const m = card.designId.match(/^nba-(\d+)-(\w+)$/);
  return m ? `${m[2] === "rookie" ? "RC" : "B"}-${m[1]}` : card.designId;
}

function useLook(card: CardView) {
  const [t1, t2] = teamColors(card.team);
  const [f1] = card.fromTeam ? teamColors(card.fromTeam) : [t1];
  const insert = isInsert(card.type);
  const isDuo = card.type === "duo" && !!card.players[1];
  return {
    style: { "--t1": t1, "--t2": t2, "--f1": f1 } as CSSProperties,
    insert,
    isDuo,
    singleGame: !!card.statLine?.endsWith(" game"),
    setName: insert ? (INSERT_NAMES[card.type] ?? card.type) : null,
  };
}

function SerialLine({
  finish,
  serialNo,
  supply,
  grade,
}: Pick<CardProps, "finish" | "serialNo" | "supply" | "grade">) {
  const fin = finish && FINISH_LABEL[finish];
  if (!(serialNo && supply) && !fin && grade == null) return null;
  return (
    <span className="tb-card__serial">
      {serialNo && supply ? (
        <b>{supply === 1 ? "1/1" : `${serialNo}/${supply}`}</b>
      ) : fin ? (
        <span>{fin}</span>
      ) : null}
      {grade != null && (
        <i className={grade === 10 ? "is-gem" : ""}>G{grade}</i>
      )}
    </span>
  );
}

// ── front ──

export function Card({
  card,
  finish = "standard",
  serialNo,
  supply,
  grade,
  missing,
  tilt = true,
  className,
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const [imgFailed, setImgFailed] = useState(false);
  const [p1, p2] = card.players;
  const { style, insert, isDuo, setName } = useLook(card);
  // Base and rookie cards show the ESPN headshot. Inserts show their splash art once one is
  // chosen (insert-art.ts); until then the set's scene carries the card with the initials.
  // New Blood falls back to the ESPN headshot until splash art is chosen.
  const headshot = !isDuo && p1.espnId ? headshotUrl(p1.espnId) : undefined;
  const imgSrc = insert
    ? (card.art ?? (card.type === "newblood" ? headshot : undefined))
    : headshot;
  const showImg = !!imgSrc && !imgFailed;
  const name = isDuo ? `${lastName(p1.name)} & ${lastName(p2.name)}` : p1.name;
  const ini = isDuo
    ? `${initials(p1.name)}·${initials(p2.name)}`
    : initials(p1.name);

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
    <div
      ref={ref}
      className={`tb-card ${missing ? "is-missing" : ""} ${className ?? ""}`}
      data-rarity={card.rarity}
      data-finish={finish}
      data-type={card.type}
      data-insert={insert ? "" : undefined}
      data-art={showImg ? (insert ? "splash" : "headshot") : "none"}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      role="img"
      aria-label={`${name}, ${card.rarity}${setName ? ` ${setName} insert` : ` ${card.type}`}${finish !== "standard" ? `, ${finish}` : ""}, ${card.ovr} overall`}
    >
      <div className="tb-card__frame">
        {insert ? (
          <InsertFront
            card={card}
            uid={uid}
            imgSrc={imgSrc}
            showImg={showImg}
            onImgError={() => setImgFailed(true)}
            finish={finish}
            serialNo={serialNo}
            supply={supply}
            grade={grade}
          />
        ) : (
          <div className="tb-base">
            <div className="tb-base__photo">
              <div className="tb-base__band" aria-hidden />
              {showImg ? (
                // eslint-disable-next-line @next/next/no-img-element -- ESPN cut-outs, hotlinked on purpose
                <img
                  className="tb-card__face-img"
                  src={imgSrc}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div className="tb-card__mono">{ini}</div>
              )}
              <div className="tb-base__ovr">
                <b>{card.ovr}</b>
                <span>{isDuo ? "Duo" : p1.pos}</span>
              </div>
              {card.type === "rookie" && (
                <div className="tb-base__rc" title="Rookie card">
                  RC
                </div>
              )}
            </div>
            <div className="tb-base__plate">
              <b style={{ fontSize: `${nameSize(name, 0.74)}cqw` }}>{name}</b>
              <span>
                <em>{card.team}</em>
                <i>{baseMeta(card)}</i>
                <SerialLine
                  finish={finish}
                  serialNo={serialNo}
                  supply={supply}
                  grade={grade}
                />
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="tb-card__shine" />
      <div className="tb-card__glare" />
    </div>
  );
}

// ── back: the stat side ──

export function CardReverse({
  card,
  finish = "standard",
  serialNo,
  supply,
  grade,
  className,
}: CardProps) {
  const [p1, p2] = card.players;
  const { style, insert, isDuo, singleGame, setName } = useLook(card);
  const name = isDuo ? `${lastName(p1.name)} & ${lastName(p2.name)}` : p1.name;
  const stats = card.stats ? Object.entries(card.stats) : [];
  const bio: [string, string | undefined][] = [
    [
      "Team",
      card.fromTeam
        ? `${card.fromTeam} → ${card.team}`
        : card.team || undefined,
    ],
    ["Pos", isDuo ? "Duo" : p1.pos],
    ["No.", p1.jersey ? `#${p1.jersey}` : undefined],
    ["From", p1.nation || undefined],
    [
      "Draft",
      card.type === "rookie" && p1.pick
        ? `Pick ${p1.pick}${p1.college ? ` · ${p1.college}` : ""}`
        : undefined,
    ],
  ];
  return (
    <div
      className={`tb-card is-reverse ${className ?? ""}`}
      data-rarity={card.rarity}
      data-finish={finish}
      data-type={card.type}
      style={style}
      role="img"
      aria-label={`Back of ${name}`}
    >
      <div className="tb-card__frame">
        <div className="tb-card__back">
          <div className="tb-card__back-head">
            <div>
              <div
                className="tb-card__back-name"
                style={{ fontSize: `${nameSize(name) * 0.72}cqw` }}
              >
                {name}
              </div>
              <div className="tb-card__back-set">
                {setName
                  ? `${setName} · ${SET_NAME}`
                  : `${SET_NAME} · ${card.type === "rookie" ? "Rookie" : "Base"}`}
              </div>
            </div>
            <div className="tb-card__back-no">{cardNo(card)}</div>
          </div>
          <dl className="tb-card__bio">
            <div>
              <dt>OVR</dt>
              <dd>{card.ovr}</dd>
            </div>
            {bio
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          {insert && (card.title || card.kicker) && (
            <p className="tb-card__back-blurb">
              {[card.title, card.kicker].filter(Boolean).join(" · ")}
            </p>
          )}
          {stats.length > 0 ? (
            <table className="tb-card__table">
              <caption>
                {singleGame
                  ? card.statLine
                  : card.statLine
                    ? `${card.statLine} per game`
                    : "Stats"}
              </caption>
              <thead>
                <tr>
                  {stats.map(([k]) => (
                    <th key={k} scope="col">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {stats.map(([k, v]) => (
                    <td key={k}>{fmtStat(singleGame, v)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="tb-card__back-note">{card.note ?? "No stats yet"}</p>
          )}
          <div className="tb-card__back-foot">
            <span>
              {PARALLEL[card.rarity]} parallel · {card.rarity}
            </span>
            <SerialLine
              finish={finish}
              serialNo={serialNo}
              supply={supply}
              grade={grade}
            />
          </div>
        </div>
      </div>
    </div>
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
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.42, ease: [0.3, 1.25, 0.5, 1] }
          }
        >
          <div
            className="absolute inset-0 [backface-visibility:hidden]"
            aria-hidden={back}
          >
            <Card {...props} />
          </div>
          <div
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            aria-hidden={!back}
          >
            <CardReverse {...props} />
          </div>
        </motion.div>
      </div>
      <button
        type="button"
        className="btn btn-ghost px-4 py-1.5 text-sm"
        onClick={() => setBack((b) => !b)}
        aria-pressed={back}
      >
        {back ? "Show the front" : "Flip the card"}
      </button>
    </div>
  );
}

// ── face-down (pack reveal) ──

/** The Gate 7 card back. Its border is already the parallel, so the rarity shows before the flip. */
export function CardBack({
  rarity,
  className,
}: {
  rarity?: string;
  className?: string;
}) {
  return (
    <div
      className={`tb-card is-facedown ${className ?? ""}`}
      data-rarity={rarity ?? "common"}
    >
      <div className="tb-card__frame">
        <div className="tb-card__cover">
          <div className="tb-card__cover-mark">
            <span>Gate</span>
            <b>7</b>
            <span>{SET_NAME} · Basketball</span>
          </div>
        </div>
      </div>
    </div>
  );
}
