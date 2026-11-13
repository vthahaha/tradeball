"use client";

// Card art drawn in SVG. Colours come from the card's CSS variables (--t1 / --t2 / --f1).
//   BaseScene:   the base-set photo panel: court lines and paper grain (viewBox 86 x 100)
//   InsertScene: the whole inside of an insert card, by set (viewBox 92 x 132)
import type { CSSProperties, ReactNode } from "react";

const fill = (c: string, opacity?: number): CSSProperties => ({
  fill: c,
  ...(opacity != null ? { opacity } : {}),
});
const line = (c: string, w: number, opacity?: number): CSSProperties => ({
  fill: "none",
  stroke: c,
  strokeWidth: w,
  ...(opacity != null ? { opacity } : {}),
});

/** Small deterministic PRNG so scattered marks land the same on every render. */
function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
    s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
    return ((s ^= s >>> 16) >>> 0) / 4294967296;
  };
}

function Svg({
  w,
  h,
  children,
}: {
  w: number;
  h: number;
  children: ReactNode;
}) {
  return (
    <svg
      className="tb-art"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Grain({
  id,
  w,
  h,
  opacity = 0.22,
  freq = 0.95,
}: {
  id: string;
  w: number;
  h: number;
  opacity?: number;
  freq?: number;
}) {
  return (
    <>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={freq}
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect
        width={w}
        height={h}
        filter={`url(#${id}-grain)`}
        style={{ opacity, mixBlendMode: "overlay" }}
      />
    </>
  );
}

// ── base set: half a court in thin lines over the team colour ──

export function BaseScene({ id }: { id: string }) {
  const W = 86;
  const H = 100;
  return (
    <Svg w={W} h={H}>
      <rect width={W} height={H} style={fill("var(--t1)")} />
      <rect width={W} height={H} style={fill("#000", 0.22)} />
      <g style={line("#ffffff", 0.45, 0.2)}>
        <rect x="27" y="-2" width="32" height="44" />
        <circle cx="43" cy="42" r="11" />
        <path d="M5 -2 V20 A40 40 0 0 0 81 20 V-2" />
        <path d="M0 74 H86" />
        <circle cx="43" cy="74" r="11" />
      </g>
      <Grain id={id} w={W} h={H} opacity={0.3} />
    </Svg>
  );
}

// ── insert scenes (viewBox 92 x 132) ──

const IW = 92;
const IH = 132;

/** 1. New Blood: a dark field of geometric lines converging on the player. */
function NewBlood({ id }: { id: string }) {
  const rays: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const x = (i / 12) * IW;
    rays.push(`M46 70 L${x} 0`, `M46 70 L${x} ${IH}`);
  }
  return (
    <Svg w={IW} h={IH}>
      <rect width={IW} height={IH} style={fill("#0c0d11")} />
      <path d={rays.join(" ")} style={line("var(--t1)", 0.35, 0.55)} />
      <g style={line("#ffffff", 0.5, 0.35)}>
        <path d="M46 14 L80 34 L80 98 L46 118 L12 98 L12 34 Z" />
        <path d="M46 20 L75 37 L75 95 L46 112 L17 95 L17 37 Z" />
      </g>
      <path
        d="M46 14 L80 34 L80 98 L46 118 L12 98 L12 34 Z"
        style={fill("var(--t1)", 0.14)}
      />
      <Grain id={id} w={IW} h={IH} opacity={0.25} />
    </Svg>
  );
}

/** 2. Hard Goodbyes: a sepia arena photo, lights out of focus. */
function Goodbyes({ id }: { id: string }) {
  const r = rand(7);
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <filter id={`${id}-bokeh`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <linearGradient id={`${id}-room`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3a28" />
          <stop offset="1" stopColor="#1a130c" />
        </linearGradient>
      </defs>
      <rect width={IW} height={IH} fill={`url(#${id}-room)`} />
      <g filter={`url(#${id}-bokeh)`}>
        {Array.from({ length: 20 }, (_, i) => (
          <circle
            key={i}
            cx={r() * IW}
            cy={4 + r() * 56}
            r={2 + r() * 6}
            style={fill("#f4e2c0", 0.12 + r() * 0.35)}
          />
        ))}
      </g>
      <Grain id={id} w={IW} h={IH} opacity={0.5} freq={1.2} />
    </Svg>
  );
}

/** 3. Golden Boy: engraved gold foil, a guilloché rosette and a medallion ring with the set name. */
function GoldenBoy({ id }: { id: string }) {
  const petals = Array.from({ length: 36 }, (_, i) => (
    <ellipse
      key={i}
      cx="46"
      cy="52"
      rx="42"
      ry="15"
      transform={`rotate(${i * 5} 46 52)`}
    />
  ));
  const rings = Array.from({ length: 14 }, (_, i) => (
    <circle key={i} cx="46" cy="52" r={4 + i * 4.2} />
  ));
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dc8a" />
          <stop offset="0.35" stopColor="#c99a2e" />
          <stop offset="0.55" stopColor="#f3d27a" />
          <stop offset="0.8" stopColor="#a87818" />
          <stop offset="1" stopColor="#e9c46a" />
        </linearGradient>
        <path
          id={`${id}-ring`}
          d="M46 52 m-30 0 a30 30 0 1 1 60 0 a30 30 0 1 1 -60 0"
        />
      </defs>
      <rect width={IW} height={IH} fill={`url(#${id}-gold)`} />
      <g style={line("#7a5408", 0.18, 0.55)}>{petals}</g>
      <g style={line("#fff3c4", 0.15, 0.5)}>{rings}</g>
      <circle cx="46" cy="52" r="34" style={line("#7a5408", 0.6, 0.8)} />
      <circle cx="46" cy="52" r="26.5" style={line("#7a5408", 0.6, 0.8)} />
      <text className="tb-art__ring">
        <textPath href={`#${id}-ring`} startOffset="0">
          GOLDEN BOY · GOLDEN BOY · GOLDEN BOY · GOLDEN BOY ·
        </textPath>
      </text>
      <Grain id={id} w={IW} h={IH} opacity={0.18} />
    </Svg>
  );
}

/** 4. Generational: a comic burst in the team's colours, uneven shards and halftone. */
function Generational({ id }: { id: string }) {
  const r = rand(83);
  const cx = 46;
  const cy = 58;
  const shards: ReactNode[] = [];
  let a = 0;
  let k = 0;
  while (a < Math.PI * 2) {
    const w = 0.12 + r() * 0.22;
    const R = 120;
    const p = (t: number) => `${cx + Math.cos(t) * R} ${cy + Math.sin(t) * R}`;
    const colour = [
      "var(--t1)",
      "#ffffff",
      "var(--t2)",
      "#ffd23f",
      "var(--t1)",
      "#ff4d3d",
    ][k % 6];
    shards.push(
      <path
        key={k}
        d={`M${cx} ${cy} L${p(a)} L${p(a + w)} Z`}
        style={fill(colour)}
      />,
    );
    a += w;
    k++;
  }
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <pattern
          id={`${id}-dots`}
          width="2.2"
          height="2.2"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(30)"
        >
          <circle cx="1.1" cy="1.1" r="0.5" style={fill("#000")} />
        </pattern>
        <radialGradient id={`${id}-fade`} cx="0.5" cy="0.44" r="0.6">
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </radialGradient>
        <mask id={`${id}-edge`}>
          <rect width={IW} height={IH} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <rect width={IW} height={IH} style={fill("var(--t1)")} />
      {shards}
      <circle cx={cx} cy={cy} r="20" style={fill("#ffffff", 0.85)} />
      <rect
        width={IW}
        height={IH}
        fill={`url(#${id}-dots)`}
        mask={`url(#${id}-edge)`}
        opacity="0.3"
      />
    </Svg>
  );
}

/** 5. Ultimate Stardom: a deep-space nebula behind an ornate line-art frame. */
function Stardom({ id }: { id: string }) {
  const r = rand(11);
  return (
    <Svg w={IW} h={IH}>
      <defs>
        <filter id={`${id}-neb`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018"
            numOctaves="4"
            seed="4"
          />
          <feColorMatrix
            type="matrix"
            values="0.9 0 0 0 0.05  0.2 0.3 0 0 0.02  0.6 0.4 0.5 0 0.12  0 0 0 0 1"
          />
        </filter>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <rect width={IW} height={IH} style={fill("#05040f")} />
      <rect
        width={IW}
        height={IH}
        filter={`url(#${id}-neb)`}
        style={{ mixBlendMode: "screen", opacity: 0.9 }}
      />
      <g style={fill("#ffffff")}>
        {Array.from({ length: 50 }, (_, i) => (
          <circle
            key={i}
            cx={r() * IW}
            cy={r() * IH}
            r={0.15 + r() * 0.45}
            opacity={0.3 + r() * 0.7}
          />
        ))}
      </g>
      {/* the frame: double rails, an arch over the player, nodes at the joints */}
      <g style={line("#cfe3ff", 0.5)} filter={`url(#${id}-glow)`} opacity="0.7">
        <path d="M8 124 V40 A38 38 0 0 1 84 40 V124" />
      </g>
      <g style={line("#e8f1ff", 0.45)}>
        <path d="M8 124 V40 A38 38 0 0 1 84 40 V124" />
        <path d="M11.5 124 V41 A34.5 34.5 0 0 1 80.5 41 V124" />
        <path d="M4 18 H18 L24 12 M88 18 H74 L68 12 M4 18 V30 M88 18 V30" />
        <path d="M2 110 H8 M84 110 H90 M2 86 H8 M84 86 H90" />
      </g>
      <g style={{ fill: "#05040f", stroke: "#e8f1ff", strokeWidth: 0.45 }}>
        <circle cx="8" cy="86" r="1.6" />
        <circle cx="84" cy="86" r="1.6" />
        <circle cx="8" cy="110" r="1.6" />
        <circle cx="84" cy="110" r="1.6" />
        <circle cx="46" cy="2" r="2.2" />
      </g>
    </Svg>
  );
}

/** 6. The Light: a pale paper field, almost nothing, so the type and the player carry it. */
function Light({ id }: { id: string }) {
  return (
    <Svg w={IW} h={IH}>
      <rect width={IW} height={IH} style={fill("#eef0f3")} />
      <rect
        width={IW}
        height={IH}
        style={{ fill: "var(--t1)", opacity: 0.06 }}
      />
      <Grain id={id} w={IW} h={IH} opacity={0.25} />
    </Svg>
  );
}

/** 7. The Shadow: the same field, at night. */
function Shadow({ id }: { id: string }) {
  return (
    <Svg w={IW} h={IH}>
      <rect width={IW} height={IH} style={fill("#0a0b0e")} />
      <rect
        width={IW}
        height={IH}
        style={{ fill: "var(--t1)", opacity: 0.08 }}
      />
      <Grain id={id} w={IW} h={IH} opacity={0.3} />
    </Svg>
  );
}

/** 8. Stone Fortress: an 8-bit castle under a pixel sky. */
function Fortress() {
  const sky = [
    "#3d6fd6",
    "#4a7ee0",
    "#5a8de8",
    "#6c9cee",
    "#80acf2",
    "#95bcf6",
  ];
  const bands = sky.map((c, i) => (
    <rect key={c} x="0" y={i * 12} width={IW} height="12.2" style={fill(c)} />
  ));
  const cloud = (x: number, y: number) => (
    <g key={`${x}-${y}`} style={fill("#ffffff")}>
      <rect x={x + 4} y={y} width="12" height="4" />
      <rect x={x} y={y + 4} width="22" height="4" />
      <rect x={x + 2} y={y + 8} width="16" height="2" style={fill("#d6e4ff")} />
    </g>
  );
  const bricks: ReactNode[] = [];
  const top = 86;
  for (let row = 0; row < 12; row++) {
    const y = top + row * 4;
    const off = row % 2 ? -4 : 0;
    for (let x = off; x < IW; x += 8) {
      bricks.push(
        <rect
          key={`${row}-${x}`}
          x={x + 0.4}
          y={y + 0.4}
          width="7.2"
          height="3.2"
          style={fill(row % 3 === 0 && x % 24 === 0 ? "#8a8f99" : "#9da2ac")}
        />,
      );
    }
  }
  const merlons = Array.from({ length: 8 }, (_, i) => (
    <rect
      key={i}
      x={i * 12 + 1}
      y={top - 6}
      width="7"
      height="6"
      style={fill("#9da2ac")}
    />
  ));
  return (
    <Svg w={IW} h={IH}>
      {bands}
      <rect x="70" y="10" width="12" height="12" style={fill("#ffe066")} />
      <rect x="68" y="12" width="16" height="8" style={fill("#ffe066")} />
      {cloud(6, 18)}
      {cloud(56, 40)}
      {cloud(20, 58)}
      <rect
        x="0"
        y={top}
        width={IW}
        height={IH - top}
        style={fill("#5f646d")}
      />
      {bricks}
      {merlons}
      <rect
        x="40"
        y={top + 18}
        width="12"
        height="28"
        style={fill("#2b2f36")}
      />
      <rect x="42" y={top + 16} width="8" height="2" style={fill("#2b2f36")} />
    </Svg>
  );
}

/** 9. Cult Classic: plain white stock; the arch window and the band are the design. */
function Cult({ id }: { id: string }) {
  return (
    <Svg w={IW} h={IH}>
      <rect width={IW} height={IH} style={fill("#f7f5ef")} />
      <Grain id={id} w={IW} h={IH} opacity={0.18} />
    </Svg>
  );
}

/** The art behind an insert card, by set. */
export function InsertScene({ type, id }: { type: string; id: string }) {
  switch (type) {
    case "newblood":
      return <NewBlood id={id} />;
    case "goodbyes":
      return <Goodbyes id={id} />;
    case "goldenboy":
      return <GoldenBoy id={id} />;
    case "generational":
      return <Generational id={id} />;
    case "stardom":
      return <Stardom id={id} />;
    case "light":
      return <Light id={id} />;
    case "shadow":
      return <Shadow id={id} />;
    case "fortress":
      return <Fortress />;
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

/** Small set marks (binder headers). */
export function SetIcon({ type }: { type: string }) {
  const s = (d: ReactNode) => (
    <svg viewBox="0 0 24 24" className="tb-card__seticon" aria-hidden>
      {d}
    </svg>
  );
  switch (type) {
    case "goldenboy":
      return s(
        <>
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="5" fill="currentColor" />
        </>,
      );
    case "stardom":
      return s(<path d={starPath(12, 12.5, 11, 4.4)} fill="currentColor" />);
    case "light":
      return s(
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        />,
      );
    case "shadow":
      return s(
        <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />,
      );
    case "fortress":
      return s(
        <path
          d="M3 21 V9 H6 V6 H9 V9 H11 V6 H13 V9 H15 V6 H18 V9 H21 V21 Z"
          fill="currentColor"
        />,
      );
    case "generational":
      return s(
        <path
          d="M12 1 L14.5 8 L22 6 L17 12 L22 18 L14.5 16 L12 23 L9.5 16 L2 18 L7 12 L2 6 L9.5 8 Z"
          fill="currentColor"
        />,
      );
    case "newblood":
      return s(
        <path
          d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />,
      );
    case "goodbyes":
      return s(<path d="M6 3 H18 V18 L12 21 L6 18 Z" fill="currentColor" />);
    case "cult":
      return s(
        <path
          d="M4 21 V11 A8 8 0 0 1 20 11 V21 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        />,
      );
    default:
      return null;
  }
}
