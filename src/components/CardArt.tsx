"use client";

// Drawn scenes for the card's art panel (viewBox 92 x 102, the panel's own shape).
// Backdrop sits behind the player, Foreground in front of them. Colours come from the
// card's CSS variables (--t1 / --t2 / --f1), so every team paints its own scene.
import type { CSSProperties, ReactNode } from "react";

const W = 92;
const H = 102;
const fill = (c: string, opacity?: number): CSSProperties => ({ fill: c, ...(opacity != null ? { opacity } : {}) });
const stroke = (c: string, w: number, opacity?: number): CSSProperties => ({
  fill: "none",
  stroke: c,
  strokeWidth: w,
  ...(opacity != null ? { opacity } : {}),
});

function Svg({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {children}
    </svg>
  );
}

/** Small deterministic PRNG so scattered stars/embers land the same on every render. */
function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
    s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
    return ((s ^= s >>> 16) >>> 0) / 4294967296;
  };
}

const rays = (cx: number, cy: number, n: number, r: number, spread = 0.5) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const b = a + ((Math.PI * 2) / n) * spread;
    return `M${cx} ${cy} L${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} L${cx + Math.cos(b) * r} ${cy + Math.sin(b) * r} Z`;
  }).join(" ");

const starPath = (cx: number, cy: number, R: number, r: number, points = 5) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    return `${i ? "L" : "M"}${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`;
  }).join(" ") + " Z";

const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;

// The flame line, tongues of uneven height across the panel floor.
const FLAMES =
  "M0 102 L0 84 C5 78 4 70 9 63 C11 71 15 74 16 80 C19 70 24 65 23 54 C30 63 32 71 31 80 C35 73 39 71 40 62 C45 71 46 78 45 84 C49 77 54 75 55 66 C60 75 60 81 59 86 C64 79 68 77 68 68 C74 77 75 84 73 88 C78 83 82 81 83 72 C88 79 90 85 92 87 L92 102 Z";

// ── base set: team colours, a drawn ball, speed slashes, halftone ──

function TeamScene({ id }: { id: string }) {
  return (
    <Svg className="tb-art">
      <defs>
        <pattern id={`${id}-dots`} width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.55" style={fill("#000", 0.18)} />
        </pattern>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${id}-m`}>
          <rect width={W} height={H} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <rect width={W} height={H} style={fill("var(--t1)")} />
      <rect width={W} height={H} style={fill("#000", 0.18)} />
      {/* the ball, top right, seams and all */}
      <g style={stroke("var(--t2)", 2.2, 0.32)}>
        <circle cx="70" cy="26" r="36" />
        <path d="M70 -10 V62 M34 26 H106" />
        <path d="M44 0 C58 14 58 38 44 52 M96 0 C82 14 82 38 96 52" />
      </g>
      {/* speed slashes */}
      <g style={fill("var(--t2)", 0.55)}>
        <path d="M-10 70 L40 40 L46 46 L-4 76 Z" />
        <path d="M-10 84 L52 48 L56 53 L-6 89 Z" style={fill("var(--t2)", 0.35)} />
        <path d="M-10 96 L64 54 L67 58 L-8 100 Z" style={fill("var(--t2)", 0.22)} />
      </g>
      <rect width={W} height={H} fill={`url(#${id}-dots)`} mask={`url(#${id}-m)`} />
    </Svg>
  );
}

// ── 1. New Blood: a jersey torn down a seam, old colours left, new right ──

const SEAM = "M46 0 L52 9 L44 20 L55 31 L45 44 L56 56 L46 70 L57 83 L48 102";

function NewBlood({ id }: { id: string }) {
  return (
    <Svg className="tb-art">
      <defs>
        <pattern id={`${id}-hatch`} width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="0.9" height="2.6" style={fill("#000", 0.22)} />
        </pattern>
        <pattern id={`${id}-chev`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M3 2 L9 6 L3 10" style={stroke("var(--t2)", 2, 0.45)} />
        </pattern>
      </defs>
      <rect width={W} height={H} style={fill("var(--f1)")} />
      <rect width={W} height={H} style={{ fill: "#808080", mixBlendMode: "saturation", opacity: 0.75 }} />
      <rect width={W} height={H} fill={`url(#${id}-hatch)`} />
      <path d={`${SEAM} L92 102 L92 0 Z`} style={fill("var(--t1)")} />
      <path d={`${SEAM} L92 102 L92 0 Z`} fill={`url(#${id}-chev)`} />
      <path d={SEAM} style={stroke("#f7f7f2", 1.6)} />
      <path d={SEAM} transform="translate(-1.6 0)" style={stroke("#000", 0.8, 0.35)} />
    </Svg>
  );
}

// ── 2. Hard Goodbyes: a banner raised to the rafters under one spotlight ──

function Goodbyes({ id, banner }: { id: string; banner: string }) {
  const r = rand(7);
  return (
    <Svg className="tb-art">
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4e2b8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f4e2b8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} style={fill("#1c1712")} />
      {/* roof trusses */}
      <g style={stroke("#4a3f33", 1)}>
        <path d="M0 5 H92 M0 15 H92" />
        <path d={Array.from({ length: 12 }, (_, i) => `M${i * 8} 5 L${i * 8 + 4} 15 L${i * 8 + 8} 5`).join(" ")} />
      </g>
      <path d="M38 15 L54 15 L82 102 L10 102 Z" fill={`url(#${id}-beam)`} />
      {/* the banner */}
      <path d="M46 15 V20" style={stroke("#8c7a60", 0.6)} />
      <path d="M31 20 H61 V60 L46 68 L31 60 Z" style={fill("var(--t1)")} />
      <path d="M31 20 H61 V60 L46 68 L31 60 Z" style={fill("#3b2a1a", 0.35)} />
      <path d="M33 22 H59 V59 L46 65.5 L33 59 Z" style={stroke("#e9d3a8", 0.6)} />
      <text x="46" y="45" textAnchor="middle" className="tb-art__banner">
        {banner}
      </text>
      <text x="46" y="54" textAnchor="middle" className="tb-art__banner-sub">
        THANK YOU
      </text>
      {/* dust in the light */}
      <g style={fill("#f4e2b8", 0.5)}>
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={30 + r() * 34} cy={20 + r() * 80} r={0.25 + r() * 0.45} />
        ))}
      </g>
    </Svg>
  );
}

// ── 3. Golden Boy: a gold burst, a halo, sparkles ──

function GoldenBoy() {
  return (
    <Svg className="tb-art">
      <rect width={W} height={H} style={fill("#b5790c")} />
      <path d={rays(46, 40, 28, 140)} style={fill("#f5c542")} />
      <circle cx="46" cy="40" r="30" style={fill("#fff2c2", 0.35)} />
      <circle cx="46" cy="36" r="21" style={stroke("#fff6cf", 1.6, 0.9)} />
      <circle cx="46" cy="36" r="25" style={{ ...stroke("#fff6cf", 0.7, 0.7), strokeDasharray: "1.4 2.2" }} />
      <g style={fill("#fffbe8")}>
        <path d={sparkle(14, 18, 4)} />
        <path d={sparkle(78, 14, 3)} />
        <path d={sparkle(82, 58, 2.4)} />
        <path d={sparkle(9, 62, 2)} />
      </g>
    </Svg>
  );
}

function GoldenBoyFront() {
  return (
    <Svg className="tb-art is-front">
      <g style={fill("#fffbe8")}>
        <path d={sparkle(70, 30, 2.6)} />
        <path d={sparkle(20, 44, 1.8)} />
      </g>
    </Svg>
  );
}

// ── 4. Generational: the number, giant, and the floor on fire ──

function Generational({ id, big }: { id: string; big: string }) {
  const r = rand(83);
  return (
    <Svg className="tb-art">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120404" />
          <stop offset="1" stopColor="#4a0d06" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <text x="46" y="74" textAnchor="middle" className="tb-art__big" style={{ fontSize: big.length > 2 ? 52 : 74 }}>
        {big}
      </text>
      <g style={fill("#ffb12b")}>
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={r() * W} cy={20 + r() * 70} r={0.3 + r() * 0.6} opacity={0.3 + r() * 0.6} />
        ))}
      </g>
      <path d={FLAMES} transform="translate(0 -14) scale(1 1.1)" style={fill("#8a1408")} />
    </Svg>
  );
}

function GenerationalFront() {
  return (
    <Svg className="tb-art is-front">
      <path d={FLAMES} style={fill("#e8331c")} />
      <path d={FLAMES} transform="translate(4 8) scale(0.92 0.9)" style={fill("#ff8a1f")} />
      <path d={FLAMES} transform="translate(10 16) scale(0.8 0.82)" style={fill("#ffd23f")} />
    </Svg>
  );
}

// ── 5. Ultimate Stardom: night sky, two spotlights, a star on the walk ──

function Stardom({ id }: { id: string }) {
  const r = rand(11);
  return (
    <Svg className="tb-art">
      <defs>
        <linearGradient id={`${id}-spot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} style={fill("#0a0820")} />
      <g style={fill("#ffffff")}>
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={r() * W} cy={r() * H} r={0.2 + r() * 0.5} opacity={0.3 + r() * 0.7} />
        ))}
      </g>
      <path d="M2 102 L-6 102 L20 0 L28 0 Z" fill={`url(#${id}-spot)`} transform="rotate(-14 10 102)" />
      <path d="M90 102 L98 102 L72 0 L64 0 Z" fill={`url(#${id}-spot)`} transform="rotate(14 82 102)" />
      <path d={starPath(46, 50, 34, 14)} style={fill("#2a1f5c")} />
      <path d={starPath(46, 50, 34, 14)} style={stroke("#e8b83a", 1.4)} />
      <path d={starPath(46, 50, 30, 12)} style={stroke("#e8b83a", 0.5, 0.6)} />
    </Svg>
  );
}

// ── 6. The Light (East): the sun coming up over the court ──

function Light() {
  const lines = Array.from({ length: 9 }, (_, i) => -60 + i * 26);
  return (
    <Svg className="tb-art">
      <rect width={W} height={H} style={fill("color-mix(in oklab, var(--t1) 30%, #fff4dc)")} />
      <path d={rays(46, 72, 20, 130, 0.45)} style={fill("#ffffff", 0.55)} />
      <circle cx="46" cy="72" r="22" style={fill("#fff7df")} />
      <circle cx="46" cy="72" r="22" style={stroke("color-mix(in oklab, var(--t1) 60%, #f5c542)", 1.2)} />
      {/* the floor: court lines running to the horizon */}
      <rect y="72" width={W} height="30" style={fill("color-mix(in oklab, var(--t1) 55%, #e8c890)")} />
      <g style={stroke("#ffffff", 0.7, 0.7)}>
        {lines.map((x) => (
          <path key={x} d={`M46 72 L${x} 102`} />
        ))}
        <path d="M0 80 H92 M0 90 H92" />
      </g>
      <path d="M0 72 H92" style={stroke("#ffffff", 1.2)} />
    </Svg>
  );
}

// ── 7. The Shadow (West): an eclipse at dusk ──

function Shadow({ id }: { id: string }) {
  return (
    <Svg className="tb-art">
      <defs>
        <linearGradient id={`${id}-dusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06060c" />
          <stop offset="0.7" stopColor="#1a1430" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--t1) 45%, #1a1430)" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-dusk)`} />
      <circle cx="46" cy="36" r="25" filter={`url(#${id}-blur)`} style={stroke("color-mix(in oklab, var(--t1) 70%, white)", 4, 0.9)} />
      <circle cx="46" cy="36" r="24" style={fill("#030305")} />
      <circle cx="46" cy="36" r="24" style={stroke("color-mix(in oklab, var(--t1) 60%, white)", 0.6)} />
      <g style={fill("#000", 0.35)}>
        <path d="M-10 102 L40 60 L52 60 L10 102 Z" />
        <path d="M30 102 L64 72 L72 72 L46 102 Z" />
      </g>
    </Svg>
  );
}

// ── 8. Stone Fortress: a stone wall, a shield, battlements in front ──

function Fortress() {
  const r = rand(5);
  const greys = ["#7d818a", "#737780", "#868a93", "#6c7078"];
  const bricks: ReactNode[] = [];
  for (let row = 0; row < 13; row++) {
    const off = row % 2 ? -8 : 0;
    for (let x = off; x < W; x += 16) {
      bricks.push(<rect key={`${row}-${x}`} x={x + 0.4} y={row * 8 + 0.4} width="15.2" height="7.2" rx="0.6" style={fill(greys[Math.floor(r() * 4)])} />);
    }
  }
  return (
    <Svg className="tb-art">
      <rect width={W} height={H} style={fill("#3d4047")} />
      {bricks}
      <path d="M46 20 L72 27 L72 52 C72 70 60 81 46 88 C32 81 20 70 20 52 L20 27 Z" style={fill("var(--t1)")} />
      <path d="M46 20 L72 27 L72 52 C72 70 60 81 46 88 C32 81 20 70 20 52 L20 27 Z" style={stroke("#d8dbe0", 1.6)} />
      <path d="M20 40 L46 54 L72 40 L72 47 L46 61 L20 47 Z" style={fill("var(--t2)", 0.9)} />
    </Svg>
  );
}

function FortressFront() {
  const merlon = Array.from({ length: 8 }, (_, i) => `M${i * 12} 0 H${i * 12 + 8} V9 H${i * 12} Z`).join(" ");
  return (
    <Svg className="tb-art is-front">
      <path d={`M0 0 H${W} V4 H0 Z ${merlon}`} style={fill("#4b4f57")} />
      <path d={`M0 4 H${W}`} style={stroke("#2b2d31", 0.6)} />
    </Svg>
  );
}

// ── 9. Cult Classic: a 90s card pattern, shapes and squiggles on cream ──

function Cult({ id }: { id: string }) {
  return (
    <Svg className="tb-art">
      <defs>
        <pattern id={`${id}-half`} width="3.2" height="3.2" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.6" r="0.7" style={fill("var(--t1)", 0.22)} />
        </pattern>
      </defs>
      <rect width={W} height={H} style={fill("#f4ecd8")} />
      <rect width={W} height={H} fill={`url(#${id}-half)`} />
      <path d="M-4 30 L28 6 L36 38 Z" style={fill("#1fb5ad")} />
      <path d="M62 70 L98 56 L92 96 Z" style={fill("#6b3fa0")} />
      <circle cx="78" cy="20" r="11" style={stroke("var(--t1)", 3.4)} />
      <circle cx="14" cy="84" r="7" style={fill("var(--t2)")} />
      <path d="M8 56 l6 -6 l6 6 l6 -6 l6 6 l6 -6" style={stroke("#f2b33d", 2.6)} />
      <path d="M54 8 l4 0 m-2 -2 l0 4 M86 46 l4 0 m-2 -2 l0 4 M30 96 l4 0 m-2 -2 l0 4" style={stroke("#14213d", 1.4)} />
      <path d="M0 100 L92 66 L92 74 L0 108 Z" style={fill("var(--t1)", 0.9)} />
    </Svg>
  );
}

/** The scene behind the player. */
export function Backdrop({ type, id, initials, title }: { type: string; id: string; initials: string; title?: string }) {
  switch (type) {
    case "newblood":
      return <NewBlood id={id} />;
    case "goodbyes":
      return <Goodbyes id={id} banner={initials} />;
    case "goldenboy":
      return <GoldenBoy />;
    case "generational":
      return <Generational id={id} big={title?.match(/\d+/)?.[0] ?? initials} />;
    case "stardom":
      return <Stardom id={id} />;
    case "light":
      return <Light />;
    case "shadow":
      return <Shadow id={id} />;
    case "fortress":
      return <Fortress />;
    case "cult":
      return <Cult id={id} />;
    default:
      return <TeamScene id={id} />;
  }
}

/** Scene pieces that sit in front of the player. */
export function Foreground({ type }: { type: string }) {
  switch (type) {
    case "generational":
      return <GenerationalFront />;
    case "fortress":
      return <FortressFront />;
    case "goldenboy":
      return <GoldenBoyFront />;
    default:
      return null;
  }
}

/** Small set marks for the top-right corner. */
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
      return s(
        <>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="6.5" fill="currentColor" />
        </>,
      );
    case "fortress":
      return s(<path d="M12 2 L21 5 V11 C21 17 17 20.5 12 22 C7 20.5 3 17 3 11 V5 Z" fill="currentColor" />);
    case "generational":
      return s(<path d="M12 2 C14 7 19 9 18 15 C17.5 19 15 22 12 22 C8 22 5.5 19 6 15 C6.5 12 9 11 9 8 C11 9.5 12 7 12 2 Z" fill="currentColor" />);
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

export { W as ART_W, H as ART_H };
