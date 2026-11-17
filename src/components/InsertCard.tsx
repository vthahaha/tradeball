"use client";

// One layout per insert set. Each set is one print or photo technique plus its name set
// as type; there are no drawn scenes. The photo (splash art) leads every card. The small
// print is what real cards carry: card number out of the set, the set lockup, a stat line.
import { useId } from "react";
import {
  INSERT_POOLS,
  SET_NAME,
  teamCode,
  type CardView,
  type Finish,
  teamColors,
} from "@/lib/catalog";
import { luminance } from "@/lib/color";
import { fmtStat, initials, lastName, nameSize } from "./cardText";
import { Flag, flagStripes, NATIONS } from "./flags";

export interface InsertFrontProps {
  card: CardView;
  uid: string;
  imgSrc?: string;
  showImg: boolean;
  onImgError: () => void;
  finish: Finish;
  serialNo?: number | null;
  supply?: number | null;
  grade?: number | null;
}

const FINISH_LABEL: Partial<Record<Finish, string>> = {
  foil: "Foil",
  holo: "Holo",
  gold: "Gold",
  black: "Black",
  masterpiece: "Masterpiece",
};
const SEASON = "2025-26";

function Serial({
  finish,
  serialNo,
  supply,
  grade,
}: Pick<InsertFrontProps, "finish" | "serialNo" | "supply" | "grade">) {
  const fin = FINISH_LABEL[finish];
  if (!(serialNo && supply) && !fin && grade == null) return null;
  return (
    <span className="tb-ins__serial">
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

/** Card number out of the set, as printed in a corner: NB1 · 1/15. */
function CardNo({ card }: { card: CardView }) {
  const total = INSERT_POOLS[card.type]?.length ?? 0;
  const n = card.designId.match(/\d+$/)?.[0];
  return (
    <span className="tb-ins__no">
      {card.designId}
      {n && total ? (
        <i>
          {" "}
          · {n}/{total}
        </i>
      ) : null}
    </span>
  );
}

/** A season line from the card's stats, e.g. 28.7 PTS · 6.9 REB · 5.1 AST. */
function Stats({ card, keys }: { card: CardView; keys: string[] }) {
  if (!card.stats) return null;
  const parts = keys.filter((k) => card.stats![k] != null);
  if (!parts.length) return null;
  return (
    <span className="tb-ins__stats">
      {parts.map((k) => (
        <span key={k}>
          <b>{fmtStat(false, card.stats![k])}</b> {k}
        </span>
      ))}
    </span>
  );
}

/** The photo window: chosen splash art, or the initials until there is some. */
function Photo({
  card,
  imgSrc,
  showImg,
  onImgError,
  children,
}: Pick<InsertFrontProps, "card" | "imgSrc" | "showImg" | "onImgError"> & {
  children?: React.ReactNode;
}) {
  return (
    <div className="tb-ins__photo">
      {children}
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- chosen splash art, hotlinked on purpose
        <img
          className={`tb-card__splash ${card.type === "newblood" || !card.art ? "is-headshot" : ""}`}
          src={imgSrc}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={onImgError}
        />
      ) : (
        <div className="tb-card__mono">{initials(card.players[0].name)}</div>
      )}
    </div>
  );
}

/** 1 -> 1st, 3 -> 3rd, 11 -> 11th */
function ordinal(n: string) {
  const v = Number(n);
  const t = v % 100;
  const suf =
    t >= 11 && t <= 13
      ? "th"
      : (({ 1: "st", 2: "nd", 3: "rd" }) as Record<number, string>)[v % 10] ?? "th";
  return `${v}${suf}`;
}

function Rating({
  ovr,
  pos,
  label,
}: {
  ovr: number;
  pos: string;
  label?: string;
}) {
  return (
    <div className="tb-ins__ovr">
      {label && <small>{label}</small>}
      <b>{ovr}</b>
      <span>{pos}</span>
    </div>
  );
}

/** Four small corner marks around a photo window (album mounts, keystones, foil brackets). */
function Corners({
  kind,
}: {
  kind: "mount" | "keystone" | "bracket" | "crop";
}) {
  return (
    <div className={`tb-ins__corners is-${kind}`} aria-hidden>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

/** The zodiac animal's character, for the Lunar New Year seal (traditional forms). */
const ZODIAC: Record<string, string> = {
  Mouse: "鼠",
  Ox: "牛",
  Tiger: "虎",
  Cat: "貓",
  Dragon: "龍",
  Snake: "蛇",
  Horse: "馬",
  Goat: "羊",
  Monkey: "猴",
  Chicken: "雞",
  Dog: "狗",
  Pig: "豬",
};

/** Sugar skull eye and accent colours; each Day of the Dead card takes one by its number. */
const SKULL_EYES: [string, string][] = [
  ["#ff2e93", "#ffd23f"],
  ["#ff8a00", "#a35bff"],
  ["#a35bff", "#ff8a00"],
  ["#ffd23f", "#ff2e93"],
];

/** Six petals round a point: the flowers in a sugar skull's eyes and on its brow. */
function petals(cx: number, cy: number, d: number, r: number, fill: string) {
  return [0, 1, 2, 3, 4, 5].map((k) => (
    <circle
      key={k}
      cx={cx + d * Math.cos((k * Math.PI) / 3)}
      cy={cy + d * Math.sin((k * Math.PI) / 3)}
      r={r}
      fill={fill}
    />
  ));
}

function SugarSkull({ hue }: { hue: number }) {
  const [a, b] = SKULL_EYES[hue];
  const ink = "#2a0b3b";
  return (
    <svg className="tb-ins__skull" viewBox="0 0 40 44" aria-hidden>
      <path
        d="M20 2C9.5 2 3 9.5 3 18.5c0 6 2.8 10.2 7 12.3V36c0 3.3 2.7 6 6 6h8c3.3 0 6-2.7 6-6v-5.2c4.2-2.1 7-6.3 7-12.3C37 9.5 30.5 2 20 2Z"
        fill="#fff4e4"
        stroke={ink}
        strokeWidth="1.2"
      />
      {petals(20, 8.5, 2.6, 1.5, b)}
      <circle cx="20" cy="8.5" r="1.3" fill={a} />
      {[13, 27].map((cx) => (
        <g key={cx}>
          {petals(cx, 19, 4.6, 1.7, a)}
          <circle cx={cx} cy="19" r="4" fill={ink} />
          <circle cx={cx + 1.1} cy="17.9" r="0.9" fill="#fff" />
        </g>
      ))}
      <path
        d="M20 29.6c-1.8-1.3-2.8-2.4-2.8-3.4 0-.9.7-1.5 1.4-1.5.6 0 1.1.3 1.4.8.3-.5.8-.8 1.4-.8.7 0 1.4.6 1.4 1.5 0 1-1 2.1-2.8 3.4Z"
        fill={b}
      />
      {[
        [6.5, 26],
        [8.6, 28.6],
        [33.5, 26],
        [31.4, 28.6],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill={b} />
      ))}
      <path
        d="M12.5 34H27.5M15 32v4M18 32v4M22 32v4M25 32v4"
        stroke={ink}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {[17, 20, 23].map((x) => (
        <circle key={x} cx={x} cy={x === 20 ? 39.6 : 39} r="0.8" fill={a} />
      ))}
    </svg>
  );
}

/** The three skill sets: their name and the stat each one leads with. */
const SKILL: Record<string, { label: string; key: string }> = {
  snipers: { label: "Snipers", key: "3P%" },
  dimers: { label: "Dimers", key: "AST" },
  snatchers: { label: "Snatchers", key: "REB" },
};

/** The court diagram for a skill set, in thin white line: the three-point arc with a shot dropping
 *  in, a chain of passes ending in an arrow, or the backboard and rim with balls coming off it. */
function SkillMotif({ kind }: { kind: string }) {
  return (
    <svg className="tb-ins__motif" viewBox="0 0 100 30" preserveAspectRatio="xMidYMax meet" aria-hidden>
      {kind === "snipers" && (
        <>
          <path d="M4 30V24A46 22 0 0 1 96 24V30" />
          <path d="M14 27.5Q40 -4 78 12.5" className="is-dash" />
          <circle cx="80" cy="13.5" r="2" />
          {/* ticks across the arc, where the arc actually is at each x */}
          {[18, 34, 50, 66, 82].map((x) => {
            const y = 24 - 22 * Math.sqrt(1 - ((x - 50) / 46) ** 2);
            return <path key={x} d={`M${x} ${(y - 1.2).toFixed(2)}v2.4`} />;
          })}
        </>
      )}
      {kind === "dimers" && (
        <>
          <path d="M10 25L38 9L68 20L89 6" className="is-dash" />
          <path d="M89 6l-5.2.3 2.4 4.1z" className="is-fill" />
          {[
            [10, 25],
            [38, 9],
            [68, 20],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="1.5" className="is-fill" />
          ))}
        </>
      )}
      {kind === "snatchers" && (
        <>
          <rect x="40" y="1.5" width="20" height="9" rx="0.5" />
          <rect x="46" y="5.5" width="8" height="5" />
          <ellipse cx="50" cy="12.2" rx="5" ry="1.4" />
          <path d="M45.4 12.4L47 18M50 13.6V18.6M54.6 12.4L53 18M47 18H53" />
          <path d="M47 11Q28 -4 13 19" className="is-dash" />
          <path d="M53 11Q74 -5 88 17" className="is-dash" />
          <circle cx="12" cy="21.5" r="2.2" />
          <circle cx="89" cy="19.5" r="2.2" />
        </>
      )}
    </svg>
  );
}

/** A small deterministic number from a string, so a card's random-looking details never change. */
function seedOf(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Text set letter by letter, each letter turned and coloured: the whimsy of Thanksgiving's
 *  wordmark (gentle) and The Circus's names (wild). */
function LetterRun({ text, seed, colors, wild = false }: { text: string; seed: string; colors?: string[]; wild?: boolean }) {
  let h = seedOf(seed);
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h % 1000) / 1000;
  };
  let ci = 0;
  return (
    <>
      {[...text].map((ch, i) => {
        if (ch === " ") return <span key={i}> </span>;
        const r = wild ? (next() - 0.5) * 34 : (i % 2 ? 1 : -1) * (3 + next() * 4);
        const y = wild ? (next() - 0.5) * 0.35 : 0;
        const sc = wild ? 0.85 + next() * 0.4 : 1;
        const color = colors ? colors[ci++ % colors.length] : undefined;
        return (
          <span
            key={i}
            style={{ display: "inline-block", transform: `translateY(${y}em) rotate(${r.toFixed(1)}deg) scale(${sc.toFixed(2)})`, color }}
          >
            {ch}
          </span>
        );
      })}
    </>
  );
}

/** Thanksgiving's Easter eggs: one small drawing hidden on every card, a different one and in a
 *  different place by card number. */
const EGGS: { label: string; d: React.ReactNode }[] = [
  { label: "a wishbone", d: <path d="M12 21v-5M12 16L6.5 4M12 16l5.5-12M5 4.5a1.5 1.5 0 1 0 3 0M16 4.5a1.5 1.5 0 1 0 3 0" /> },
  { label: "a slice of pie", d: <><path d="M3 18L13 4l8 14z" /><path d="M3 18h18M6 14h12" /></> },
  { label: "an acorn", d: <><path d="M6 10h12c0 6-3 10-6 11-3-1-6-5-6-11z" /><path d="M5 10c0-3 3-5 7-5s7 2 7 5zM12 5V2" /></> },
  { label: "an ear of corn", d: <><path d="M12 3c3 0 4 5 4 9s-1 8-4 9c-3-1-4-5-4-9s1-9 4-9z" /><path d="M8 12c-3 1-4 5-4 8M16 12c3 1 4 5 4 8M10 8h4M9.5 12h5M10 16h4" /></> },
  { label: "a pumpkin", d: <><path d="M12 7c-5 0-8 3-8 7s3 7 8 7 8-3 8-7-3-7-8-7z" /><path d="M12 7c-2 2-2 12 0 14M12 7c2 2 2 12 0 14M12 7V3l2-1" /></> },
  { label: "a drumstick", d: <><path d="M14 3a6 6 0 1 1-4 10l-4 4" /><path d="M5 16.5a1.5 1.5 0 1 1-2 2M8 19.5a1.5 1.5 0 1 1-2 2" /></> },
];
const EGG_SPOTS = [
  { left: "6cqw", top: "40cqw" },
  { right: "6cqw", top: "58cqw" },
  { left: "7cqw", top: "74cqw" },
  { right: "7cqw", top: "34cqw" },
  { left: "40cqw", top: "7cqw" },
  { right: "18cqw", top: "84cqw" },
  { left: "8cqw", top: "18cqw" },
];

/** Thanksgiving's falling leaves: a simple lobed leaf in five autumn colours. */
const LEAF = "M12 2l1.6 4.4 3.8-2.2-.9 4.6 4.5.5-3.4 3 3 3.5-4.6.3.4 4.7L12 18l-4.4 2.8.4-4.7-4.6-.3 3-3.5-3.4-3 4.5-.5-.9-4.6 3.8 2.2z";

/** Spark Plug's circuit: traces that link the photo to the rating, the wordmark and the nameplate,
 *  each with a node at its end; a second copy carries the travelling current. */
const SPARK_TRACES = [
  "M10 14 V9 H34",
  "M90 14 V11 H72 V5",
  "M8 62 H4 V96 H14",
  "M92 70 H97 V104 H86",
  "M30 96 V104 H44",
  "M70 96 V100 H58",
];
function SparkCircuit() {
  return (
    <svg className="tb-ins__spcircuit" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden>
      {SPARK_TRACES.map((d) => (
        <path key={d} d={d} className="is-trace" />
      ))}
      {SPARK_TRACES.map((d, i) => (
        <path key={`c${d}`} d={d} className="is-current" style={{ animationDelay: `${-i * 0.45}s` }} />
      ))}
    </svg>
  );
}
const BOLT = "M13 2L4 14h7l-2 8 9-12h-7z";

/** The Circus: one silly sticker per card. */
const STICKERS = ["HONK!", "OOPS", "BOING", "WHEEE", "TA-DA!", "HUH?", "SPLAT", "OKAY?", "WOW", "LOL"];

export function InsertFront(props: InsertFrontProps) {
  const { card } = props;
  const wallId = useId().replace(/:/g, "");
  const p = card.players[0];
  const name = p.name;
  const serial = <Serial {...props} />;
  const no = <CardNo card={card} />;
  const photo = (children?: React.ReactNode) => (
    <Photo {...props}>{children}</Photo>
  );

  switch (card.type) {
    // New Blood: a split-tone photo, old team's colour on the left of a seam, new on the right
    case "newblood": {
      const from = card.fromTeam ? teamCode(card.fromTeam) : "";
      const to = teamCode(card.team);
      return (
        <div className="tb-ins tb-ins--newblood">
          {photo(
            <>
              <div className="tb-ins__pin" aria-hidden />
              <div className="tb-ins__old" aria-hidden />
            </>,
          )}
          <div className="tb-ins__seam" aria-hidden />
          <div className="tb-ins__set">
            New Blood
            <span>2026 offseason</span>
          </div>
          <div className="tb-ins__codes" aria-hidden>
            <span className="is-from">{from}</span>
            <span className="is-to">{to}</span>
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.82)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__line">
              <s>{card.fromTeam}</s>
              <span aria-hidden>→</span>
              <b>{card.team}</b>
              {serial}
            </div>
            <div className="tb-ins__fine">
              <Stats card={card} keys={["PTS", "REB", "AST"]} />
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Hard Goodbyes: a farewell autograph card. The full-colour photo on warm cream stock,
    // the name signed in blue ink on a white sticker panel, a thank-you line above it.
    case "goodbyes":
      return (
        <div className="tb-ins tb-ins--goodbyes">
          {photo()}
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__thanks">Hard Goodbyes · Thank you</div>
          <div className="tb-ins__auto">
            <div
              className="tb-ins__sig"
              style={{ fontSize: `${nameSize(name, 1.35)}cqw` }}
            >
              {name}
            </div>
          </div>
          <div className="tb-ins__foot">
            <div className="tb-ins__fine">
              <span>{card.meta ?? "Retired"}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Golden Boy: two inks, black and gold; the photo as a gold duotone in foil brackets
    case "goldenboy":
      return (
        <div className="tb-ins tb-ins--goldenboy">
          <div className="tb-ins__engrave" aria-hidden />
          {photo()}
          <Corners kind="bracket" />
          <div className="tb-ins__set">
            Golden Boy
            <span>
              {SET_NAME} · {SEASON} breakout
            </span>
          </div>
          <div className="tb-ins__u23" aria-label="Under 23">
            U-23
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.78)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__line">
              <span>{card.team}</span>
              {p.nation && <span>{p.nation}</span>}
              {serial}
            </div>
            <div className="tb-ins__fine">
              <Stats card={card} keys={["PTS", "REB", "AST"]} />
              {no}
            </div>
          </div>
        </div>
      );

    // Generational: the full photo, no numbers on the front. A gold commemorative seal reads
    // "One for the lifetime"; the box score lives on the back.
    case "generational":
      return (
        <div className="tb-ins tb-ins--generational">
          {photo()}
          <div className="tb-ins__fade" aria-hidden />
          <div className="tb-ins__set">Generational</div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <svg
            className="tb-ins__seal"
            viewBox="0 0 40 40"
            aria-label="One for the lifetime"
            role="img"
          >
            <defs>
              <path
                id={`${wallId}-ring`}
                d="M20 20 m-14.6 0 a14.6 14.6 0 1 1 29.2 0 a14.6 14.6 0 1 1 -29.2 0"
              />
            </defs>
            <circle cx="20" cy="20" r="19.4" className="tb-ins__seal-rim" />
            <circle cx="20" cy="20" r="18.2" className="tb-ins__seal-face" />
            <circle cx="20" cy="20" r="11.2" className="tb-ins__seal-core" />
            <text
              className="tb-ins__seal-text"
              textLength="88"
              lengthAdjust="spacing"
            >
              <textPath href={`#${wallId}-ring`}>
                ONE FOR THE LIFETIME ·
              </textPath>
            </text>
            <text
              x="20"
              y="22.4"
              textAnchor="middle"
              className="tb-ins__seal-mark"
            >
              G7
            </text>
          </svg>
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.74)}cqw` }}
            >
              {name}
            </div>
            {card.kicker && <div className="tb-ins__moment">{card.kicker}</div>}
            <div className="tb-ins__fine">
              <span>
                {card.team} · {SEASON}
              </span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Ultimate Stardom: the back-of-jersey photo full bleed (the jersey is the nameplate),
    // a thick holo foil frame that shifts with the tilt, quiet type in a soft fade
    case "stardom":
      return (
        <div className="tb-ins tb-ins--stardom">
          {photo()}
          <div className="tb-ins__holoframe" aria-hidden />
          <div className="tb-ins__fade" aria-hidden />
          <div className="tb-ins__set">Ultimate Stardom</div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.52)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__fine">
              <span>Best of {SEASON}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // The Light / The Shadow: a beam of light split by a prism behind the player, landing in two
    // team-colour stripes. The Light is bright on white; The Shadow is the beam swallowed in black.
    case "light":
    case "shadow": {
      const east = card.type === "light";
      return (
        <div className={`tb-ins tb-ins--${card.type}`}>
          {photo(
            <div className="tb-ins__prism" aria-hidden>
              <i className="is-beam" />
              <i className="is-spectrum" />
              <i className="is-stripes" />
            </div>,
          )}
          <div className="tb-ins__set">
            {east ? "The Light" : "The Shadow"}
            <span>{east ? "Eastern Conference" : "Western Conference"}</span>
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__namebar">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.78)}cqw` }}
            >
              {name}
            </div>
            <b>{p.jersey || teamCode(card.team)}</b>
          </div>
          <div className="tb-ins__foot">
            <div className="tb-ins__fine">
              <span>{card.team}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Stone Fortress: a castle wall. The team's colour as the sky behind a row of battlements, the
    // wall below in dark granite masonry, the photo set into it in a bevelled stone frame with a
    // team-colour inlay, the rating hung on a heater shield, the name cut big and pale into the stone
    case "fortress":
      return (
        <div className="tb-ins tb-ins--fortress">
          <div className="tb-ins__sky" aria-hidden />
          <div className="tb-ins__battlements" aria-hidden />
          {photo()}
          <div className="tb-ins__inlay" aria-hidden />
          <div className="tb-ins__shield">
            <small>DEF</small>
            <b>{card.ovr}</b>
          </div>
          <div className="tb-ins__inscription">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.74)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__carve">Stone Fortress</div>
            <div className="tb-ins__fine is-center">
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Cult Classic: yellowed vintage stock, the photo window printed a little off-centre
    case "cult":
      return (
        <div className="tb-ins tb-ins--cult">
          {photo(<div className="tb-ins__rosette" aria-hidden />)}
          <div className="tb-ins__cardno" aria-hidden>
            {card.designId.replace(/^CC/, "")}
          </div>
          <div className="tb-ins__foot">
            <div className="tb-ins__stripe" aria-hidden />
            <div className="tb-ins__cultmark">Cult Classic</div>
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.7)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__line">
              <span>{card.team}</span>
              <span>
                {p.pos} · {card.ovr}
              </span>
              {serial}
            </div>
            <div className="tb-ins__fine">
              <span>{card.note ?? "Franchise cult hero"}</span>
              {no}
            </div>
          </div>
        </div>
      );

    // Best of the Best: a big notch-cornered photo (the trophies carry the gold), the rating on
    // the photo, a plate with a team-colour stripe, the name, the Finals line and the year
    case "botb":
      return (
        <div className="tb-ins tb-ins--botb">
          {photo()}
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__set">Best of the Best</div>
          <div className="tb-ins__plate">
            <div className="tb-ins__plate-main">
              <div
                className="tb-ins__name"
                style={{ fontSize: `${nameSize(name, 0.78)}cqw` }}
              >
                {name}
              </div>
              <div className="tb-ins__line">
                <b>Finals MVP</b>
                <span>{card.team}</span>
                {serial}
              </div>
            </div>
            <div className="tb-ins__plate-year">{card.kicker}</div>
          </div>
        </div>
      );

    // Rivalries (Legendary): a prize-fight poster. The photo clean above; below it a cream paper bill
    // under a heavy black and red rule, the two surnames printed big and stacked, each behind a
    // block in its team's colour, a red italic "vs" between them.
    case "rivalries": {
      const p2 = card.players[1];
      const billing = (pl: typeof p | undefined, team: string | undefined, colour: string) => {
        const last = pl ? lastName(pl.name) : "";
        const first = pl ? pl.name.slice(0, pl.name.length - last.length).trim() : "";
        return (
          <div className="tb-ins__rvrow">
            <i style={{ background: `var(${colour})` }}>{team ? teamCode(team) : ""}</i>
            <div>
              <small>{first}</small>
              <b style={{ fontSize: `${Math.min(11, 72 / Math.max(1, last.length * 0.52))}cqw` }}>
                {last}
              </b>
            </div>
          </div>
        );
      };
      return (
        <div className="tb-ins tb-ins--rivalries">
          {photo(
            <div className="tb-ins__halves" aria-hidden>
              <span>{initials(p.name)}</span>
              <span>{p2 ? initials(p2.name) : ""}</span>
            </div>,
          )}
          <div className="tb-ins__rvbill">
            <div className="tb-ins__rvhead">
              <span>Rivalries</span>
              <span>
                <b>{card.ovr}</b> Pair
              </span>
            </div>
            {billing(p, card.team, "--t1")}
            <div className="tb-ins__rvvs" aria-hidden>
              vs
            </div>
            {billing(p2, card.team2, "--u1")}
            <div className="tb-ins__fine tb-ins__rvfine">
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Flash of Brilliance: one camera flash glinting across the top corner, slanted type
    case "flash":
      return (
        <div className="tb-ins tb-ins--flash">
          {photo()}
          <div className="tb-ins__flashbulb" aria-hidden />
          <div className="tb-ins__fade" aria-hidden />
          <div className="tb-ins__set">
            Flash of
            <br />
            Brilliance
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.8)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__fine">
              <span>{card.team}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Time Wizards: the player trailed by two faint echoes shifted ahead, ahead of their time
    case "wizards":
      return (
        <div className="tb-ins tb-ins--wizards">
          {photo(
            props.showImg ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- echoes of the same splash art */}
                <img
                  className="tb-ins__echo is-far"
                  src={props.imgSrc}
                  alt=""
                  aria-hidden
                  draggable={false}
                  referrerPolicy="no-referrer"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- echoes of the same splash art */}
                <img
                  className="tb-ins__echo is-near"
                  src={props.imgSrc}
                  alt=""
                  aria-hidden
                  draggable={false}
                  referrerPolicy="no-referrer"
                />
              </>
            ) : (
              <div className="tb-ins__echo-mono" aria-hidden>
                <span>{initials(name)}</span>
                <span>{initials(name)}</span>
              </div>
            ),
          )}
          <div className="tb-ins__fade" aria-hidden />
          <div className="tb-ins__set">Time Wizards</div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.78)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__moment">
              Ahead of their time · {card.team}
            </div>
            <div className="tb-ins__fine">
              <span>{p.pos}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Founding Father: draft night. A dark stage lit by camera flashes, the draft photo hung as a
    // cream-bordered press print, "With the Nth pick" on a caption tag, the name on a team-colour podium
    case "founders":
      return (
        <div className="tb-ins tb-ins--founders">
          <div className="tb-ins__flashes" aria-hidden>
            <i />
            <i />
            <i />
          </div>
          {photo()}
          <Rating ovr={card.ovr} pos={p.pos} />
          {card.meta && (
            <div className="tb-ins__pickcap">With the {ordinal(card.meta)} pick</div>
          )}
          <div className="tb-ins__podium">
            <div className="tb-ins__charter">Founding Father</div>
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.84)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__est">
              {card.team}
              {card.note && <> · {card.note} Draft</>}
            </div>
            <div className="tb-ins__fine is-center">
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // The Dream Team: navy, a row of stars, Barcelona 1992, red and white stripes at the foot
    case "dreamteam":
      return (
        <div className="tb-ins tb-ins--dreamteam">
          <div className="tb-ins__head">
            <svg className="tb-ins__stars" viewBox="0 0 60 10" aria-hidden>
              {[5, 17.5, 30, 42.5, 55].map((x) => (
                <path
                  key={x}
                  d={`M${x} 0.6 L${x + 1.2} 3.6 L${x + 4.3} 3.7 L${x + 1.9} 5.6 L${x + 2.7} 8.7 L${x} 6.9 L${x - 2.7} 8.7 L${x - 1.9} 5.6 L${x - 4.3} 3.7 L${x - 1.2} 3.6 Z`}
                />
              ))}
            </svg>
            <div className="tb-ins__dtname">The Dream Team</div>
            <div className="tb-ins__dtplace">{card.kicker}</div>
          </div>
          {photo()}
          <div className="tb-ins__stripes" aria-hidden />
          <div className="tb-ins__dtplate">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.7)}cqw` }}
            >
              {name}
            </div>
            <b>{card.ovr}</b>
            <div className="tb-ins__fine">
              <span>
                {card.team} · {p.pos}
              </span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Lunar New Year: a red envelope. Lacquer-red stock under a gold lattice of interlocking
    // coins, the photo in a moon-gate arch, the year's animal as a gold seal stamped on its foot
    case "lunar": {
      const animal = card.kicker ?? "";
      const glyph = ZODIAC[animal];
      return (
        <div className="tb-ins tb-ins--lunar">
          <div className="tb-ins__lattice" aria-hidden />
          {photo()}
          <div className="tb-ins__set">
            Lunar New Year
            {animal && <span>Year of the {animal}</span>}
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          {glyph && (
            <div className="tb-ins__zseal" aria-hidden>
              <span>{glyph}</span>
            </div>
          )}
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.8)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__fine">
              <span>{card.team}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Day of the Dead: full art under a string of papel picado, a thin marigold frame, the art
    // fading into violet night at the foot, a small sugar skull stamped by the set name
    case "dotd": {
      const n = Number(card.designId.match(/\d+$/)?.[0] ?? 0);
      return (
        <div className="tb-ins tb-ins--dotd">
          {photo()}
          <div className="tb-ins__fade" aria-hidden />
          <div className="tb-ins__picado" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div className="tb-ins__ddset">
              <SugarSkull hue={n % SKULL_EYES.length} />
              Day of the Dead
            </div>
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.8)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__fine">
              <span>
                {card.team} · {p.pos}
              </span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    // The Third Eye: near-black blue, faint rings radiating from a vertical eye opened in the
    // middle of the card; the photo is seen through it, its lid lit a cold blue
    case "thirdeye":
      return (
        <div className="tb-ins tb-ins--thirdeye">
          <div className="tb-ins__orbits" aria-hidden />
          <div className="tb-ins__lid" aria-hidden />
          {photo()}
          <div className="tb-ins__set">The Third Eye</div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <svg className="tb-ins__eye" viewBox="0 0 40 16" aria-hidden>
              <path
                d="M2 8 Q20 -4 38 8 Q20 20 2 8 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx="20" cy="8" r="3.4" fill="currentColor" />
            </svg>
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.8)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__fine is-center">
              <span>
                {card.team} · {p.pos}
              </span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Iconic Moments (Grail): the photo untouched, the Aurora border's light rising up both side
    // edges (green on the left, violet on the right) and fading before the middle. The set and date
    // run down the left edge, the moment's name up the right, in thin spaced capitals.
    case "iconic": {
      const title = card.title ?? "";
      const size = Math.min(5.4, 70 / (Math.max(1, title.length) * 1.12));
      return (
        <div className="tb-ins tb-ins--iconic">
          {photo()}
          <div className="tb-ins__aurora" aria-hidden>
            <i />
            <i />
          </div>
          <div className="tb-ins__fade" aria-hidden />
          <div className="tb-ins__imdate">
            Iconic Moments
          </div>
          <div className="tb-ins__imtitle" style={{ fontSize: `${size}cqw` }}>
            {title}
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.72)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__imline">
              {card.kicker ? `${card.kicker} · ` : ""}
              {card.team} · {card.meta}
            </div>
            <div className="tb-ins__fine">
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Passports: the photo above a passport data page. The flag printed on the page at its true
    // 3:2 with a fold of light across it, the flag's colours run down the card's edge, the page
    // tinted from the flag with a guilloche, the two machine-readable lines at the foot, and an
    // entry stamp for the team inked on the photo.
    case "passports": {
      const iso = card.kicker ?? "";
      const nat = NATIONS[iso];
      const last = lastName(name);
      const first = name.slice(0, name.length - last.length).trim();
      const team = teamCode(card.team);
      const mrz = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "<");
      const fill = (s: string) => (s + "<".repeat(34)).slice(0, 34);
      return (
        <div
          className="tb-ins tb-ins--passports"
          style={{ "--pp": nat?.colors.find((c) => c !== "#ffffff") ?? "#233862" } as React.CSSProperties}
        >
          {photo()}
          <div className="tb-ins__pprail" style={{ background: flagStripes(iso) }} aria-hidden />
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__ppstamp" aria-hidden>
            <small>Entry</small>
            <b>{team}</b>
            <small>{SEASON}</small>
          </div>
          <div className="tb-ins__pppage">
            <div className="tb-ins__pphead">
              <span>Passport</span>
              <span>
                {serial}
                {no}
              </span>
            </div>
            <div className="tb-ins__ppbody">
              <div className="tb-ins__ppflag">
                <Flag code={iso} />
              </div>
              <dl className="tb-ins__ppdata">
                <div>
                  <dt>Surname</dt>
                  <dd style={{ fontSize: `${Math.min(4.6, 46 / Math.max(1, last.length * 0.52))}cqw` }}>
                    {last}
                  </dd>
                </div>
                {first && (
                  <div>
                    <dt>Given names</dt>
                    <dd>{first}</dd>
                  </div>
                )}
                <div>
                  <dt>Nationality</dt>
                  <dd>{nat?.name ?? p.nation}</dd>
                </div>
              </dl>
            </div>
            <div className="tb-ins__ppmrz" aria-hidden>
              <span>{fill(`P<${iso}${mrz(last)}<<${mrz(first)}`)}</span>
              <span>{fill(`${card.designId}<<${team}<<${p.pos}<<${SEASON.replace("-", "")}`)}</span>
            </div>
          </div>
        </div>
      );
    }

    // Snipers, Dimers, Snatchers: the set's colour owns the card (blue, green, red), so the three read
    // apart at a glance whatever team the player is on. The set's name across the top as a heavy
    // slanted wordmark, the photo in a window framed in the set colour, and below it a solid panel
    // of the colour with the skill's court diagram as a bold watermark, the name with a team chip,
    // and the number the player is in the set for, huge.
    case "snipers":
    case "dimers":
    case "snatchers": {
      const skill = SKILL[card.type];
      const v = card.stats?.[skill.key];
      return (
        <div className={`tb-ins tb-ins--trio is-${card.type}`}>
          <div className="tb-ins__trmark" aria-hidden>
            {skill.label}
          </div>
          {photo()}
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__trpanel">
            <SkillMotif kind={card.type} />
            <div className="tb-ins__trmain">
              <div
                className="tb-ins__name"
                style={{ fontSize: `${nameSize(name, 0.6)}cqw` }}
              >
                {name}
              </div>
              <div className="tb-ins__trteam">
                <i style={{ background: "var(--t1)", color: "var(--t1-ink)" }}>{teamCode(card.team)}</i>
                {skill.label}
              </div>
            </div>
            {v != null && (
              <div className="tb-ins__trstat">
                <b>{skill.key === "3P%" ? `${v.toFixed(1)}%` : v.toFixed(1)}</b>
                <small>
                  {skill.key === "3P%" ? "From three" : skill.key === "AST" ? "Assists" : "Rebounds"} · {SEASON}
                </small>
              </div>
            )}
            <div className="tb-ins__fine">
              <span>{p.pos}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Thanksgiving: full art inside a crimped pie-crust border, autumn leaves drifting over the
    // edges, the set's name in letters of five harvest colours that bob like a kids' menu, the name
    // written on a place card at the table. Every card hides one small Easter egg somewhere.
    case "thanksgiving": {
      const n = Number(card.designId.match(/\d+$/)?.[0] ?? 0);
      const egg = EGGS[n % EGGS.length];
      return (
        <div className="tb-ins tb-ins--thanksgiving">
          {photo()}
          <div className="tb-ins__fade" aria-hidden />
          <div className="tb-ins__tgcrust" aria-hidden />
          <div className="tb-ins__tgleaves" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} viewBox="0 0 24 24">
                <path d={LEAF} />
              </svg>
            ))}
          </div>
          <svg className="tb-ins__tgegg" viewBox="0 0 24 24" style={EGG_SPOTS[n % EGG_SPOTS.length]} role="img" aria-label={`Hidden: ${egg.label}`}>
            {egg.d}
          </svg>
          <div className="tb-ins__tgmark">
            <LetterRun text="Thanksgiving" seed={card.designId} colors={["#ff8a1f", "#e8324a", "#ffc93c", "#7ccf5a", "#b56cff"]} />
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__tgcard">
            <div className="tb-ins__tgname" style={{ fontSize: `${nameSize(name, 1.15)}cqw` }}>
              {name}
            </div>
            <div className="tb-ins__fine is-center">
              <span>
                {card.team} · {p.pos}
              </span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Spark Plug: a circuit board. The photo in a yellow-edged window, yellow traces linking it to
    // the rating, the wordmark and the nameplate with a pulse of current running along them, the
    // rating in a battery, a lightning bolt splitting the wordmark, the name on a yellow bar.
    case "sparkplug":
      return (
        <div className="tb-ins tb-ins--sparkplug">
          <SparkCircuit />
          {photo()}
          <div className="tb-ins__spmark">
            Spark
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d={BOLT} />
            </svg>
            Plug
          </div>
          <div className="tb-ins__spbattery">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__spplate">
            <div className="tb-ins__name" style={{ fontSize: `${nameSize(name, 0.7)}cqw` }}>
              {name}
            </div>
            <div className="tb-ins__fine">
              <span>{card.team}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Supervillains: a black card lit from below by hellfire, the photo in a pointed gothic arch
    // with a red glow and devil horns on its shoulders, the rating on a saw-edged blood seal, the
    // set and the name in red engraved capitals.
    case "villains":
      return (
        <div className="tb-ins tb-ins--villains">
          <div className="tb-ins__vlfire" aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <div className="tb-ins__vlglow" aria-hidden />
          {photo()}
          <svg className="tb-ins__vlhorns" viewBox="0 0 100 30" aria-hidden>
            <path d="M22 30C12 24 8 12 14 0c1 10 6 18 16 22z" />
            <path d="M78 30c10-6 14-18 8-30-1 10-6 18-16 22z" />
          </svg>
          <div className="tb-ins__vlmark">Supervillains</div>
          <div className="tb-ins__vlseal">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__foot">
            <div className="tb-ins__name" style={{ fontSize: `${nameSize(name, 0.72)}cqw` }}>
              {name}
            </div>
            <div className="tb-ins__fine">
              <span>{card.team}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // The Circus: the big top. Red and cream tent stripes under a scalloped valance, a marquee sign
    // with bulbs, the photo in a crooked polka-dot frame that will not sit still, the rating on a
    // juggling ball, a silly sticker slapped on, and the name bouncing letter by letter on a banner.
    case "circus": {
      const n = Number(card.designId.match(/\d+$/)?.[0] ?? 0);
      return (
        <div className="tb-ins tb-ins--circus">
          <div className="tb-ins__cxvalance" aria-hidden />
          <div className="tb-ins__cxsign">The Circus</div>
          <div className="tb-ins__cxframe">{photo()}</div>
          <div className="tb-ins__cxball">
            <b>{card.ovr}</b>
          </div>
          <div className="tb-ins__cxsticker" aria-hidden>
            {STICKERS[n % STICKERS.length]}
          </div>
          <div className="tb-ins__cxbanner">
            <div className="tb-ins__cxname" style={{ fontSize: `${nameSize(name, 0.66)}cqw` }}>
              <LetterRun text={name} seed={card.designId} wild />
            </div>
          </div>
          <div className="tb-ins__cxact">
            Act No. {n} · {card.team} · {p.pos}
            {serial}
          </div>
        </div>
      );
    }

    // Career Montage (Mythic): a whole career in one frame. The full-art photo stays true in the
    // middle while its two sides fade into the team's colours, the main colour from the left and the
    // second from the right. The career span runs huge in outlined type across the foot.
    case "montage": {
      // the right side takes the team's second colour, unless that is white, black or grey (it
      // would come out washed out), in which case a lighter shade of the main colour
      const t2 = teamColors(card.team)[1];
      const rgb = [1, 3, 5].map((i) => parseInt(t2.slice(i, i + 2), 16));
      const plain = luminance(t2) > 0.7 || luminance(t2) < 0.03 || Math.max(...rgb) - Math.min(...rgb) < 40;
      return (
        <div
          className="tb-ins tb-ins--montage"
          style={{ "--cm2": plain ? "color-mix(in oklab, var(--t1) 50%, #fff)" : "var(--t2)" } as React.CSSProperties}
        >
          {photo()}
          {props.showImg && (
            <>
              {(["l", "r"] as const).map((side) => (
                <div key={side} className={`tb-ins__cmcut is-${side}`} aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element -- the same splash art, cut */}
                  <img src={props.imgSrc} alt="" draggable={false} referrerPolicy="no-referrer" />
                </div>
              ))}
            </>
          )}
          <div className="tb-ins__fade" aria-hidden />
          <div className="tb-ins__set">Career Montage</div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            {card.kicker && <div className="tb-ins__cmspan">{card.kicker}</div>}
            <div className="tb-ins__name" style={{ fontSize: `${nameSize(name, 0.74)}cqw` }}>
              {name}
            </div>
            <div className="tb-ins__fine">
              <span>
                {card.team} · {p.pos}
              </span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Team Culture: the art does the work (it carries the players and their names). Nothing on the
    // photo but a small rating; a slim strip at the foot with the set and the team in its colours.
    case "teamculture":
      return (
        <div className="tb-ins tb-ins--teamculture">
          {photo()}
          <div className="tb-ins__tcrate">{card.ovr}</div>
          <div className="tb-ins__tcstrip">
            <span>Team Culture</span>
            <b style={{ background: "var(--t1)", color: "var(--t1-ink)", boxShadow: "inset 0 -0.6cqw 0 var(--t2)" }}>
              {teamCode(card.team)}
            </b>
            {serial}
            {no}
          </div>
        </div>
      );

    // Crownless Emperors: regal, and missing the one thing. Royal purple velvet with a faint gold
    // damask, the photo in an arched gilded frame, and above it a crimson cushion with gold tassels,
    // empty: only a faint dashed ghost of a crown hangs over it. Gold Bodoni for the set and name.
    case "emperors":
      return (
        <div className="tb-ins tb-ins--emperors">
          <div className="tb-ins__set">Crownless Emperors</div>
          {photo()}
          <svg className="tb-ins__ceghost" viewBox="0 0 60 30" aria-hidden>
            <path d="M6 26L3 6l13 10L30 2l14 14L57 6l-3 20z" />
            <circle cx="30" cy="2" r="2" />
          </svg>
          <div className="tb-ins__cecushion" aria-hidden>
            <i />
            <i />
          </div>
          <div className="tb-ins__cecoin">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__ceplate">
            <div className="tb-ins__name" style={{ fontSize: `${nameSize(name, 0.7)}cqw` }}>
              {name}
            </div>
            <div className="tb-ins__fine is-center">
              <span>{card.team}</span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );

    // Four Horsemen (Grail): each player one of the riders (Conquest white, Death pale, War red,
    // Famine black and gold). Full art under a storm closing in from the edges in the rider's colour,
    // a jagged crack of lightning, embers rising, a huge outlined numeral running off the left edge,
    // and the rider's name burned huge across the foot.
    case "horsemen": {
      const rider = (card.kicker ?? "Conquest").toLowerCase();
      const num = ["conquest", "death", "war", "famine"].indexOf(rider);
      return (
        <div className={`tb-ins tb-ins--horsemen is-${rider}`}>
          {photo()}
          <div className="tb-ins__hmstorm" aria-hidden />
          <div className="tb-ins__hmnum" aria-hidden>
            {["I", "II", "III", "IV"][Math.max(0, num)]}
          </div>
          <svg className="tb-ins__hmbolt" viewBox="0 0 30 80" aria-hidden>
            <path d="M18 0L8 30h8L4 56h7L2 80l20-34h-8l12-22h-8z" />
          </svg>
          <div className="tb-ins__hmembers" aria-hidden>
            <i />
            <i />
          </div>
          <div className="tb-ins__set">The Four Horsemen</div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div className="tb-ins__hmrider">{card.kicker}</div>
            <div className="tb-ins__name" style={{ fontSize: `${nameSize(name, 0.62)}cqw` }}>
              {name}
            </div>
            <div className="tb-ins__fine">
              <span>
                {card.team} · {p.pos}
              </span>
              {serial}
              {no}
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
