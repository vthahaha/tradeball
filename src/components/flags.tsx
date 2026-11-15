// Flags for the Passports set, drawn at 3:2 (viewBox 30 x 20). Coats of arms are reduced to simple
// shields: the flag has to read on a card at thumbnail size, not serve as a reference.
import type { ReactNode } from "react";

export interface Nation {
  /** English name, as printed on the passport page. */
  name: string;
  /** The flag's main colours, top to bottom (or left to right): the stripe down the card's edge. */
  colors: string[];
  flag: ReactNode;
}

/** A five-point star's polygon points. */
function star(cx: number, cy: number, r: number, rot = -90) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? r * 0.382 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const h3 = (a: string, b: string, c: string) => (
  <>
    <rect width="30" height="6.67" fill={a} />
    <rect y="6.67" width="30" height="6.67" fill={b} />
    <rect y="13.33" width="30" height="6.67" fill={c} />
  </>
);
const v3 = (a: string, b: string, c: string) => (
  <>
    <rect width="10" height="20" fill={a} />
    <rect x="10" width="10" height="20" fill={b} />
    <rect x="20" width="10" height="20" fill={c} />
  </>
);
const nordic = (bg: string, cross: string, x: number, w: number) => (
  <>
    <rect width="30" height="20" fill={bg} />
    <rect x={x} width={w} height="20" fill={cross} />
    <rect y={10 - w / 2} width="30" height={w} fill={cross} />
  </>
);
/** A small heater shield, for the flags that carry arms. */
const shield = (x: number, y: number, w: number, h: number, fill: string, stroke: string, inner?: ReactNode) => (
  <g>
    <path
      d={`M${x} ${y}h${w}v${h * 0.6}q0 ${h * 0.3} ${-w / 2} ${h * 0.4}q${-w / 2} ${-h * 0.1} ${-w / 2} ${-h * 0.4}z`}
      fill={fill}
      stroke={stroke}
      strokeWidth="0.5"
    />
    {inner}
  </g>
);
/** The Union Flag, stretched over a box. */
const union = (x: number, y: number, w: number, h: number) => (
  <svg x={x} y={y} width={w} height={h} viewBox="0 0 60 30" preserveAspectRatio="none">
    <rect width="60" height="30" fill="#012169" />
    <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
    <path d="M0 0L60 30M60 0L0 30" stroke="#c8102e" strokeWidth="2" />
    <path d="M30 0V30M0 15H60" stroke="#fff" strokeWidth="10" />
    <path d="M30 0V30M0 15H60" stroke="#c8102e" strokeWidth="6" />
  </svg>
);
const greekCross = (cx: number, cy: number, s: number, t: number, fill: string) => (
  <>
    <rect x={cx - t / 2} y={cy - s / 2} width={t} height={s} fill={fill} />
    <rect x={cx - s / 2} y={cy - t / 2} width={s} height={t} fill={fill} />
  </>
);

export const NATIONS: Record<string, Nation> = {
  FRA: { name: "France", colors: ["#002654", "#ffffff", "#ce1126"], flag: v3("#002654", "#fff", "#ce1126") },
  SVN: {
    name: "Slovenia",
    colors: ["#ffffff", "#005da4", "#ed1c24"],
    flag: (
      <>
        {h3("#fff", "#005da4", "#ed1c24")}
        {shield(6, 3.4, 5, 7, "#005da4", "#ed1c24", <path d="M6.6 8.4l1.2-2 .7 1 .7-1 1.2 2z" fill="#fff" />)}
      </>
    ),
  },
  SRB: {
    name: "Serbia",
    colors: ["#c6363c", "#0c4076", "#ffffff"],
    flag: (
      <>
        {h3("#c6363c", "#0c4076", "#fff")}
        {shield(7, 5, 5, 7.5, "#c6363c", "#e4b74a", greekCross(9.5, 8.4, 4, 1, "#fff"))}
      </>
    ),
  },
  SWE: { name: "Sweden", colors: ["#006aa7", "#fecc00", "#006aa7"], flag: nordic("#006aa7", "#fecc00", 9.4, 3.75) },
  ESP: {
    name: "Spain",
    colors: ["#aa151b", "#f1bf00", "#aa151b"],
    flag: (
      <>
        <rect width="30" height="20" fill="#aa151b" />
        <rect y="5" width="30" height="10" fill="#f1bf00" />
        {shield(7, 6.4, 4, 6, "#aa151b", "#c8a200")}
      </>
    ),
  },
  DOM: {
    name: "Dominican Republic",
    colors: ["#002d62", "#ffffff", "#ce1126"],
    flag: (
      <>
        <rect width="30" height="20" fill="#fff" />
        <rect width="12.75" height="8.5" fill="#002d62" />
        <rect x="17.25" width="12.75" height="8.5" fill="#ce1126" />
        <rect y="11.5" width="12.75" height="8.5" fill="#ce1126" />
        <rect x="17.25" y="11.5" width="12.75" height="8.5" fill="#002d62" />
        <circle cx="15" cy="10" r="1.5" fill="#fff" stroke="#00843d" strokeWidth="0.45" />
      </>
    ),
  },
  FIN: { name: "Finland", colors: ["#ffffff", "#002f6c", "#ffffff"], flag: nordic("#fff", "#002f6c", 8.3, 5) },
  CMR: {
    name: "Cameroon",
    colors: ["#007a5e", "#ce1126", "#fcd116"],
    flag: (
      <>
        {v3("#007a5e", "#ce1126", "#fcd116")}
        <polygon points={star(15, 10.2, 3)} fill="#fcd116" />
      </>
    ),
  },
  BIH: {
    name: "Bosnia and Herzegovina",
    colors: ["#002395", "#fecb00", "#002395"],
    flag: (
      <>
        <rect width="30" height="20" fill="#002395" />
        <polygon points="8,0 22,0 22,20" fill="#fecb00" />
        {/* the stars run down the triangle's long side, cut off at the top and bottom edges */}
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i - 0.5) / 7;
          return <polygon key={i} points={star(5.3 + 14 * t, 20 * t, 1.15)} fill="#fff" />;
        })}
      </>
    ),
  },
  CAN: {
    name: "Canada",
    colors: ["#d52b1e", "#ffffff", "#d52b1e"],
    flag: (
      <>
        <rect width="30" height="20" fill="#fff" />
        <rect width="7.5" height="20" fill="#d52b1e" />
        <rect x="22.5" width="7.5" height="20" fill="#d52b1e" />
        {/* a simplified eleven-point maple leaf with its stem */}
        <polygon
          transform="translate(15 9.6)"
          points="0,-4.6 0.9,-2.9 1.8,-3.3 1.5,-0.9 3,-2.4 3.3,-1.6 4.6,-1.9 4.1,-0.5 4.6,-0.1 2.3,1.7 2.6,2.6 0.3,2.3 0.3,4.6 -0.3,4.6 -0.3,2.3 -2.6,2.6 -2.3,1.7 -4.6,-0.1 -4.1,-0.5 -4.6,-1.9 -3.3,-1.6 -3,-2.4 -1.5,-0.9 -1.8,-3.3 -0.9,-2.9"
          fill="#d52b1e"
        />
      </>
    ),
  },
  SSD: {
    name: "South Sudan",
    colors: ["#000000", "#da121a", "#078930"],
    flag: (
      <>
        <rect width="30" height="20" fill="#fff" />
        <rect width="30" height="6" fill="#000" />
        <rect y="7" width="30" height="6" fill="#da121a" />
        <rect y="14" width="30" height="6" fill="#078930" />
        <polygon points="0,0 13,10 0,20" fill="#0f47af" />
        <polygon points={star(4.4, 10, 2.5)} fill="#fcdd09" />
      </>
    ),
  },
  BHS: {
    name: "Bahamas",
    colors: ["#00778b", "#ffc72c", "#00778b"],
    flag: (
      <>
        {h3("#00778b", "#ffc72c", "#00778b")}
        <polygon points="0,0 13,10 0,20" fill="#000" />
      </>
    ),
  },
  GEO: {
    name: "Georgia",
    colors: ["#ffffff", "#ff0000", "#ffffff"],
    flag: (
      <>
        <rect width="30" height="20" fill="#fff" />
        <rect x="13" width="4" height="20" fill="#f00" />
        <rect y="8" width="30" height="4" fill="#f00" />
        {[
          [6.5, 4],
          [23.5, 4],
          [6.5, 16],
          [23.5, 16],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>{greekCross(x, y, 3.4, 1.1, "#f00")}</g>
        ))}
      </>
    ),
  },
  DEU: { name: "Germany", colors: ["#000000", "#dd0000", "#ffce00"], flag: h3("#000", "#dd0000", "#ffce00") },
  LVA: {
    name: "Latvia",
    colors: ["#9e3039", "#ffffff", "#9e3039"],
    flag: (
      <>
        <rect width="30" height="20" fill="#9e3039" />
        <rect y="8" width="30" height="4" fill="#fff" />
      </>
    ),
  },
  LTU: { name: "Lithuania", colors: ["#fdb913", "#006a44", "#c1272d"], flag: h3("#fdb913", "#006a44", "#c1272d") },
  SEN: {
    name: "Senegal",
    colors: ["#00853f", "#fdef42", "#e31b23"],
    flag: (
      <>
        {v3("#00853f", "#fdef42", "#e31b23")}
        <polygon points={star(15, 10.2, 2.8)} fill="#00853f" />
      </>
    ),
  },
  RUS: { name: "Russia", colors: ["#ffffff", "#0039a6", "#d52b1e"], flag: h3("#fff", "#0039a6", "#d52b1e") },
  TUR: {
    name: "Türkiye",
    colors: ["#e30a17", "#ffffff", "#e30a17"],
    flag: (
      <>
        <rect width="30" height="20" fill="#e30a17" />
        <circle cx="11" cy="10" r="5" fill="#fff" />
        <circle cx="12.25" cy="10" r="4" fill="#e30a17" />
        <polygon points={star(17.6, 10, 2.1, 180)} fill="#fff" />
      </>
    ),
  },
  HRV: {
    name: "Croatia",
    colors: ["#ff0000", "#ffffff", "#171796"],
    flag: (
      <>
        {h3("#f00", "#fff", "#171796")}
        <g>
          <rect x="12.5" y="4.5" width="5" height="7" fill="#fff" stroke="#171796" strokeWidth="0.3" />
          {Array.from({ length: 35 }, (_, i) => {
            const cx = i % 5;
            const cy = Math.floor(i / 5);
            return (cx + cy) % 2 ? null : (
              <rect key={i} x={12.5 + cx} y={4.5 + cy} width="1" height="1" fill="#f00" />
            );
          })}
        </g>
      </>
    ),
  },
  COD: {
    name: "DR Congo",
    colors: ["#007fff", "#f7d618", "#ce1021"],
    flag: (
      <>
        <rect width="30" height="20" fill="#007fff" />
        <polygon points="0,20 0,15.5 23.25,0 30,0 30,4.5 6.75,20" fill="#f7d618" />
        <polygon points="0,20 0,17 25.5,0 30,0 30,3 4.5,20" fill="#ce1021" />
        <polygon points={star(5, 4.6, 3)} fill="#f7d618" />
      </>
    ),
  },
  NZL: {
    name: "New Zealand",
    colors: ["#012169", "#c8102e", "#012169"],
    flag: (
      <>
        <rect width="30" height="20" fill="#012169" />
        {union(0, 0, 15, 10)}
        {[
          [22.5, 4.4, 1.3],
          [19.6, 9.2, 1.15],
          [25.4, 8.2, 1.05],
          [22.5, 15.4, 1.45],
        ].map(([x, y, r]) => (
          <polygon key={`${x}-${y}`} points={star(x, y, r)} fill="#c8102e" stroke="#fff" strokeWidth="0.35" />
        ))}
      </>
    ),
  },
  GRC: {
    name: "Greece",
    colors: ["#0d5eaf", "#ffffff", "#0d5eaf"],
    flag: (
      <>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} y={(i * 20) / 9} width="30" height={20 / 9} fill={i % 2 ? "#fff" : "#0d5eaf"} />
        ))}
        <rect width="11.11" height="11.11" fill="#0d5eaf" />
        <rect x="4.44" width="2.22" height="11.11" fill="#fff" />
        <rect y="4.44" width="11.11" height="2.22" fill="#fff" />
      </>
    ),
  },
  GBR: { name: "United Kingdom", colors: ["#012169", "#ffffff", "#c8102e"], flag: union(0, 0, 30, 20) },
};

/** A flag at 3:2, labelled for screen readers. */
export function Flag({ code }: { code: string }) {
  const n = NATIONS[code];
  if (!n) return null;
  return (
    <svg viewBox="0 0 30 20" role="img" aria-label={`Flag of ${n.name}`}>
      {n.flag}
    </svg>
  );
}

/** The flag's colours as hard vertical stripes, top to bottom. */
export function flagStripes(code: string) {
  const c = NATIONS[code]?.colors ?? ["#233862"];
  const step = 100 / c.length;
  return `linear-gradient(180deg, ${c.map((x, i) => `${x} ${(i * step).toFixed(2)}% ${((i + 1) * step).toFixed(2)}%`).join(", ")})`;
}
