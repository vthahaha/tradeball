"use client";

// One layout per insert set. Each set is one print or photo technique plus its name set
// as type; there are no drawn scenes. The photo (splash art) leads every card.
import { useId } from "react";
import type { CardView, Finish } from "@/lib/catalog";
import { fmtStat, initials, nameSize } from "./cardText";

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
          className="tb-card__splash"
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
  const photo = (children?: React.ReactNode) => (
    <Photo {...props}>{children}</Photo>
  );

  switch (card.type) {
    // New Blood: a split-tone photo, old team's colour on the left of a seam, new on the right
    case "newblood":
      return (
        <div className="tb-ins tb-ins--newblood">
          {photo(<div className="tb-ins__old" aria-hidden />)}
          <div className="tb-ins__seam" aria-hidden>
            <span>New Blood</span>
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
          </div>
        </div>
      );

    // Hard Goodbyes: black and white on matte black, a silver keyline, quiet type
    case "goodbyes":
      return (
        <div className="tb-ins tb-ins--goodbyes">
          {photo()}
          <div className="tb-ins__keyline" aria-hidden />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.62)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__line">
              <i>Hard Goodbyes</i>
              <span>{card.meta ?? "Retired"}</span>
              <span>
                {card.ovr} {p.pos}
              </span>
              {serial}
            </div>
          </div>
        </div>
      );

    // Golden Boy: two inks, black and gold; the photo printed as a gold duotone
    case "goldenboy":
      return (
        <div className="tb-ins tb-ins--goldenboy">
          {photo()}
          <div className="tb-ins__set">Golden Boy</div>
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
          </div>
        </div>
      );

    // Generational: the night's number in outline, half behind the player and half over them
    case "generational": {
      const big = card.title?.match(/\d+/)?.[0] ?? "";
      const box = card.stats ? Object.entries(card.stats) : [];
      return (
        <div className="tb-ins tb-ins--generational">
          {photo(
            <div className="tb-ins__big" aria-hidden>
              {big}
            </div>,
          )}
          <div className="tb-ins__big is-front" aria-hidden>
            {big}
          </div>
          <div className="tb-ins__set">
            Generational
            {card.kicker && <span>{card.kicker}</span>}
          </div>
          <Rating ovr={card.ovr} pos={p.pos} />
          <div className="tb-ins__foot">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.82)}cqw` }}
            >
              {name}
            </div>
            <div className="tb-ins__line" title={card.statLine ?? undefined}>
              {box.map(([k, v]) => (
                <span key={k}>
                  <b>{fmtStat(true, v)}</b> {k}
                </span>
              ))}
              {serial}
            </div>
          </div>
        </div>
      );
    }

    // Ultimate Stardom: holographic foil behind the player, moving with the tilt
    case "stardom":
      return (
        <div className="tb-ins tb-ins--stardom">
          {photo(<div className="tb-ins__holo" aria-hidden />)}
          <div className="tb-ins__set">Ultimate Stardom</div>
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
              {serial}
            </div>
          </div>
        </div>
      );

    // The Light / The Shadow: one photo lit two ways, high key in the East and low key in the West
    case "light":
    case "shadow":
      return (
        <div className={`tb-ins tb-ins--${card.type}`}>
          {photo()}
          <div className="tb-ins__set">
            {card.type === "light" ? "The Light" : "The Shadow"}
            <span>{card.type === "light" ? "East" : "West"}</span>
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
              {serial}
            </div>
          </div>
        </div>
      );

    // Stone Fortress: a granite frame, the set name running round it like a wall
    case "fortress":
      return (
        <div className="tb-ins tb-ins--fortress">
          <Wall id={`${wallId}-wall`} />
          {photo()}
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
              {serial}
            </div>
          </div>
        </div>
      );

    // Cult Classic: yellowed vintage stock, the photo window printed a little off-centre
    case "cult":
      return (
        <div className="tb-ins tb-ins--cult">
          {photo()}
          <div className="tb-ins__foot">
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
          </div>
        </div>
      );

    default:
      return null;
  }
}
