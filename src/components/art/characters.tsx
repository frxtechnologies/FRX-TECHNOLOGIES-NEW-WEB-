import type { CSSProperties } from "react";

/**
 * FRX editorial illustration kit — original artwork, drawn in SVG.
 *
 * House style: chunky rounded forms, a thick ink outline, three-tone blue
 * shading for volume (light face / mid face / deep face), a soft contact
 * shadow. Ink is `var(--fx-ink)`, so the outline inverts with the theme and the
 * characters read as stickers on both paper and black.
 *
 * Eyes are marked `.fxa-eye` with a `.fxa-pupil` inside — the hero tracks the
 * pointer with them. Everything that animates is addressed by class so these
 * stay plain server components.
 *
 * <FxArtDefs /> must be rendered once on any page that uses these (it holds the
 * shared gradients).
 */

/** Characters keep their own outline/paper colours so a panel can re-bind text colours without erasing a face. */
export const INK = "var(--fxa-ink, var(--fx-ink))";
export const PAPER = "var(--fxa-paper, var(--fx-surface))";

export function FxArtDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="fxa-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3aa1ff" />
          <stop offset="0.5" stopColor="#045cec" />
          <stop offset="1" stopColor="#0433a8" />
        </linearGradient>
        <linearGradient id="fxa-blue-lit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fd0ff" />
          <stop offset="1" stopColor="#008cff" />
        </linearGradient>
        <linearGradient id="fxa-blue-deep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a4fd0" />
          <stop offset="1" stopColor="#031f6e" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** A cog outline: `teeth` square-ish teeth between an inner and an outer radius. */
function cogPath(cx: number, cy: number, ro: number, ri: number, teeth: number) {
  const at = (ang: number, r: number) =>
    `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
  const step = (Math.PI * 2) / teeth;
  const t = step * 0.22;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    pts.push(at(a - t * 1.6, ri), at(a - t, ro), at(a + t, ro), at(a + t * 1.6, ri));
  }
  return "M" + pts.join("L") + "Z";
}

export type ArtProps = { className?: string; style?: CSSProperties };

/** BUILD — a browser window that has come to life. */
export function WindowBuddy({ className, style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 240 216"
      className={className}
      style={style}
      role="img"
      aria-label="Illustration: a friendly browser window character waving"
    >
      <ellipse cx="116" cy="205" rx="74" ry="8" fill={INK} opacity="0.16" />

      {/* legs + shoes */}
      <g className="fxa-legs" stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <rect x="76" y="156" width="22" height="34" rx="9" fill="url(#fxa-blue-deep)" />
        <rect x="134" y="156" width="22" height="34" rx="9" fill="url(#fxa-blue-deep)" />
        <path d="M66 190h40a8 8 0 0 1 0 14H70a8 8 0 0 1-4-14z" fill={INK} />
        <path d="M124 190h40a8 8 0 0 1 0 14h-36a8 8 0 0 1-4-14z" fill={INK} />
      </g>

      {/* left arm (rests) */}
      <g stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 104c-16 4-20 30-6 38" fill="none" />
        <circle cx="19" cy="143" r="9" fill={PAPER} />
      </g>

      {/* right arm (waves) */}
      <g className="fxa-wave" data-origin="206 104">
        <path
          d="M208 106c20-4 30-22 24-42"
          fill="none"
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="231" cy="60" r="10" fill={PAPER} stroke={INK} strokeWidth="5" />
      </g>

      {/* the window */}
      <rect x="22" y="14" width="188" height="148" rx="20" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5.5" />
      <path
        d="M22 34a20 20 0 0 1 20-20h148a20 20 0 0 1 20 20v14H22z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="31" r="6" fill={INK} />
      <circle cx="64" cy="31" r="6" fill="url(#fxa-blue-lit)" stroke={INK} strokeWidth="3" />
      <circle cx="82" cy="31" r="6" fill={PAPER} stroke={INK} strokeWidth="3" />
      <rect x="112" y="25" width="76" height="12" rx="6" fill="none" stroke={INK} strokeWidth="3" opacity="0.45" />

      {/* screen + face */}
      <rect x="36" y="60" width="160" height="88" rx="12" fill={PAPER} stroke={INK} strokeWidth="5" />
      <g className="fxa-eye" transform="translate(86 92)">
        <circle r="16" fill="#fff" stroke={INK} strokeWidth="4.5" />
        <circle className="fxa-pupil" r="7" fill={INK} />
        <circle r="2.6" cx="-3" cy="-4" fill="#fff" className="fxa-glint" />
      </g>
      <g className="fxa-eye" transform="translate(146 92)">
        <circle r="16" fill="#fff" stroke={INK} strokeWidth="4.5" />
        <circle className="fxa-pupil" r="7" fill={INK} />
        <circle r="2.6" cx="-3" cy="-4" fill="#fff" className="fxa-glint" />
      </g>
      <path d="M96 120q20 20 40 0" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="66" cy="116" r="7" fill="#008cff" opacity="0.35" />
      <circle cx="166" cy="116" r="7" fill="#008cff" opacity="0.35" />

      {/* rim light */}
      <path d="M32 44c0-12 8-20 20-20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/** AUTOMATE — a small robot with a gear in its chest. */
export function BotBuddy({ className, style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 210 240"
      className={className}
      style={style}
      role="img"
      aria-label="Illustration: a small friendly automation robot"
    >
      <ellipse cx="104" cy="230" rx="62" ry="7" fill={INK} opacity="0.16" />

      {/* antenna */}
      <path d="M104 34V12" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle className="fxa-ping" data-origin="104 9" cx="104" cy="9" r="9" fill="url(#fxa-blue-lit)" stroke={INK} strokeWidth="4.5" />

      {/* legs */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <rect x="68" y="196" width="20" height="26" rx="8" fill="url(#fxa-blue-deep)" />
        <rect x="120" y="196" width="20" height="26" rx="8" fill="url(#fxa-blue-deep)" />
        <path d="M58 222h40a7 7 0 0 1 0 12H62a7 7 0 0 1-4-12z" fill={INK} />
        <path d="M110 222h40a7 7 0 0 1 0 12h-36a7 7 0 0 1-4-12z" fill={INK} />
      </g>

      {/* arms */}
      <g stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M54 156c-22 2-30 22-22 40" fill="none" />
        <path d="M24 196a10 10 0 0 1 16-4" fill="none" />
        <g className="fxa-wave" data-origin="156 156">
          <path d="M156 156c22 2 30-14 24-34" fill="none" />
          <circle cx="178" cy="118" r="9" fill={PAPER} />
        </g>
      </g>

      {/* body */}
      <rect x="54" y="136" width="100" height="70" rx="24" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5.5" />
      <g className="fxa-cog" data-origin="104 171">
        <path
          d={cogPath(104, 171, 25, 18, 9)}
          fill={PAPER}
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <circle cx="104" cy="171" r="7" fill="url(#fxa-blue)" stroke={INK} strokeWidth="4" />
      </g>

      {/* head */}
      <rect x="32" y="32" width="144" height="104" rx="36" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5.5" />
      <rect x="12" y="66" width="18" height="38" rx="8" fill={INK} />
      <rect x="178" y="66" width="18" height="38" rx="8" fill={INK} />
      {/* visor */}
      <rect x="48" y="52" width="112" height="62" rx="26" fill={INK} />
      <g className="fxa-eye" transform="translate(82 82)">
        <ellipse rx="13" ry="16" fill="url(#fxa-blue-lit)" />
        <ellipse className="fxa-pupil" rx="5.5" ry="7" fill="#fff" />
      </g>
      <g className="fxa-eye" transform="translate(126 82)">
        <ellipse rx="13" ry="16" fill="url(#fxa-blue-lit)" />
        <ellipse className="fxa-pupil" rx="5.5" ry="7" fill="#fff" />
      </g>
      <path d="M92 102q12 9 24 0" fill="none" stroke="#8fd0ff" strokeWidth="4" strokeLinecap="round" />
      <path d="M44 48c4-10 12-14 22-14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/** One isometric cube. (cx, cy) is the top vertex; `s` is the edge length. */
function Cube({ cx, cy, s, className }: { cx: number; cy: number; s: number; className?: string }) {
  const top = `${cx},${cy} ${cx + s},${cy + s / 2} ${cx},${cy + s} ${cx - s},${cy + s / 2}`;
  const left = `${cx - s},${cy + s / 2} ${cx},${cy + s} ${cx},${cy + 2 * s} ${cx - s},${cy + 1.5 * s}`;
  const right = `${cx + s},${cy + s / 2} ${cx},${cy + s} ${cx},${cy + 2 * s} ${cx + s},${cy + 1.5 * s}`;
  return (
    <g className={className} stroke={INK} strokeWidth="5" strokeLinejoin="round">
      <polygon points={left} fill="url(#fxa-blue)" />
      <polygon points={right} fill="url(#fxa-blue-deep)" />
      <polygon points={top} fill="url(#fxa-blue-lit)" />
    </g>
  );
}

/** SCALE — blocks stacking up, with an arrow that has somewhere to go. */
export function BlockStack({ className, style }: ArtProps) {
  const s = 52;
  return (
    <svg
      viewBox="0 0 330 270"
      className={className}
      style={style}
      role="img"
      aria-label="Illustration: isometric blocks stacking upward with an arrow"
    >
      <ellipse cx="165" cy="262" rx="130" ry="9" fill={INK} opacity="0.16" />

      {/* base row, back to front so faces overlap correctly */}
      <Cube className="fxa-cube fxa-cube-1" cx={165} cy={150} s={s} />
      <Cube className="fxa-cube fxa-cube-2" cx={113} cy={176} s={s} />
      <Cube className="fxa-cube fxa-cube-3" cx={217} cy={176} s={s} />
      <Cube className="fxa-cube fxa-cube-4" cx={165} cy={202} s={s} />
      {/* second tier */}
      <Cube className="fxa-cube fxa-cube-5" cx={165} cy={98} s={s} />
      <Cube className="fxa-cube fxa-cube-6" cx={165} cy={46} s={s} />

      {/* a face on the left side of the top block */}
      <g transform="matrix(1 0.5 0 1 113 72)">
        <g className="fxa-eye" transform="translate(16 18)">
          <circle r="8" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle className="fxa-pupil" r="3.4" fill={INK} />
        </g>
        <g className="fxa-eye" transform="translate(38 18)">
          <circle r="8" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle className="fxa-pupil" r="3.4" fill={INK} />
        </g>
        <path d="M18 34q10 9 20 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* the arrow */}
      <g className="fxa-arrow" stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M268 120V40" fill="none" />
        <path d="M244 62l24-28 24 28z" fill="url(#fxa-blue-lit)" />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   DOODLES — hand-drawn blue marks. `data-draw` paths are stroke-drawn by the
   hero (DrawSVG); everything is a single stroke so it animates cleanly.
   ------------------------------------------------------------------------- */

const doodle = { fill: "none", stroke: "var(--fx-blue)", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function Sparkle({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} aria-hidden="true">
      <path data-draw d="M30 4c2 14 6 22 26 26-20 4-24 12-26 26-2-14-6-22-26-26 20-4 24-12 26-26z" {...doodle} strokeWidth="5" />
    </svg>
  );
}

export function Squiggle({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 300 40" className={className} style={style} aria-hidden="true" preserveAspectRatio="none">
      <path
        data-draw
        d="M6 22c14-20 28-20 42 0s28 20 42 0 28-20 42 0 28 20 42 0 28-20 42 0 28 20 42 0 28-14 36-6"
        {...doodle}
        strokeWidth="8"
      />
    </svg>
  );
}

export function LoopArrow({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 220 140" className={className} style={style} aria-hidden="true">
      <path
        data-draw
        d="M8 118C46 124 70 96 62 66c-6-22-34-22-38-2-4 22 24 34 52 20 40-20 56-56 104-52"
        {...doodle}
        strokeWidth="7"
      />
      <path data-draw d="M164 18l34 12-18 30" {...doodle} strokeWidth="7" />
    </svg>
  );
}

export function ScribbleRing({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 400 200" className={className} style={style} aria-hidden="true" preserveAspectRatio="none">
      <path
        data-draw
        d="M200 14C98 10 12 46 14 104c2 56 90 88 190 84 108-4 186-38 182-96C382 40 292 8 190 20c-52 6-92 24-112 44"
        {...doodle}
        strokeWidth="6"
      />
    </svg>
  );
}

export function Asterisk({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} style={style} aria-hidden="true">
      <path data-draw d="M40 6v68M10 22l60 36M70 22L10 58" {...doodle} strokeWidth="9" />
    </svg>
  );
}

export function Zig({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 120 40" className={className} style={style} aria-hidden="true">
      <path data-draw d="M4 30L24 8l24 22 24-22 24 22 20-18" {...doodle} strokeWidth="7" />
    </svg>
  );
}

/** UI/UX — a chunky pointer that has opinions about spacing. */
export function CursorBuddy({ className, style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 240 250"
      className={className}
      style={style}
      role="img"
      aria-label="Illustration: a friendly cursor arrow character"
    >
      <ellipse cx="120" cy="240" rx="72" ry="8" fill={INK} opacity="0.16" />

      {/* legs */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <rect x="92" y="190" width="20" height="34" rx="8" fill="url(#fxa-blue-deep)" />
        <rect x="132" y="190" width="20" height="34" rx="8" fill="url(#fxa-blue-deep)" />
        <path d="M82 224h40a7 7 0 0 1 0 12H86a7 7 0 0 1-4-12z" fill={INK} />
        <path d="M122 224h40a7 7 0 0 1 0 12h-36a7 7 0 0 1-4-12z" fill={INK} />
      </g>

      {/* arm holding a little pen */}
      <g className="fxa-wave" data-origin="170 150">
        <path d="M172 150c24 2 36-16 30-38" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <circle cx="202" cy="108" r="10" fill={PAPER} stroke={INK} strokeWidth="5" />
        <path d="M208 96l14-26" stroke="url(#fxa-blue-lit)" strokeWidth="9" strokeLinecap="round" />
        <path d="M208 96l14-26" stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />
      </g>

      {/* the pointer body — blue shade side, paper lit side */}
      <path
        d="M52 22v176l46-42 34 74 34-16-34-72h60z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M52 22l60 112H72z" fill="url(#fxa-blue)" opacity="0.9" />
      <path d="M52 22v176l46-42" fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round" />

      {/* face on the lit panel */}
      <g className="fxa-eye" transform="translate(98 110)">
        <circle r="12" fill="#fff" stroke={INK} strokeWidth="4" />
        <circle className="fxa-pupil" r="5" fill={INK} />
      </g>
      <g className="fxa-eye" transform="translate(132 120)">
        <circle r="12" fill="#fff" stroke={INK} strokeWidth="4" />
        <circle className="fxa-pupil" r="5" fill={INK} />
      </g>
      <path d="M96 142q14 11 28 2" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

/** A hand-drawn marker underline: one loose stroke, drawn on by `data-draw`. */
export function MarkerUnderline({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 400 30" className={className} style={style} aria-hidden="true" preserveAspectRatio="none">
      <path
        data-draw
        d="M6 20C58 6 120 26 190 13s140-9 204 6"
        {...doodle}
        strokeWidth="9"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
