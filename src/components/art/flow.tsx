import "./flow.css";

/**
 * The FRX "workflow" illustration — the small supporting graphic on the homepage. Original artwork, pure
 * SVG (transparent, no background block), drawn in the same language as the hero's layered system: an
 * isometric platform, 3px ink outlines, the FRX blues.
 *
 * The idea is the smallest honest picture of what FRX builds — AI-assisted workflows: requests come in
 * (left), an intelligent core handles them (centre, on the platform), and a clear result comes out
 * (right). Two thin dotted lines carry the flow between them; that dash flow and a slow glow on the core
 * are the only motion (transform/opacity/dash only, off for reduced motion).
 */
const INK = "#0a0a0c";

export function FxFlow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 260" className={`fxflow ${className}`} role="presentation" focusable="false" aria-hidden="true">
      <defs>
        <radialGradient id="flow-glow" cx="210" cy="140" r="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4aa3ff" stopOpacity="0.38" />
          <stop offset="0.6" stopColor="#045cec" stopOpacity="0.1" />
          <stop offset="1" stopColor="#045cec" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flow-top" x1="70" y1="150" x2="350" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7db9ff" />
          <stop offset="1" stopColor="#1b66ec" />
        </linearGradient>
        <radialGradient id="flow-core" cx="210" cy="150" r="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#bfe0ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#4aa3ff" stopOpacity="0" />
        </radialGradient>
        <filter id="flow-blur" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* atmosphere + contact shadow */}
      <ellipse cx="210" cy="144" rx="206" ry="118" fill="url(#flow-glow)" />
      <ellipse cx="212" cy="236" rx="150" ry="13" fill={INK} opacity="0.18" filter="url(#flow-blur)" />

      {/* the platform */}
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M60 176l150 62v14L60 190z" fill="#08317f" />
        <path d="M210 238l150-62v14l-150 62z" fill="#0a3da0" />
        <path d="M210 114l150 62-150 62L60 176z" fill="url(#flow-top)" />
      </g>
      <path d="M64 175l146-60 146 60" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <g stroke="#fff" strokeOpacity="0.16" strokeWidth="1.5" fill="none">
        <path d="M120 152l150 62M165 133l150 62M255 133L105 195M300 152L150 214" />
      </g>

      {/* the two flows (dotted lines carrying work between the three parts) */}
      <g fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path className="fxflow-run" d="M104 142C128 146 142 158 172 162" strokeDasharray="1 9" />
        <path className="fxflow-run" d="M248 162C278 158 292 146 316 142" strokeDasharray="1 9" />
      </g>
      <g fill="#fff" stroke="#2f7bf0" strokeWidth="2.5">
        <circle cx="104" cy="142" r="5" />
        <circle cx="316" cy="142" r="5" />
      </g>

      {/* IN — a request card standing on the platform */}
      <g>
        <rect x="46" y="66" width="76" height="88" rx="11" fill="#fff" stroke={INK} strokeWidth="3.2" />
        <path d="M46 77a11 11 0 0 1 11-11h54a11 11 0 0 1 11 11v10H46z" fill="#045cec" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
        <circle cx="58" cy="76" r="2.8" fill="#fff" />
        <circle cx="67" cy="76" r="2.8" fill="#fff" fillOpacity="0.75" />
        <g strokeLinecap="round" strokeWidth="5">
          <path d="M58 104h34" stroke="#045cec" />
          <path d="M58 118h48" stroke={INK} strokeOpacity="0.26" />
          <path d="M58 132h40" stroke={INK} strokeOpacity="0.26" />
        </g>
        <circle cx="106" cy="104" r="4" fill="var(--fx-sub)" stroke={INK} strokeWidth="1.6" />
      </g>

      {/* CORE — the intelligent step: a raised chip on a glowing ring */}
      <ellipse className="fxflow-core" cx="210" cy="152" rx="56" ry="28" fill="url(#flow-core)" />
      <ellipse cx="210" cy="152" rx="38" ry="19" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="2.6" />
      <path d="M210 128l26 13v14l-26 13-26-13v-14z" fill="#eaf4ff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M184 141l26 13 26-13M210 154v14" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M210 128l26 13-26 13-26-13z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M201 138l18 8M219 138l-18 8" stroke="#045cec" strokeWidth="4" strokeLinecap="round" />

      {/* OUT — a result card: a clear chart */}
      <g>
        <rect x="298" y="66" width="76" height="88" rx="11" fill="#fff" stroke={INK} strokeWidth="3.2" />
        <path d="M298 77a11 11 0 0 1 11-11h54a11 11 0 0 1 11 11v10H298z" fill="#045cec" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
        <circle cx="310" cy="76" r="2.8" fill="#fff" />
        <circle cx="319" cy="76" r="2.8" fill="#fff" fillOpacity="0.75" />
        <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
          <rect x="310" y="124" width="10" height="20" rx="2.5" fill="#8fc2ff" />
          <rect x="324" y="112" width="10" height="32" rx="2.5" fill="#2f7bf0" />
          <rect x="338" y="100" width="10" height="44" rx="2.5" fill="#045cec" />
        </g>
        <path d="M356 100l7-8 7 8" fill="none" stroke="#045cec" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
