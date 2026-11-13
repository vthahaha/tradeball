"use client";

// One layout per insert set, each taking a cue from a different corner of the hobby:
// Mosaic-style line fields, a black-bordered photo card, a gold medal foil, a comic burst,
// an ornate cosmic frame, giant condensed type, 8-bit pixels, and an arched 80s window.
import type { CardView, Finish } from "@/lib/catalog";
import { InsertScene } from "./CardArt";
import { fmtStat, initials, nameSize, splitName } from "./cardText";

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

/** The player: the chosen splash art, or the initials in the set's ink until there is some. */
function Art({
  card,
  imgSrc,
  showImg,
  onImgError,
}: Pick<InsertFrontProps, "card" | "imgSrc" | "showImg" | "onImgError">) {
  return (
    <div className="tb-ins__art">
      {showImg && card.type === "shadow" && (
        // eslint-disable-next-line @next/next/no-img-element -- the player's own shadow, from the same splash art
        <img
          className="tb-card__ghost"
          src={imgSrc}
          alt=""
          aria-hidden
          draggable={false}
          referrerPolicy="no-referrer"
        />
      )}
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

const spaced = (s: string) => s.toUpperCase();

export function InsertFront(props: InsertFrontProps) {
  const { card, uid } = props;
  const p = card.players[0];
  const name = p.name;
  const [first, last] = splitName(name);
  const art = <Art {...props} />;
  const serial = <Serial {...props} />;
  const scene = <InsertScene type={card.type} id={uid} />;

  switch (card.type) {
    // 1. New Blood: a line field, an italic set title, a white plate with the move on it
    case "newblood":
      return (
        <div className="tb-ins tb-ins--newblood">
          {scene}
          {art}
          <div className="tb-ins__title">
            New Blood
            <small>2026 offseason</small>
          </div>
          <div className="tb-ins__hex">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__plate">
            <div className="tb-ins__move">
              <s>{card.fromTeam}</s>
              <span aria-hidden>→</span>
              <b>{card.team}</b>
              {serial}
            </div>
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.86)}cqw` }}
            >
              {name}
            </div>
          </div>
        </div>
      );

    // 2. Hard Goodbyes: a black-bordered photo card, the name spaced out across the top
    case "goodbyes":
      return (
        <div className="tb-ins tb-ins--goodbyes">
          <div
            className="tb-ins__spaced"
            style={{
              fontSize: `${Math.min(5, 78 / Math.max(name.length, 8))}cqw`,
            }}
          >
            {spaced(name)}
          </div>
          <div className="tb-ins__caption">Hard Goodbyes</div>
          <div className="tb-ins__photo">
            {scene}
            {art}
          </div>
          <div className="tb-ins__foot">
            <span>
              <b>{card.ovr}</b> {p.pos}
            </span>
            {serial}
            <span className="tb-ins__plaque">{card.meta ?? "Retired"}</span>
          </div>
        </div>
      );

    // 3. Golden Boy: engraved gold foil with a medallion; the name on a small black tablet
    case "goldenboy":
      return (
        <div className="tb-ins tb-ins--goldenboy">
          {scene}
          {art}
          <div className="tb-ins__medal">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__tablet">
            <span>{first}</span>
            <b style={{ fontSize: `${nameSize(last || name, 0.72)}cqw` }}>
              {last || name}
            </b>
            <small>
              {card.team} {serial}
            </small>
          </div>
        </div>
      );

    // 4. Generational: a comic burst, a brush-script set logo, the number on a jagged sticker
    case "generational": {
      const box = card.stats ? Object.entries(card.stats) : [];
      const headline = card.title ?? "";
      return (
        <div className="tb-ins tb-ins--generational">
          {scene}
          {art}
          <div className="tb-ins__script" aria-hidden>
            Generational
          </div>
          <div className="tb-ins__sticker">
            <b>{headline}</b>
          </div>
          <div className="tb-ins__ovrchip">
            {card.ovr} <small>{p.pos}</small>
          </div>
          <div className="tb-ins__bottom">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.88)}cqw` }}
            >
              {name}
            </div>
            {card.kicker && <div className="tb-ins__kicker">{card.kicker}</div>}
            <div className="tb-ins__box" title={card.statLine ?? undefined}>
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

    // 5. Ultimate Stardom: an ornate frame on a nebula; spaced title, name in the base rail
    case "stardom":
      return (
        <div className="tb-ins tb-ins--stardom">
          {scene}
          {art}
          <div className="tb-ins__cosmos">Ultimate Stardom</div>
          <div className="tb-ins__node">
            <b>{card.ovr}</b>
          </div>
          <div className="tb-ins__rail">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.62)}cqw` }}
            >
              {name}
            </div>
            <span>
              {card.team} · {p.pos} {serial}
            </span>
          </div>
        </div>
      );

    // 6–7. The Light / The Shadow: giant condensed type running up the card, a mirrored pair
    case "light":
    case "shadow": {
      const word = card.type === "light" ? "Light" : "Shadow";
      return (
        <div className={`tb-ins tb-ins--${card.type}`}>
          {scene}
          <div className="tb-ins__giant" aria-hidden>
            <span>The</span>
            {word}
          </div>
          {art}
          <div className="tb-ins__side">
            <b style={{ fontSize: `${nameSize(name, 0.72)}cqw` }}>{name}</b>
            <span>
              {card.team} · {card.type === "light" ? "East" : "West"}
            </span>
          </div>
          <div className="tb-ins__dot">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          {serial && <div className="tb-ins__corner">{serial}</div>}
        </div>
      );
    }

    // 8. Stone Fortress: an 8-bit castle; pixel title, the name on a stone plate
    case "fortress":
      return (
        <div className="tb-ins tb-ins--fortress">
          {scene}
          {art}
          <div className="tb-ins__pixel">
            Stone
            <br />
            Fortress
          </div>
          <div className="tb-ins__def">
            <small>DEF</small>
            <b>{card.ovr}</b>
          </div>
          <div className="tb-ins__stone">
            <div
              className="tb-ins__name"
              style={{ fontSize: `${nameSize(name, 0.58)}cqw` }}
            >
              {name}
            </div>
            <span>
              {card.team} · {p.pos} {serial}
            </span>
          </div>
        </div>
      );

    // 9. Cult Classic: an 80s card: plain name up top, an arched photo window, a team band
    case "cult":
      return (
        <div className="tb-ins tb-ins--cult">
          {scene}
          <div
            className="tb-ins__topname"
            style={{ fontSize: `${nameSize(name, 0.62)}cqw` }}
          >
            {name}
          </div>
          <div className="tb-ins__arch">{art}</div>
          <div className="tb-ins__badge">
            <small>Cult Classic</small>
            <b>{card.ovr}</b>
          </div>
          <div className="tb-ins__band">
            <b
              style={{
                fontSize: `${Math.min(10, 74 / Math.max(card.team.length, 5))}cqw`,
              }}
            >
              {card.team}
            </b>
            <span>
              {p.pos} {serial}
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
