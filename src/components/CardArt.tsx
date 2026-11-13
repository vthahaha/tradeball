"use client";

// Printed and photographic materials for the cards, drawn with SVG filters (grain, torn
// edges, halftone, lit stone, brushed foil, velvet, light leaks, misregistration) rather
// than clean vector shapes. Colours come from the card's CSS variables (--t1 / --t2 / --f1).
//   TeamScene:   the base-set art panel (viewBox 92 x 102)
//   InsertScene: the whole inside of an insert card (viewBox 92 x 132)
import type { CSSProperties, ReactNode } from "react";

const fill = (c: string, opacity?: number): CSSProperties => ({ fill: c, ...(opacity != null ? { opacity } : {}) });

/** Small deterministic PRNG so scattered marks land the same on every render. */
function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
    s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
    return ((s ^= s >>> 16) >>> 0) / 4294967296;
  };
}

function Svg({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  return (
    <svg className="tb-art" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {children}
    </svg>
  );
}

/** Paper/film grain: monochrome noise, laid over a scene at low opacity. */
function Grain({ id, w, h, opacity = 0.22, freq = 0.95 }: { id: string; w: number; h: number; opacity?: number; freq?: number }) {
  return (
    <>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={w} height={h} filter={`url(#${id}-grain)`} style={{ opacity, mixBlendMode: "overlay" }} />
    </>
  );
}

/** Rough edges: displaces whatever it is applied to, like torn paper or a worn print. */
function Rough({ id, scale = 2.4, freq = 0.07 }: { id: string; scale?: number; freq?: number }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

function Vignette({ id, w, h, strength = 0.6 }: { id: string; w: number; h: number; strength?: number }) {
  return (
    <>
      <radialGradient id={`${id}-vig`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.5" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={strength} />
      </radialGradient>
      <rect width={w} height={h} fill={`url(#${id}-vig)`} />
    </>
  );
}

// ── base set: a pebbled leather ball, worn halftone slashes, paper grain ──

export function TeamScene({ id }: { id: string }) {
  const W = 92;
  const H = 102;
  return (
    <Svg w={W} h={H}>
      <defs>
        <filter id={`${id}-leather`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" result="n" />
          <feDiffuseLighting in="n" surfaceScale="1.2" lightingColor="#fff" result="l">
            <feDistantLight azimuth="235" elevation="55" />
          </feDiffuseLighting>
          <feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
        </filter>
        <pattern id={`${id}-dots`} width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
          <circle cx="1.2" cy="1.2" r="0.55" style={fill("var(--t2)")} />
        </pattern>
        <clipPath id={`${id}-ball`}>
          <circle cx="72" cy="22" r="34" />
        </clipPath>
        <Rough id={`${id}-rough`} scale={1.6} />
      </defs>
      <rect width={W} height={H} style={fill("var(--t1)")} />
      <rect width={W} height={H} style={fill("#000", 0.16)} />
      {/* the ball, in leather, a little worn */}
      <g clipPath={`url(#${id}-ball)`} opacity="0.28">
        <rect x="30" y="-20" width="80" height="80" style={fill("var(--t2)")} />
        <rect x="30" y="-20" width="80" height="80" filter={`url(#${id}-leather)`} style={{ mixBlendMode: "multiply" }} />
        <g filter={`url(#${id}-rough)`} style={{ fill: "none", stroke: "#000", strokeWidth: 1.6 }}>
          <path d="M72 -14 V58 M36 22 H108 M46 -6 C58 8 58 36 46 50 M98 -6 C86 8 86 36 98 50" />
        </g>
      </g>
      {/* halftone slashes, printed slightly off */}
      <g filter={`url(#${id}-rough)`}>
        <path d="M-10 74 L44 42 L52 48 L-2 80 Z" fill={`url(#${id}-dots)`} />
        <path d="M-10 90 L60 50 L64 56 L-6 96 Z" fill={`url(#${id}-dots)`} opacity="0.6" />
      </g>
      <Grain id={id} w={W} h={H} opacity={0.28} />
    </Svg>
  );
}

// ── insert scenes (viewBox 92 x 132: the whole inside of the card) ──

const IW = 92;
const IH = 132;

/** 1. New Blood: a newspaper transactions page with team colours torn and pasted on. */
function NewBlood({ id }: { id: string }) {
  const r = rand(19);
  const lines: ReactNode[] = [];
  for (let col = 0; col < 4; col++) {
    for (let y = 30; y < 128; y += 2.3) {
      if (r() < 0.06) continue;
      lines.push(<rect key={`${col}-${y}`} x={3 + col * 22.5} y={y} width={10 + r() * 9.5} height="0.75" />);
    }
  }
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <Rough id={`${id}-tear`} scale={4.5} freq={0.09} />
      </defs>
      <rect width={IW} height={IH} style={fill("#e8e2d2")} />
      <g style={fill("#2a2a2a", 0.5)}>{lines}</g>
      {/* old team: torn off and pasted low, slightly faded */}
      <g filter={`url(#${id}-tear)`} transform="rotate(-7 20 100)">
        <path d="M-8 78 L52 70 L56 140 L-8 140 Z" style={fill("#f7f3e8")} />
        <path d="M-6 80 L50 72.5 L54 140 L-6 140 Z" style={fill("var(--f1)")} />
      </g>
      <rect x="-8" y="70" width="64" height="70" transform="rotate(-7 20 100)" style={{ fill: "#e8e2d2", opacity: 0.35, mixBlendMode: "screen" }} />
      {/* new team: a bigger, fresher piece pasted over the top */}
      <g filter={`url(#${id}-tear)`} transform="rotate(5 70 60)">
        <path d="M34 22 L104 18 L104 108 L40 112 Z" style={fill("#f7f3e8")} />
        <path d="M36 24 L104 20 L104 106 L42 110 Z" style={fill("var(--t1)")} />
      </g>
      <Grain id={id} w={IW} h={IH} opacity={0.35} />
    </Svg>
  );
}

/** 2. Hard Goodbyes: an old arena photo, out-of-focus lights, film grain and a vignette. */
function Goodbyes({ id }: { id: string }) {
  const r = rand(7);
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <filter id={`${id}-bokeh`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2c1f" />
          <stop offset="1" stopColor="#140f0a" />
        </linearGradient>
      </defs>
      <rect width={IW} height={IH} fill={`url(#${id}-floor)`} />
      <g filter={`url(#${id}-bokeh)`}>
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={r() * IW} cy={6 + r() * 60} r={2 + r() * 6} style={fill(r() < 0.3 ? "#ffd9a0" : "#f4e2c0", 0.12 + r() * 0.35)} />
        ))}
      </g>
      <Vignette id={id} w={IW} h={IH} strength={0.75} />
      <Grain id={id} w={IW} h={IH} opacity={0.5} freq={1.2} />
    </Svg>
  );
}

/** 3. Golden Boy: matte black card stock with a faint brushed sheen; the foil is the wordmark. */
function GoldenBoy({ id }: { id: string }) {
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <filter id={`${id}-brush`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.45" numOctaves="2" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={IW} height={IH} style={fill("#1b1307")} />
      <rect width={IW} height={IH} filter={`url(#${id}-brush)`} style={{ opacity: 0.18, mixBlendMode: "screen" }} />
      <Vignette id={id} w={IW} h={IH} strength={0.55} />
    </Svg>
  );
}

/** Brushed gold foil, as a filter for text: grain stretched one way, mapped to gold. */
export function FoilFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.55" numOctaves="2" result="n" />
      <feComponentTransfer in="n" result="g">
        <feFuncR type="table" tableValues="0.55 1 0.78 1" />
        <feFuncG type="table" tableValues="0.36 0.86 0.6 0.9" />
        <feFuncB type="table" tableValues="0.06 0.42 0.18 0.5" />
        <feFuncA type="table" tableValues="1 1" />
      </feComponentTransfer>
      <feComposite in="g" in2="SourceAlpha" operator="in" />
    </filter>
  );
}

/** 4. Generational: a scoreboard face, unlit bulbs everywhere and the number burning amber. */
function Generational({ id, big }: { id: string; big: string }) {
  const fs = big.length > 2 ? 54 : 78;
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <pattern id={`${id}-off`} width="1.8" height="1.8" patternUnits="userSpaceOnUse">
          <circle cx="0.9" cy="0.9" r="0.55" style={fill("#1c1714")} />
        </pattern>
        <pattern id={`${id}-on`} width="1.8" height="1.8" patternUnits="userSpaceOnUse">
          <circle cx="0.9" cy="0.9" r="0.62" style={fill("#ffb12b")} />
        </pattern>
        <mask id={`${id}-num`}>
          <text x="50" y="86" textAnchor="middle" className="tb-art__led" style={{ fontSize: fs, fill: "#fff" }}>
            {big}
          </text>
        </mask>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>
      <rect width={IW} height={IH} style={fill("#070605")} />
      <rect width={IW} height={IH} fill={`url(#${id}-off)`} />
      <rect width={IW} height={IH} mask={`url(#${id}-num)`} style={fill("#ff8a1f", 0.55)} filter={`url(#${id}-glow)`} />
      <rect width={IW} height={IH} fill={`url(#${id}-on)`} mask={`url(#${id}-num)`} />
      <Grain id={id} w={IW} h={IH} opacity={0.18} />
    </Svg>
  );
}

/** 5. Ultimate Stardom: a velvet stage curtain and a follow-spot through the haze. */
function Stardom({ id }: { id: string }) {
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <filter id={`${id}-velvet`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.11 0.004" numOctaves="3" result="n" />
          <feDiffuseLighting in="n" surfaceScale="6" lightingColor="#c4202e" result="l">
            <feDistantLight azimuth="180" elevation="40" />
          </feDiffuseLighting>
        </filter>
        <filter id={`${id}-haze`} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.82  0 0 0 0.9 -0.25" result="smoke" />
          <feComposite in="smoke" in2="SourceGraphic" operator="in" result="s" />
          <feGaussianBlur in="s" stdDeviation="2" />
        </filter>
        <radialGradient id={`${id}-spot`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={IW} height={IH} style={fill("#3a0509")} />
      <rect width={IW} height={IH} filter={`url(#${id}-velvet)`} style={{ mixBlendMode: "multiply" }} />
      <ellipse cx="46" cy="78" rx="40" ry="52" fill={`url(#${id}-spot)`} style={{ mixBlendMode: "screen" }} />
      <path d="M30 0 L62 0 L86 132 L6 132 Z" filter={`url(#${id}-haze)`} style={fill("#fff")} opacity="0.55" />
      <Vignette id={id} w={IW} h={IH} strength={0.7} />
      <Grain id={id} w={IW} h={IH} opacity={0.2} />
    </Svg>
  );
}

/** 6. The Light (East): a sunrise shot straight into the glare: blown highlights, light leaks, flare. */
function Light({ id }: { id: string }) {
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, var(--t1) 55%, #1b2a52)" />
          <stop offset="0.55" stopColor="color-mix(in oklab, var(--t1) 30%, #f2a65a)" />
          <stop offset="1" stopColor="#fbe3b8" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${id}-softer`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <rect width={IW} height={IH} fill={`url(#${id}-sky)`} />
      <g filter={`url(#${id}-soft)`} style={{ mixBlendMode: "screen" }}>
        <circle cx="66" cy="36" r="22" style={fill("#fff4d6")} />
        <circle cx="66" cy="36" r="38" style={fill("#ffd38a", 0.55)} />
        <ellipse cx="-4" cy="104" rx="20" ry="34" style={fill("#ff6a3d", 0.55)} />
        <ellipse cx="96" cy="120" rx="18" ry="22" style={fill("#ff9bd0", 0.35)} />
      </g>
      <g filter={`url(#${id}-softer)`} style={{ mixBlendMode: "screen" }}>
        <circle cx="50" cy="58" r="4" style={fill("#bfe3ff", 0.4)} />
        <circle cx="38" cy="76" r="7" style={fill("#ffe6b0", 0.25)} />
        <circle cx="22" cy="100" r="3" style={fill("#d6c4ff", 0.35)} />
      </g>
      <Grain id={id} w={IW} h={IH} opacity={0.32} />
    </Svg>
  );
}

/** 7. The Shadow (West): a dark room, hard light through venetian blinds, a little smoke. */
function Shadow({ id }: { id: string }) {
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <filter id={`${id}-blind`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.5" />
        </filter>
      </defs>
      <rect width={IW} height={IH} style={fill("#07070b")} />
      <g filter={`url(#${id}-blind)`} transform="rotate(-24 46 66) skewX(-12)">
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x="-40" y={10 + i * 12} width="200" height="6.4" style={fill("color-mix(in oklab, var(--t1) 55%, #ffe9c2)", 0.5 - i * 0.035)} />
        ))}
      </g>
      <Vignette id={id} w={IW} h={IH} strength={0.85} />
      <Grain id={id} w={IW} h={IH} opacity={0.35} />
    </Svg>
  );
}

/** 8. Stone Fortress: cut stone, lit from the top left, mortar worn in by hand. */
function Fortress({ id }: { id: string }) {
  const rows = 9;
  const mortar: string[] = [];
  for (let row = 1; row < rows; row++) mortar.push(`M0 ${row * 15} H${IW}`);
  for (let row = 0; row < rows; row++) {
    const off = row % 2 ? 13 : 0;
    for (let x = off + 26; x < IW; x += 26) mortar.push(`M${x} ${row * 15} V${row * 15 + 15}`);
  }
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <filter id={`${id}-stone`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="5" result="n" />
          <feDiffuseLighting in="n" surfaceScale="3.5" lightingColor="#c9ccd2" result="l">
            <feDistantLight azimuth="225" elevation="48" />
          </feDiffuseLighting>
        </filter>
        <Rough id={`${id}-worn`} scale={2.2} freq={0.12} />
      </defs>
      <rect width={IW} height={IH} filter={`url(#${id}-stone)`} />
      <rect width={IW} height={IH} style={{ fill: "var(--t1)", opacity: 0.12, mixBlendMode: "color" }} />
      <g filter={`url(#${id}-worn)`} style={{ fill: "none", stroke: "#26282c", strokeWidth: 1.4, opacity: 0.85 }}>
        <path d={mortar.join(" ")} />
      </g>
      <g filter={`url(#${id}-worn)`} style={{ fill: "none", stroke: "#ffffff", strokeWidth: 0.5, opacity: 0.25 }} transform="translate(0.6 0.8)">
        <path d={mortar.join(" ")} />
      </g>
      <Vignette id={id} w={IW} h={IH} strength={0.45} />
    </Svg>
  );
}

/** 9. Cult Classic: fan memorabilia. Wool felt in the team's colour, a felt pennant sewn across the top. */
function Cult({ id }: { id: string }) {
  const pennant = "M3 8 L90 23 L3 38 Z";
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <filter id={`${id}-felt`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="3" result="n" />
          <feDiffuseLighting in="n" surfaceScale="0.9" lightingColor="#ffffff" result="l">
            <feDistantLight azimuth="235" elevation="62" />
          </feDiffuseLighting>
        </filter>
        <filter id={`${id}-edge`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id={`${id}-pen`}>
          <path d={pennant} />
        </clipPath>
      </defs>
      {/* wool felt, the team colour a little faded */}
      <rect width={IW} height={IH} style={fill("color-mix(in oklab, var(--t1) 78%, #4a3b2c)")} />
      <rect width={IW} height={IH} filter={`url(#${id}-felt)`} style={{ mixBlendMode: "multiply", opacity: 0.55 }} />
      {/* the pennant: cream felt, a binding strip at the pole, sewn letters */}
      <g filter={`url(#${id}-edge)`}>
        <path d={pennant} transform="translate(0.8 1.2)" style={fill("#000", 0.3)} />
        <path d={pennant} style={fill("#efe4cb")} />
        <g clipPath={`url(#${id}-pen)`}>
          <rect width={IW} height={IH} filter={`url(#${id}-felt)`} style={{ mixBlendMode: "multiply", opacity: 0.4 }} />
        </g>
        <rect x="1" y="7.4" width="5" height="31.2" rx="0.6" style={fill("var(--t2)")} />
      </g>
      <path d="M7.5 11.6 L80 23 L7.5 34.4" style={{ fill: "none", stroke: "color-mix(in oklab, var(--t1) 70%, #000)", strokeWidth: 0.35, strokeDasharray: "1.1 0.8", opacity: 0.7 }} />
      <text x="10" y="26" className="tb-art__pennant" textLength="58" lengthAdjust="spacingAndGlyphs">
        CULT CLASSIC
      </text>
      <Vignette id={id} w={IW} h={IH} strength={0.5} />
    </Svg>
  );
}

/** The material behind an insert card, by set. */
export function InsertScene({ type, id, big }: { type: string; id: string; big: string }) {
  switch (type) {
    case "newblood":
      return <NewBlood id={id} />;
    case "goodbyes":
      return <Goodbyes id={id} />;
    case "goldenboy":
      return <GoldenBoy id={id} />;
    case "generational":
      return <Generational id={id} big={big} />;
    case "stardom":
      return <Stardom id={id} />;
    case "light":
      return <Light id={id} />;
    case "shadow":
      return <Shadow id={id} />;
    case "fortress":
      return <Fortress id={id} />;
    case "cult":
      return <Cult id={id} />;
    default:
      return null;
  }
}

const starPath = (cx: number, cy: number, R: number, r: number, points = 5) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    return `${i ? "L" : "M"}${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`;
  }).join(" ") + " Z";

/** Small set marks (binder headers, card badges). */
export function SetIcon({ type }: { type: string }) {
  const s = (d: ReactNode) => (
    <svg viewBox="0 0 24 24" className="tb-card__seticon" aria-hidden>
      {d}
    </svg>
  );
  switch (type) {
    case "goldenboy":
      return s(<path d="M2 18 L4 7 L9 12 L12 4 L15 12 L20 7 L22 18 Z" fill="currentColor" />);
    case "stardom":
      return s(<path d={starPath(12, 12.5, 11, 4.4)} fill="currentColor" />);
    case "light":
      return s(
        <>
          <path d="M3 17 H21" stroke="currentColor" strokeWidth="2" />
          <path d="M6 17 A6 6 0 0 1 18 17 Z" fill="currentColor" />
          <path d="M12 4 V8 M4.5 8.5 L7 10.5 M19.5 8.5 L17 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>,
      );
    case "shadow":
      return s(<path d="M3 6 H21 M3 10 H21 M3 14 H21 M3 18 H21" stroke="currentColor" strokeWidth="2.4" />);
    case "fortress":
      return s(<path d="M12 2 L21 5 V11 C21 17 17 20.5 12 22 C7 20.5 3 17 3 11 V5 Z" fill="currentColor" />);
    case "generational":
      return s(
        <g fill="currentColor">
          {[4, 8, 12, 16, 20].flatMap((x) => [4, 8, 12, 16, 20].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={(x + y) % 8 ? 1.6 : 1} />))}
        </g>,
      );
    case "newblood":
      return s(<path d="M3 12 H17 M12 6 L18 12 L12 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />);
    case "goodbyes":
      return s(<path d="M6 3 H18 V18 L12 21 L6 18 Z" fill="currentColor" />);
    case "cult":
      return s(<path d="M3 20 L12 3 L21 20 Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />);
    default:
      return null;
  }
}
