"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  BASE_SETS,
  headshotUrl,
  INSERT_NAMES,
  isInsert,
  SET_NAME,
  setLabel,
  teamCode,
  teamColors,
  teamLogo,
  type CardView,
  type Finish,
  type Rarity,
} from "@/lib/catalog";
import { initials, lastName, nameSize } from "./cardText";
import { InsertFront } from "./InsertCard";
import { inkOn, readableOnPaper } from "@/lib/color";

export interface CardProps {
  card: CardView;
  finish?: Finish;
  serialNo?: number | null;
  supply?: number | null;
  grade?: number | null;
  missing?: boolean;
  tilt?: boolean;
  /** A thumbnail-size card (binder pockets, trade lists): inserts load their small art. */
  small?: boolean;
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
  grail: "Aurora",
};

const FINISH_LABEL: Record<Finish, string | null> = {
  standard: null,
  foil: "Foil",
  holo: "Holo",
  gold: "Gold",
  black: "Black",
  masterpiece: "Masterpiece",
};

/** The small print under a base card's name: draft pick for NBA rookies, college for NFL players,
 *  nation for everyone else. */
function baseMeta(card: CardView) {
  const p = card.players[0];
  if (card.type === "rookie" && p.pick)
    return `Pick ${p.pick}${p.college ? ` · ${p.college}` : ""}`;
  if (card.sport === "football") return p.college || card.team;
  return p.nation || card.team;
}

export function cardNo(card: CardView) {
  if (isInsert(card.type)) return card.designId;
  // numbered sets print their short mark: UCL-12, NFL-301, MLB-88, NHL-5
  const set = BASE_SETS.find((b) => b.key === card.type);
  if (set && card.no) return `${set.short}-${card.no}`;
  const m = card.designId.match(/^nba-(\d+)-(\w+)$/);
  return m ? `${m[2] === "rookie" ? "RC" : "B"}-${m[1]}` : card.designId;
}

function useLook(card: CardView) {
  const [t1, t2] = teamColors(card.team, card.sport);
  const [f1] = card.fromTeam ? teamColors(card.fromTeam, card.sport) : [t1];
  // Rivalries: the second player's team, as --u1 / --u2
  const [u1, u2] = card.team2 ? teamColors(card.team2, card.sport) : [t1, t2];
  const insert = isInsert(card.type);
  const isDuo = !!card.players[1];
  return {
    style: {
      "--t1": t1,
      "--t2": t2,
      "--f1": f1,
      "--u1": u1,
      "--u2": u2,
      // text that sits on a team colour, and a team colour that is used as text on light stock
      "--t1-ink": inkOn(t1),
      "--u1-ink": inkOn(u1),
      "--t1-text": readableOnPaper(t1),
    } as CSSProperties,
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

/** One observer for every card on the page: a card that scrolls off screen is marked asleep so
 *  its looping border and set animations pause (globals.css), and wakes when it comes back. */
let sleeper: IntersectionObserver | null = null;
function watchVisibility(el: HTMLElement) {
  if (typeof IntersectionObserver === "undefined") return () => {};
  sleeper ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.toggleAttribute("data-asleep", !e.isIntersecting);
    },
    { rootMargin: "200px" },
  );
  sleeper.observe(el);
  return () => sleeper?.unobserve(el);
}

export function Card({
  card,
  finish = "standard",
  serialNo,
  supply,
  grade,
  missing,
  tilt = true,
  small = false,
  className,
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? watchVisibility(ref.current) : undefined), []);
  const uid = useId().replace(/:/g, "");
  const [imgFailed, setImgFailed] = useState(false);
  const [p1, p2] = card.players;
  const { style, insert, isDuo, setName } = useLook(card);
  // Base and rookie cards show the ESPN headshot (Champions League cards: UEFA's squad photo;
  // NFL cards: ESPN's NFL cut-out, carried in `photo`).
  // Inserts show their splash art once one is chosen (insert-art.ts); until then the set's
  // scene carries the card with the initials. New Blood always uses the ESPN headshot.
  const headshot = isDuo ? undefined : (p1.photo ?? (p1.espnId ? headshotUrl(p1.espnId) : undefined));
  // The Champions use the player's own photo too, until splash art is chosen for a card
  const imgSrc = insert
    ? card.type === "newblood" || (card.type === "champions" && !card.art)
      ? headshot
      : (small && card.artThumb) || card.art
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
      data-sport={card.sport}
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
                // eslint-disable-next-line @next/next/no-img-element -- ESPN cut-outs / UEFA squad photos, hotlinked on purpose
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
              {(card.type === "rookie" || card.rookie) && (
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

// ── back: the Gate 7 mark and the team's logo; each insert set prints its own back ──

function TeamMedal({ team, sport }: { team: string; sport: CardView["sport"] }) {
  const [failed, setFailed] = useState(false);
  const src = teamLogo(team, sport);
  return (
    <span className="tb-rev__medal">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- ESPN team logo, hotlinked like the headshots
        <img
          src={src}
          alt={`${team} logo`}
          loading="lazy"
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <b>{teamCode(team, sport) || team.slice(0, 3).toUpperCase()}</b>
      )}
    </span>
  );
}

/** Career Montage backs: both colours of every team the player played for, in order, as diagonal
 *  stripes of equal width (one team: two wide stripes; eight teams: sixteen narrow ones). */
function careerStripes(teams: string[]) {
  const colors = teams.flatMap((t) => teamColors(t));
  const w = 100 / colors.length;
  const stops = colors.map((c, i) => `${c} ${(i * w).toFixed(2)}% ${((i + 1) * w).toFixed(2)}%`).join(", ");
  // a dark band across the middle so the mark and the medal read over any colours
  return `linear-gradient(180deg, transparent 20%, #000000b3 30%, #000000b3 70%, transparent 80%), linear-gradient(115deg, ${stops})`;
}

export function CardReverse({
  card,
  finish = "standard",
  serialNo,
  supply,
  grade,
  className,
}: CardProps) {
  const [p1, p2] = card.players;
  const { style, setName } = useLook(card);
  const name = p2 ? `${lastName(p1.name)} & ${lastName(p2.name)}` : p1.name;
  const teams = [card.team, card.team2].filter((t): t is string => !!t);
  return (
    <div
      className={`tb-card is-reverse ${className ?? ""}`}
      data-rarity={card.rarity}
      data-finish={finish}
      data-type={card.type}
      style={style}
      role="img"
      aria-label={`Back of ${name}${teams.length ? `, ${teams.join(" and ")}` : ""}`}
    >
      <div className="tb-card__frame">
        <div className="tb-rev" data-set={card.type}>
          <div className="tb-rev__deco" aria-hidden style={card.career?.length ? { background: careerStripes(card.career) } : undefined} />
          {card.type === "teamculture" && (
            <div className="tb-rev__zine" aria-hidden>
              <b>{teamCode(card.team, card.sport) || card.team.slice(0, 3).toUpperCase()}</b>
              <i />
              <i />
              <i />
              <i />
            </div>
          )}
          <div className="tb-rev__mark" aria-hidden>
            G7
          </div>
          {teams.length > 0 && (
            <div
              className={`tb-rev__logos ${teams.length > 1 ? "is-pair" : ""}`}
            >
              {teams.map((t) => (
                <TeamMedal key={t} team={t} sport={card.sport} />
              ))}
            </div>
          )}
          <div className="tb-rev__foot">
            <span>{setName ?? setLabel(card.type)}</span>
            <SerialLine
              finish={finish}
              serialNo={serialNo}
              supply={supply}
              grade={grade}
            />
            <span>{cardNo(card)}</span>
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

const SPORT_NAME: Record<CardView["sport"], string> = {
  basketball: "Basketball",
  soccer: "Soccer",
  football: "Football",
  baseball: "Baseball",
  hockey: "Hockey",
  esports: "Esports",
};

/** The Gate 7 card back. Its border is already the parallel, so the rarity shows before the flip. */
export function CardBack({
  rarity,
  sport = "basketball",
  className,
}: {
  rarity?: string;
  sport?: CardView["sport"];
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
            <span>
              {SET_NAME} · {SPORT_NAME[sport]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
