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
          className={`tb-card__splash ${card.art ? "" : "is-headshot"}`}
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

/** Stone Fortress: a closed rectangle of type, the set name running round the frame. */
function Wall({ id }: { id: string }) {
  const phrase = "STONE FORTRESS  ·  ";
  return (
    <svg
      className="tb-ins__wall"
      viewBox="0 0 94 134"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path id={id} d="M4.6 4.6 H89.4 V129.4 H4.6 Z" fill="none" />
      <text>
        <textPath href={`#${id}`}>{phrase.repeat(12)}</textPath>
      </text>
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

    // Ultimate Stardom: holographic foil behind the player, moving with the tilt
    case "stardom":
      return (
        <div className="tb-ins tb-ins--stardom">
          {photo(
            <>
              <div className="tb-ins__holo" aria-hidden />
              <div className="tb-ins__specks" aria-hidden />
            </>,
          )}
          <div className="tb-ins__holoframe" aria-hidden />
          <div className="tb-ins__set">
            Ultimate Stardom
            <span>Best of {SEASON}</span>
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.74)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__line">
              <span>{card.team}</span>
              <Stats card={card} keys={["PTS", "REB", "AST"]} />
              {serial}
            </div>
            <div className="tb-ins__fine">
              <span>Holofoil</span>
              {no}
            </div>
          </div>
        </div>
      );

    // The Light / The Shadow: one photo lit two ways, high key in the East and low key in the West
    case "light":
    case "shadow": {
      const east = card.type === "light";
      return (
        <div className={`tb-ins tb-ins--${card.type}`}>
          {photo(<div className="tb-ins__leak" aria-hidden />)}
          <Corners kind="crop" />
          <div className="tb-ins__set">
            {east ? "The Light" : "The Shadow"}
            <span>{east ? "Eastern Conference" : "Western Conference"}</span>
          </div>
          <div className="tb-ins__abbr" aria-hidden>
            {teamCode(card.team)}
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
              <Stats card={card} keys={["PTS", "REB", "AST"]} />
              {serial}
            </div>
            <div className="tb-ins__fine">
              <span>{east ? "High key" : "Low key"}</span>
              {no}
            </div>
          </div>
        </div>
      );
    }

    // Stone Fortress: a granite frame, the set name running round it like a wall
    case "fortress":
      return (
        <div className="tb-ins tb-ins--fortress">
          <Wall id={`${wallId}-wall`} />
          <div className="tb-ins__bevel" aria-hidden />
          {photo()}
          <Corners kind="keystone" />
          <Rating ovr={card.ovr} pos={p.pos} label="DEF" />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.72)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__line">
              <span>{card.team}</span>
              <Stats card={card} keys={["STL", "BLK", "REB"]} />
              {serial}
            </div>
            <div className="tb-ins__fine">
              <span>Lockdown defense · {SEASON}</span>
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

    // Rivalries: the matchup printed as a game ticket under the photo, a tear-off stub
    // with the card number and a barcode
    case "rivalries": {
      const p2 = card.players[1];
      const side = (pl: typeof p, team?: string, colour = "--t1") => (
        <div className="tb-ins__side">
          <i style={{ background: `var(${colour})` }}>
            {team ? teamCode(team) : ""}
          </i>
          <div>
            <small>{pl?.name.split(" ")[0]}</small>
            <b
              style={{
                fontSize: `${nameSize(pl ? lastName(pl.name) : "", 0.8)}cqw`,
              }}
            >
              {pl ? lastName(pl.name) : ""}
            </b>
          </div>
        </div>
      );
      return (
        <div className="tb-ins tb-ins--rivalries">
          {photo(
            <div className="tb-ins__halves" aria-hidden>
              <span>{initials(p.name)}</span>
              <span>{p2 ? initials(p2.name) : ""}</span>
            </div>,
          )}
          <Rating ovr={card.ovr} pos="Pair" />
          <div className="tb-ins__ticket">
            <div className="tb-ins__ticket-main">
              <div className="tb-ins__ticket-head">
                <span>Rivalries</span>
                {serial}
              </div>
              {side(p, card.team, "--t1")}
              <div className="tb-ins__vsline" aria-hidden>
                <span>vs</span>
              </div>
              {side(p2, card.team2, "--u1")}
            </div>
            <div className="tb-ins__stub" aria-hidden>
              <span className="tb-ins__stubno">{card.designId}</span>
              <span className="tb-ins__barcode" />
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

    // Founding Father: a charter certificate; engraved double rule, the portrait framed like a
    // document's, the name in an engraved serif, the franchise's founding year
    case "founders":
      return (
        <div className="tb-ins tb-ins--founders">
          <div className="tb-ins__rules" aria-hidden />
          {photo()}
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div className="tb-ins__charter">Founding Father</div>
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.86)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__est">
              {card.team} · Est. {card.kicker}
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

    default:
      return null;
  }
}
