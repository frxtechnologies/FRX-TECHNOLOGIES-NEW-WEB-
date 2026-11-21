/**
 * The FRX "layers" illustration — the large hero graphic. Original artwork, pure SVG (no raster, so no
 * rectangular background and it stays sharp at any size).
 *
 * The idea is the architecture of a product, not a diagram of buzzwords: three isometric tiers, each
 * lit a little brighter than the one below —
 *   · INFRASTRUCTURE (base)   data and servers, on an engineered grid
 *   · INTELLIGENCE   (middle) the AI core, a ring of logic and circuit traces running to the edges
 *   · INTERFACE      (top)    what people actually use: a product window and a live chart
 * Thin light beams join the tiers at their corners. Nothing orbits and nothing revolves: the composition
 * is stable, and its only motion is a very slow glow "breathing" on the AI core (opacity only, off for
 * reduced motion). Theme-aware parts (the status dot) use the palette's accent token.
 */
const INK = "#0a0a0c";

/** One isometric slab: a lit top, two shaded sides. Returns the three faces as paths. */
function Slab({ cx, cy, hw, hh, t, top, left, right }: { cx: number; cy: number; hw: number; hh: number; t: number; top: string; left: string; right: string }) {
  const sw = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" } as const;
  return (
    <g>
      <path d={`M${cx - hw} ${cy}L${cx} ${cy + hh}v${t}L${cx - hw} ${cy + t}z`} fill={left} {...sw} />
      <path d={`M${cx} ${cy + hh}L${cx + hw} ${cy}v${t}L${cx} ${cy + hh + t}z`} fill={right} {...sw} />
      <path d={`M${cx} ${cy - hh}L${cx + hw} ${cy}L${cx} ${cy + hh}L${cx - hw} ${cy}z`} fill={top} {...sw} />
      {/* a crisp light rim along the two upper edges */}
      <path d={`M${cx - hw + 3} ${cy - 1}L${cx - 1} ${cy - hh + 2}L${cx + hw - 3} ${cy - 1}`} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** A thin vertical light beam joining two tiers. */
function Beam({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <g>
      <rect x={x - 3} y={y1} width="6" height={y2 - y1} rx="3" fill="url(#hub-beam)" />
      <circle cx={x} cy={y1} r="5" fill="#fff" stroke="#2f7bf0" strokeWidth="2.5" />
      <circle cx={x} cy={y2} r="5" fill="#fff" stroke="#2f7bf0" strokeWidth="2.5" />
    </g>
  );
}

export function FxHub({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 520" className={`fxhub ${className}`} role="presentation" focusable="false" aria-hidden="true">
      <defs>
        <radialGradient id="hub-glow" cx="320" cy="270" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4aa3ff" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#045cec" stopOpacity="0.14" />
          <stop offset="1" stopColor="#045cec" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hub-top-1" x1="200" y1="145" x2="440" y2="267" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a8d1ff" />
          <stop offset="1" stopColor="#4a97f8" />
        </linearGradient>
        <linearGradient id="hub-top-2" x1="140" y1="202" x2="500" y2="382" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fb0ff" />
          <stop offset="1" stopColor="#1b66ec" />
        </linearGradient>
        <linearGradient id="hub-top-3" x1="80" y1="260" x2="560" y2="500" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3f86f2" />
          <stop offset="1" stopColor="#0b45b8" />
        </linearGradient>
        <linearGradient id="hub-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#7ab4ff" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="hub-core" cx="320" cy="292" r="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#bfe0ff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#4aa3ff" stopOpacity="0" />
        </radialGradient>
        <filter id="hub-blur" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="hub-blur-s" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* atmosphere + contact shadow */}
      <ellipse cx="320" cy="275" rx="310" ry="250" fill="url(#hub-glow)" />
      <ellipse cx="322" cy="506" rx="236" ry="20" fill={INK} opacity="0.2" filter="url(#hub-blur)" />

      {/* ============ BASE TIER — infrastructure ============ */}
      <Slab cx={320} cy={380} hw={240} hh={120} t={20} top="url(#hub-top-3)" left="#08317f" right="#0a3da0" />
      <g stroke="#fff" strokeOpacity="0.16" strokeWidth="1.5" fill="none">
        <path d="M110 350 380 485M170 320 440 455M230 290 500 425M290 270 560 405" />
        <path d="M530 350 260 485M470 320 200 455M410 290 140 425M350 270 80 405" />
      </g>
      {/* servers: two small racks and a data store on the base tier */}
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <path d="M118 398l24 12v22l-24-12z" fill="#0a3da0" />
        <path d="M142 410l24-12v22l-24 12z" fill="#2f7bf0" />
        <path d="M118 398l24-12 24 12-24 12z" fill="#9ccaff" />
        <path d="M122 408l16 8M122 417l16 8" stroke="#fff" strokeOpacity="0.75" strokeLinecap="round" />
        <path d="M474 398l24 12v22l-24-12z" fill="#0a3da0" />
        <path d="M498 410l24-12v22l-24 12z" fill="#2f7bf0" />
        <path d="M474 398l24-12 24 12-24 12z" fill="#9ccaff" />
        <path d="M478 408l16 8M478 417l16 8" stroke="#fff" strokeOpacity="0.75" strokeLinecap="round" />
        <path d="M296 452v14c0 6 10 11 24 11s24-5 24-11v-14" fill="#2f7bf0" />
        <ellipse cx="320" cy="452" rx="24" ry="11" fill="#9ccaff" />
        <path d="M296 462c0 6 10 11 24 11s24-5 24-11" fill="none" />
      </g>

      {/* beams: base ← intelligence */}
      <Beam x={140} y1={310} y2={380} />
      <Beam x={500} y1={310} y2={380} />
      <Beam x={320} y1={400} y2={470} />

      {/* ============ MIDDLE TIER — the AI core ============ */}
      <ellipse cx="320" cy="304" rx="170" ry="84" fill={INK} opacity="0.2" filter="url(#hub-blur-s)" />
      <Slab cx={320} cy={292} hw={180} hh={90} t={18} top="url(#hub-top-2)" left="#0a3da0" right="#1456d2" />
      <g stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" fill="none">
        <path d="M176 270 392 378M212 252 428 360M248 234 464 342" />
        <path d="M464 270 248 378M428 252 212 360M392 234 176 342" />
      </g>
      {/* circuit traces running out of the core to the edges */}
      <g fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.92">
        <path d="M320 292 262 322 214 322 186 308" />
        <path d="M320 292 378 322 426 322 454 308" />
        <path d="M320 292 266 264 224 264" />
        <path d="M320 292 374 264 416 264" />
      </g>
      <g fill="#fff" stroke={INK} strokeWidth="2.4">
        <circle cx="186" cy="308" r="5" />
        <circle cx="454" cy="308" r="5" />
        <circle cx="224" cy="264" r="5" />
        <circle cx="416" cy="264" r="5" />
      </g>
      {/* the core: a glowing ring, a raised chip, and the FRX mark */}
      <ellipse className="fxhub-core" cx="320" cy="292" rx="76" ry="38" fill="url(#hub-core)" />
      <ellipse cx="320" cy="292" rx="52" ry="26" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="3" />
      <path d="M320 268l34 17v18l-34 17-34-17v-18z" fill="#eaf4ff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M286 285l34 17 34-17M320 302v18" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M320 268l34 17-34 17-34-17z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M309 280l22 10M331 280l-22 10" stroke="#045cec" strokeWidth="4.5" strokeLinecap="round" />

      {/* beams: intelligence ← interface */}
      <Beam x={198} y1={222} y2={292} />
      <Beam x={442} y1={222} y2={292} />
      <Beam x={320} y1={283} y2={353} />

      {/* ============ TOP TIER — the interface ============ */}
      <ellipse cx="320" cy="216" rx="116" ry="56" fill={INK} opacity="0.22" filter="url(#hub-blur-s)" />
      <Slab cx={320} cy={206} hw={122} hh={61} t={16} top="url(#hub-top-1)" left="#1456d2" right="#2f7bf0" />
      {/* a product window standing on the top tier */}
      <g>
        <rect x="262" y="104" width="124" height="94" rx="13" fill="#fff" stroke={INK} strokeWidth="3.5" />
        <path d="M262 117a13 13 0 0 1 13-13h98a13 13 0 0 1 13 13v13H262z" fill="#045cec" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="278" cy="117" r="3.5" fill="#fff" />
        <circle cx="290" cy="117" r="3.5" fill="#fff" fillOpacity="0.8" />
        <circle cx="302" cy="117" r="3.5" fill="#fff" fillOpacity="0.6" />
        <g strokeLinecap="round" strokeWidth="5">
          <path d="M276 146h40" stroke="#045cec" />
          <path d="M322 146h40" stroke={INK} strokeOpacity="0.28" />
          <path d="M276 160h58" stroke={INK} strokeOpacity="0.28" />
        </g>
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <rect x="342" y="162" width="11" height="22" rx="3" fill="#8fc2ff" />
          <rect x="357" y="152" width="11" height="32" rx="3" fill="#2f7bf0" />
          <rect x="372" y="142" width="11" height="42" rx="3" fill="#045cec" />
        </g>
        <path d="M276 180h54" stroke={INK} strokeOpacity="0.28" strokeWidth="5" strokeLinecap="round" />
        {/* a single accent detail that follows the active palette */}
        <circle cx="371" cy="117" r="4.5" fill="var(--fx-sub)" stroke={INK} strokeWidth="1.8" />
      </g>
    </svg>
  );
}
