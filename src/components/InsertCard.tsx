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
} from "@/lib/catalog";
import { fmtStat, initials, lastName, nameSize } from "./cardText";

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
              style={{ fontSize: `${nameSize(name, 0.6)}cqw` }}
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

    // Stone Fortress: a monument. One stone slab, the full-colour photo set into it as a recessed
    // panel with a team-colour inlay, the name and set carved once below, the rating on a block
    case "fortress":
      return (
        <div className="tb-ins tb-ins--fortress">
          {photo()}
          <div className="tb-ins__inlay" aria-hidden />
          <div className="tb-ins__block">
            <small>DEF</small>
            <b>{card.ovr}</b>
          </div>
          <div className="tb-ins__inscription">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.7)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__carve">
              Stone Fortress · {card.team} · {p.pos}
            </div>
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
              <i>Cult Classic</i>
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
            {card.kicker && <span> · {card.kicker}</span>}
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

    default:
      return null;
  }
}
