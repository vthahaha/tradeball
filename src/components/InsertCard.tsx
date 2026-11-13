"use client";

// One layout per insert set. Each set owns where its name, OVR and set wordmark sit,
// and its set name is part of the artwork, not a badge on top of it.
import type { CardView, Finish } from "@/lib/catalog";
import { FoilFilter, InsertScene } from "./CardArt";
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

const FINISH_LABEL: Partial<Record<Finish, string>> = { foil: "Foil", holo: "Holo", gold: "Gold", black: "Black", masterpiece: "Masterpiece" };

function Serial({ finish, serialNo, supply, grade }: Pick<InsertFrontProps, "finish" | "serialNo" | "supply" | "grade">) {
  const fin = FINISH_LABEL[finish];
  if (!(serialNo && supply) && !fin && grade == null) return null;
  return (
    <span className="tb-ins__serial">
      {serialNo && supply ? <b>{supply === 1 ? "1/1" : `${serialNo}/${supply}`}</b> : fin ? <span>{fin}</span> : null}
      {grade != null && <i className={grade === 10 ? "is-gem" : ""}>G{grade}</i>}
    </span>
  );
}

/** The player: chosen splash art, or the initials in the set's ink until there is some. */
function Art({ card, imgSrc, showImg, onImgError }: Pick<InsertFrontProps, "card" | "imgSrc" | "showImg" | "onImgError">) {
  const ini = initials(card.players[0].name);
  return (
    <div className="tb-ins__art">
      {showImg && card.type === "shadow" && (
        // eslint-disable-next-line @next/next/no-img-element -- the player's own shadow, from the same splash art
        <img className="tb-card__ghost" src={imgSrc} alt="" aria-hidden draggable={false} referrerPolicy="no-referrer" />
      )}
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- chosen splash art, hotlinked on purpose
        <img className="tb-card__splash" src={imgSrc} alt="" loading="lazy" decoding="async" draggable={false} referrerPolicy="no-referrer" onError={onImgError} />
      ) : (
        <div className="tb-card__mono">{ini}</div>
      )}
    </div>
  );
}

const starPath = (cx: number, cy: number, R: number, r: number, points: number) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    return `${i ? "L" : "M"}${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`;
  }).join(" ") + " Z";

export function InsertFront(props: InsertFrontProps) {
  const { card, uid } = props;
  const p = card.players[0];
  const name = p.name;
  const [first, last] = splitName(name);
  const art = <Art {...props} />;
  const serial = <Serial {...props} />;
  const big = card.title?.match(/\d+/)?.[0] ?? initials(name);
  const scene = <InsertScene type={card.type} id={uid} big={big} />;

  switch (card.type) {
    // 1. New Blood: the transactions page; the name is the headline
    case "newblood":
      return (
        <div className="tb-ins tb-ins--newblood">
          {scene}
          {art}
          <div className="tb-ins__strip">
            New Blood<small>2026 offseason</small>
          </div>
          <div className="tb-ins__stampovr">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__news">
            <div className="tb-ins__headline" style={{ fontSize: `${nameSize(name, 0.95)}cqw` }}>
              {name}
            </div>
            <div className="tb-ins__move">
              <span style={{ background: "var(--f1)" }}>{card.fromTeam}</span>
              <i aria-hidden>→</i>
              <span style={{ background: "var(--t1)" }}>{card.team}</span>
              {serial}
            </div>
          </div>
        </div>
      );

    // 2. Hard Goodbyes: an old photo with a cream border, signed at the bottom
    case "goodbyes":
      return (
        <div className="tb-ins tb-ins--goodbyes">
          <div className="tb-ins__photo">
            {scene}
            {art}
            <span className="tb-ins__sticker">
              <b>{card.ovr}</b>
              {p.pos}
            </span>
          </div>
          <div className="tb-ins__ribbon">Hard Goodbyes</div>
          <div className="tb-ins__sign">
            <div className="tb-ins__autograph" style={{ fontSize: `${nameSize(name, 1.45)}cqw` }}>
              {name}
            </div>
            <div className="tb-ins__caption">
              {card.meta ?? "Retired"} · Thank you {serial}
            </div>
          </div>
        </div>
      );

    // 3. Golden Boy: the set name stamped huge in brushed foil, the kid in front of it
    case "goldenboy":
      return (
        <div className="tb-ins tb-ins--goldenboy">
          {scene}
          <svg className="tb-ins__foil" viewBox="0 0 92 100" aria-hidden>
            <defs>
              <FoilFilter id={`${uid}-foil`} />
            </defs>
            <g filter={`url(#${uid}-foil)`}>
              <text x="46" y="44" textAnchor="middle" textLength="84" lengthAdjust="spacingAndGlyphs">
                GOLDEN
              </text>
              <text x="46" y="92" textAnchor="middle" textLength="62" lengthAdjust="spacingAndGlyphs">
                BOY
              </text>
            </g>
          </svg>
          {art}
          <div className="tb-ins__under">
            {card.team}
            {p.nation ? ` · ${p.nation}` : ""}
          </div>
          <div className="tb-ins__goldbar">
            <span style={{ fontSize: `${nameSize(last || name, 0.82)}cqw` }}>{last || name}</span>
            <b>{card.ovr}</b>
          </div>
          {serial && <div className="tb-ins__corner">{serial}</div>}
        </div>
      );

    // 4. Generational: the scoreboard; the name runs up the side, the box score along the foot
    case "generational": {
      const box = card.stats ? Object.entries(card.stats) : [];
      return (
        <div className="tb-ins tb-ins--generational">
          {scene}
          {art}
          <div className="tb-ins__ledtitle">Generational</div>
          <div className="tb-ins__ledovr">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__vname" style={{ fontSize: `${nameSize(name, 0.95)}cqw` }}>
            {name}
          </div>
          {card.kicker && <div className="tb-ins__kicker">{card.kicker}</div>}
          <div className="tb-ins__board" title={card.statLine ?? undefined}>
            {box.map(([k, v]) => (
              <div key={k}>
                <b>{fmtStat(true, v)}</b>
                <span>{k}</span>
              </div>
            ))}
            {serial}
          </div>
        </div>
      );
    }

    // 5. Ultimate Stardom: a theatre marquee; the surname spelled out in letter tiles
    case "stardom": {
      const letters = (last || name).toUpperCase().split("");
      const tile = Math.min(9.4, 84 / (Math.max(letters.length, 1) * 1.25));
      return (
        <div className="tb-ins tb-ins--stardom">
          {scene}
          {art}
          <div className="tb-ins__marquee">
            <span>Ultimate</span>
            <b>Stardom</b>
          </div>
          <div className="tb-ins__star">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d={starPath(12, 12.6, 11.5, 5, 5)} />
            </svg>
            <b>{card.ovr}</b>
          </div>
          <div className="tb-ins__billing">
            {first && <div className="tb-ins__first">{first}</div>}
            <div className="tb-ins__tiles" style={{ fontSize: `${tile}cqw` }}>
              {letters.map((ch, i) =>
                ch === " " ? (
                  <span key={i} className="is-gap" />
                ) : (
                  <span key={i} style={{ rotate: `${((i * 7) % 5) - 2}deg` }}>
                    {ch}
                  </span>
                ),
              )}
            </div>
            <div className="tb-ins__team">
              {card.team} · {p.pos} {serial}
            </div>
          </div>
        </div>
      );
    }

    // 6. The Light (East): thin type in the glare behind the player
    case "light":
      return (
        <div className="tb-ins tb-ins--light">
          {scene}
          <div className="tb-ins__thin" aria-hidden>
            The
            <br />
            Light
          </div>
          {art}
          <div className="tb-ins__east">East</div>
          <div className="tb-ins__plainovr">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__lightname">
            <div style={{ fontSize: `${nameSize(name)}cqw` }}>{name}</div>
            <span>
              {card.team}
              {p.nation ? ` · ${p.nation}` : ""} {serial}
            </span>
          </div>
        </div>
      );

    // 7. The Shadow (West): a film-noir title card
    case "shadow":
      return (
        <div className="tb-ins tb-ins--shadow">
          {scene}
          <div className="tb-ins__outline" aria-hidden>
            Shadow
          </div>
          {art}
          <div className="tb-ins__west">The Shadow · West</div>
          <div className="tb-ins__plainovr">
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__noir">
            <div style={{ fontSize: `${nameSize(name, 0.78)}cqw` }}>{name}</div>
            <span>
              {card.team} {serial}
            </span>
          </div>
        </div>
      );

    // 8. Stone Fortress: everything carved, the rating on a shield
    case "fortress":
      return (
        <div className="tb-ins tb-ins--fortress">
          {scene}
          <div className="tb-ins__carve tb-ins__carve--set">Stone Fortress</div>
          {art}
          <div className="tb-ins__shield">
            <svg viewBox="0 0 24 26" aria-hidden>
              <path d="M12 1 L22.5 4.5 V12 C22.5 19 17.5 23 12 25 C6.5 23 1.5 19 1.5 12 V4.5 Z" />
            </svg>
            <b>{card.ovr}</b>
            <small>{p.pos}</small>
          </div>
          <div className="tb-ins__slab">
            <div className="tb-ins__carve" style={{ fontSize: `${nameSize(name, 0.9)}cqw` }}>
              {name}
            </div>
            <span>
              {card.team} {serial}
            </span>
          </div>
        </div>
      );

    // 9. Cult Classic: a 90s card, slanted wordmark, a starburst and a ribbon
    case "cult":
      return (
        <div className="tb-ins tb-ins--cult">
          {scene}
          <div className="tb-ins__cultmark" aria-hidden>
            Cult
            <br />
            Classic
          </div>
          {art}
          <div className="tb-ins__burst">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d={starPath(12, 12, 12, 8.4, 14)} />
            </svg>
            <b>{card.ovr}</b>
          </div>
          <div className="tb-ins__ribbon90">
            <div style={{ fontSize: `${nameSize(name, 0.92)}cqw` }}>{name}</div>
            <span>
              {card.team} · {p.pos} {serial}
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
