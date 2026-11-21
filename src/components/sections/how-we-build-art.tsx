/**
 * Illustrations for the "How we build" stages. Original SVG, 16:9, drawn for a navy blueprint panel in the
 * FRX sticker style (light cards, 3px ink outlines, the FRX blues). Strictly blue / white / navy / grey:
 * no yellow and no palette-accent token anywhere, so they look identical in every theme.
 *
 * Each one is a handful of shapes. The classes `fxhb-draw` (stroke draws in) and `fxhb-pop` (rises into
 * place) are one-shot entrance animations staggered with `--d`; remounting the SVG (a `key` on the stage)
 * replays them. Nothing loops, so there is no ongoing cost; reduced motion shows the finished picture.
 */
const INK = "#0a0a0c";
const CARD = "#f3f7ff";
const BLUE = "#2f7bf0";
const BLUE_D = "#045cec";
const BLUE_L = "#8fc2ff";
const GREY = "#c4cee2";

const sw = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const pop = (d: number) => ({ className: "fxhb-pop", style: { "--d": `${d}s` } as React.CSSProperties });

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 640 360" className="fxhb-svg" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

/** 1 — Build around the problem: a brief is read, requirements come out of it. */
export function ArtProblem() {
  return (
    <Frame label="Illustration: a brief is examined and turned into clear requirements">
      {/* the brief */}
      <g {...pop(0)}>
        <rect x="46" y="48" width="196" height="256" rx="16" fill={CARD} {...sw} />
        <rect x="64" y="68" width="92" height="14" rx="7" fill={INK} />
        <g strokeLinecap="round" strokeWidth="7">
          <path d="M64 108h150" stroke={GREY} />
          <path d="M64 130h120" stroke={GREY} />
          <path d="M64 152h140" stroke={BLUE_D} opacity="0.85" />
          <path d="M64 174h96" stroke={GREY} />
          <path d="M64 196h132" stroke={GREY} />
          <path d="M64 218h84" stroke={GREY} />
        </g>
        <rect x="64" y="248" width="70" height="26" rx="13" fill="none" stroke={BLUE_D} strokeWidth="3" strokeDasharray="5 6" />
      </g>
      {/* the magnifier */}
      <g {...pop(0.25)}>
        <circle cx="206" cy="168" r="46" fill="#fff" fillOpacity="0.18" stroke={INK} strokeWidth="5" />
        <circle cx="206" cy="168" r="46" fill="none" stroke={BLUE_L} strokeWidth="2.5" />
        <path d="M240 202l30 30" stroke={INK} strokeWidth="11" strokeLinecap="round" />
        <path d="M240 202l30 30" stroke={BLUE} strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* from the brief to the requirements */}
      <path className="fxhb-draw" pathLength="1" d="M276 168C320 168 330 108 380 108M276 168H380M276 168C320 168 330 228 380 228" fill="none" stroke={BLUE_L} strokeWidth="4" strokeLinecap="round" strokeDasharray="1" style={{ "--d": "0.5s" } as React.CSSProperties} />
      {[["Goal", 84], ["Users", 168], ["Process", 252]].map(([t, y], i) => (
        <g key={String(t)} {...pop(0.7 + i * 0.12)}>
          <rect x="380" y={Number(y) - 24 + 24 - 24} width="214" height="48" rx="24" fill={CARD} {...sw} />
          <circle cx="408" cy={Number(y)} r="14" fill={BLUE} stroke={INK} strokeWidth="3" />
          <path d={`M401 ${Number(y)}l5 5 9-10`} fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="436" y={Number(y) + 6} fontSize="19" fontWeight="800" fill={INK} style={{ fontFamily: "var(--fx-font-display)", textTransform: "uppercase", fontStretch: "75%" }}>{t}</text>
        </g>
      ))}
    </Frame>
  );
}

/** 2 — Keep systems useful: used features stay, unused ones are a cost. */
export function ArtUseful() {
  const bars: [number, number, boolean][] = [[78, 150, true], [140, 96, true], [202, 188, true], [264, 60, false], [326, 38, false]];
  return (
    <Frame label="Illustration: a usage dashboard where well-used features stand tall and unused ones fade">
      <g {...pop(0)}>
        <rect x="40" y="40" width="388" height="280" rx="18" fill={CARD} {...sw} />
        <rect x="58" y="58" width="120" height="14" rx="7" fill={INK} />
        <path d="M58 280H410" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        {bars.map(([x, h, used], i) => (
          <g key={x} {...pop(0.15 + i * 0.1)}>
            <rect x={x} y={280 - h} width="44" height={h} rx="8" fill={used ? (i % 2 ? BLUE_D : BLUE) : "none"} stroke={used ? INK : GREY} strokeWidth={used ? 3.5 : 3} strokeDasharray={used ? "none" : "6 6"} />
            {!used && <path d={`M${x + 14} ${280 - h - 18}l16 16M${x + 30} ${280 - h - 18}l-16 16`} stroke={GREY} strokeWidth="3.5" strokeLinecap="round" />}
          </g>
        ))}
        <path className="fxhb-draw" pathLength="1" d="M70 150L162 112 224 86 290 100 372 60" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" style={{ "--d": "0.7s" } as React.CSSProperties} />
      </g>
      {/* people actually using it */}
      <g {...pop(0.5)}>
        <rect x="460" y="40" width="144" height="128" rx="18" fill={CARD} {...sw} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={498 + i * 34} cy="82" r="14" fill={[BLUE, BLUE_D, BLUE_L][i]} stroke={INK} strokeWidth="3" />
            <path d={`M${484 + i * 34} 118c0-9 6-14 14-14s14 5 14 14`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
        <path d="M478 146h108" stroke={GREY} strokeWidth="6" strokeLinecap="round" />
        <path d="M478 146h78" stroke={BLUE_D} strokeWidth="6" strokeLinecap="round" />
      </g>
      <g {...pop(0.7)}>
        <rect x="460" y="190" width="144" height="130" rx="18" fill={CARD} {...sw} />
        {[0, 1].map((i) => (
          <g key={i}>
            <path d={`M480 ${224 + i * 46}h50`} stroke={i ? GREY : INK} strokeWidth="6" strokeLinecap="round" />
            <rect x="552" y={212 + i * 46} width="38" height="22" rx="11" fill={i ? "none" : BLUE} stroke={i ? GREY : INK} strokeWidth="3.5" />
            <circle cx={i ? 563 : 579} cy={223 + i * 46} r="7" fill={i ? GREY : "#fff"} stroke={i ? "none" : INK} strokeWidth="2.5" />
          </g>
        ))}
      </g>
      {/* the cursor choosing what matters */}
      <path {...pop(0.9)} d="M392 236l-6-32 24 18-11 3 8 14-6 3-8-14z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </Frame>
  );
}

/** 3 — Design intentionally: an exploded stack of interface layers + tokens. */
export function ArtDesign() {
  const layer = (y: number, fill: string, k: string, children: React.ReactNode, d: number) => (
    <g key={k} {...pop(d)}>
      <path d={`M120 ${y}L310 ${y - 66}L500 ${y}L310 ${y + 66}z`} fill={fill} {...sw} />
      <path d={`M120 ${y}v14L310 ${y + 80}L500 ${y + 14}V${y}L310 ${y + 66}z`} fill={BLUE_D} fillOpacity="0.35" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {children}
    </g>
  );
  return (
    <Frame label="Illustration: interface design shown as exploded layers, from wireframe to finished UI, with colour and type tokens">
      <g stroke={BLUE_L} strokeOpacity="0.5" strokeWidth="2.5" strokeDasharray="4 6" fill="none">
        <path d="M120 268V196M500 268V196M310 334V262" />
        <path d="M120 196V124M500 196V124M310 262V190" />
      </g>
      {layer(262, "#e4ecfb", "base", (
        <g fill="none" stroke={GREY} strokeWidth="3" strokeDasharray="6 5" strokeLinejoin="round">
          <path d="M250 262l60-24 60 24-60 24z" />
          <path d="M200 262l30-12M420 262l-30-12" />
        </g>
      ), 0)}
      {layer(196, "#cfe0fb", "mid", (
        <g {...sw} strokeWidth="3">
          <path d="M262 196l36-14 36 14-36 14z" fill="#fff" />
          <path d="M318 196l30-12 30 12-30 12z" fill={BLUE} />
          <path d="M276 214l30-12 30 12-30 12z" fill={BLUE_D} />
        </g>
      ), 0.18)}
      {layer(130, "#ffffff", "top", (
        <g>
          <path d="M250 130l60-24 60 24-60 24z" fill={BLUE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M276 130l34-14 34 14M296 140l14-6 14 6" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ), 0.36)}
      {/* design tokens: colour + type */}
      <g {...pop(0.6)}>
        {[BLUE_D, BLUE, BLUE_L, "#fff", GREY].map((c, i) => (
          <circle key={c} cx={64} cy={86 + i * 40} r="15" fill={c} stroke={INK} strokeWidth="3" />
        ))}
        <rect x="540" y="86" width="64" height="64" rx="14" fill={CARD} {...sw} />
        <text x="572" y="132" textAnchor="middle" fontSize="38" fontWeight="800" fill={INK} style={{ fontFamily: "var(--fx-font-display)" }}>Aa</text>
        <path d="M542 190h60M542 204h40M542 218h52" stroke={BLUE_L} strokeWidth="5" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

/** 4 — Automate intelligently: the machine handles the routine, people keep the judgement. */
export function ArtAutomate() {
  const node = (x: number, y: number, w: number, fill: string, d: number, inner: React.ReactNode, k: string) => (
    <g key={k} {...pop(d)}>
      <rect x={x} y={y} width={w} height="56" rx="16" fill={fill} {...sw} />
      {inner}
    </g>
  );
  return (
    <Frame label="Illustration: a workflow where automation handles routine steps and a person reviews the uncertain ones">
      <path className="fxhb-draw" pathLength="1" d="M130 180H214M290 156C330 124 340 92 380 92H470M290 204C330 236 340 268 380 268H470M526 92H560C586 92 586 180 560 180H520M526 268H560C586 268 586 180 560 180" fill="none" stroke={BLUE_L} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" style={{ "--d": "0.15s" } as React.CSSProperties} />
      {node(40, 152, 92, CARD, 0, <path d="M92 170l-12 16h14l-6 16 22-22H96l8-10z" fill={BLUE_D} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />, "trigger")}
      {/* the decision */}
      <g {...pop(0.2)}>
        <path d="M252 134l56 46-56 46-56-46z" fill={BLUE} {...sw} />
        <g className="fxa-eye">
          <circle cx="236" cy="174" r="8" fill="#fff" stroke={INK} strokeWidth="3" />
          <circle cx="268" cy="174" r="8" fill="#fff" stroke={INK} strokeWidth="3" />
        </g>
        <circle cx="236" cy="175" r="3.5" fill={INK} />
        <circle cx="268" cy="175" r="3.5" fill={INK} />
        <path d="M242 192q10 8 20 0" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      {/* automatic path */}
      {node(380, 64, 150, CARD, 0.4, <>
        <circle cx="410" cy="92" r="13" fill={BLUE} stroke={INK} strokeWidth="3" />
        <path d="M404 92l5 5 8-9" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M434 84h74M434 100h50" stroke={GREY} strokeWidth="6" strokeLinecap="round" />
      </>, "auto")}
      {/* a person reviews the uncertain case */}
      {node(380, 240, 150, CARD, 0.55, <>
        <circle cx="410" cy="260" r="10" fill={BLUE_L} stroke={INK} strokeWidth="3" />
        <path d="M394 288c0-9 7-14 16-14s16 5 16 14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M444 256h64M444 272h42" stroke={GREY} strokeWidth="6" strokeLinecap="round" />
      </>, "human")}
      {/* done */}
      <g {...pop(0.8)}>
        <circle cx="560" cy="180" r="26" fill={BLUE_D} {...sw} />
        <path d="M547 180l9 9 17-19" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Frame>
  );
}

/** 5 — Engineer for growth: the same system, still sound as it grows. */
export function ArtGrowth() {
  const cube = (x: number, y: number, s: number, fill: string, k: string, d: number) => (
    <g key={k} {...pop(d)}>
      <path d={`M${x} ${y}l${s} ${s / 2}v${s}l-${s} -${s / 2}z`} fill={BLUE_D} {...sw} strokeWidth="3" />
      <path d={`M${x + s} ${y + s / 2}l${s} -${s / 2}v${s}l-${s} ${s / 2}z`} fill={BLUE} {...sw} strokeWidth="3" />
      <path d={`M${x} ${y}l${s} -${s / 2}l${s} ${s / 2}l-${s} ${s / 2}z`} fill={fill} {...sw} strokeWidth="3" />
    </g>
  );
  return (
    <Frame label="Illustration: one small module growing into a connected set of modules while performance keeps rising">
      <path className="fxhb-draw" pathLength="1" d="M40 316C140 312 220 296 300 256S440 124 604 56" fill="none" stroke={BLUE_L} strokeWidth="4.5" strokeLinecap="round" strokeDasharray="1" style={{ "--d": "0.1s" } as React.CSSProperties} />
      {/* stage 1: one module */}
      {cube(70, 224, 30, "#fff", "a", 0)}
      {/* stage 2: a few, connected */}
      <path d="M184 214l24-12M232 202l22 12" stroke={BLUE_L} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 7" />
      {cube(160, 224, 26, "#fff", "b1", 0.2)}
      {cube(210, 196, 26, BLUE_L, "b2", 0.3)}
      {cube(256, 224, 26, "#fff", "b3", 0.4)}
      {/* stage 3: an ecosystem around a core */}
      <path d="M470 168l-34-22M470 168l34-22M470 168v-44M470 168l-40 28M470 168l40 28" stroke={BLUE_L} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 7" />
      {cube(444, 148, 26, "#fff", "c0", 0.6)}
      {cube(398, 118, 22, BLUE_L, "c1", 0.7)}
      {cube(492, 118, 22, BLUE_L, "c2", 0.75)}
      {cube(448, 76, 22, "#fff", "c3", 0.8)}
      {cube(392, 186, 22, "#fff", "c4", 0.85)}
      {cube(498, 186, 22, "#fff", "c5", 0.9)}
      <g {...pop(1)}>
        <path d="M584 120l-20 30h13v38h14v-38h13z" fill={CARD} {...sw} />
      </g>
    </Frame>
  );
}

export const STAGE_ART = [ArtProblem, ArtUseful, ArtDesign, ArtAutomate, ArtGrowth];
