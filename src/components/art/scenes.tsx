import { INK, PAPER, type ArtProps } from "./characters";

/* ===========================================================================
   SERVICE SCENES + FLOATING UI PANELS (same house style as characters.tsx)
   =========================================================================== */

/** Shared face: two tracking eyes and a smile, centred on (cx, cy). */
function Face({ cx, cy, gap = 40, r = 11, smile = 14 }: { cx: number; cy: number; gap?: number; r?: number; smile?: number }) {
  return (
    <>
      <g className="fxa-eye" transform={`translate(${cx - gap / 2} ${cy})`}>
        <circle r={r} fill="#fff" stroke={INK} strokeWidth="4" />
        <circle className="fxa-pupil" r={r * 0.45} fill={INK} />
      </g>
      <g className="fxa-eye" transform={`translate(${cx + gap / 2} ${cy})`}>
        <circle r={r} fill="#fff" stroke={INK} strokeWidth="4" />
        <circle className="fxa-pupil" r={r * 0.45} fill={INK} />
      </g>
      <path
        d={`M${cx - smile} ${cy + r + 10}q${smile} ${smile + 2} ${smile * 2} 0`}
        fill="none"
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </>
  );
}

function Feet({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
      <rect x={x1} y={y} width="20" height="26" rx="8" fill="url(#fxa-blue-deep)" />
      <rect x={x2} y={y} width="20" height="26" rx="8" fill="url(#fxa-blue-deep)" />
      <path d={`M${x1 - 10} ${y + 26}h40a7 7 0 0 1 0 12h-36a7 7 0 0 1-4-12z`} fill={INK} />
      <path d={`M${x2 - 10} ${y + 26}h40a7 7 0 0 1 0 12h-36a7 7 0 0 1-4-12z`} fill={INK} />
    </g>
  );
}

/** MOBILE — a phone with an app screen that has a face. */
export function PhoneBuddy({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 220 270" className={className} style={style} role="img" aria-label="Illustration: a friendly mobile phone character">
      <ellipse cx="108" cy="262" rx="58" ry="7" fill={INK} opacity="0.16" />
      <Feet x1={72} x2={118} y={216} />
      <g stroke={INK} strokeWidth="5" strokeLinecap="round">
        <path d="M54 118c-18 4-24 26-12 40" fill="none" />
        <g className="fxa-wave" data-origin="160 118">
          <path d="M160 118c22-2 34-18 28-40" fill="none" />
          <circle cx="188" cy="74" r="9" fill={PAPER} />
        </g>
      </g>
      <rect x="50" y="16" width="116" height="206" rx="28" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5.5" />
      <rect x="62" y="38" width="92" height="162" rx="16" fill={PAPER} stroke={INK} strokeWidth="4.5" />
      <rect x="92" y="24" width="32" height="8" rx="4" fill={INK} />
      <Face cx={108} cy={96} gap={36} r={12} smile={12} />
      <g stroke={INK} strokeWidth="3.5">
        <rect x="72" y="154" width="22" height="22" rx="7" fill="url(#fxa-blue-lit)" />
        <rect x="98" y="154" width="22" height="22" rx="7" fill="url(#fxa-blue)" />
        <rect x="124" y="154" width="22" height="22" rx="7" fill={PAPER} />
      </g>
      <g className="fxa-ping" data-origin="156 30">
        <circle cx="156" cy="30" r="14" fill="#fff" stroke={INK} strokeWidth="4" />
        <circle cx="156" cy="30" r="6" fill="#045cec" />
      </g>
    </svg>
  );
}

/** WEB APPS & SAAS — an oversized laptop showing a dashboard. */
export function LaptopBuddy({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 320 240" className={className} style={style} role="img" aria-label="Illustration: an oversized laptop character showing a dashboard">
      <ellipse cx="160" cy="232" rx="130" ry="8" fill={INK} opacity="0.16" />
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <rect x="108" y="184" width="22" height="30" rx="8" fill="url(#fxa-blue-deep)" />
        <rect x="190" y="184" width="22" height="30" rx="8" fill="url(#fxa-blue-deep)" />
        <path d="M98 214h42a7 7 0 0 1 0 12h-38a7 7 0 0 1-4-12z" fill={INK} />
        <path d="M180 214h42a7 7 0 0 1 0 12h-38a7 7 0 0 1-4-12z" fill={INK} />
      </g>
      <g className="fxa-wave" data-origin="262 120">
        <path d="M262 120c24-2 36-20 30-44" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <circle cx="291" cy="72" r="10" fill={PAPER} stroke={INK} strokeWidth="5" />
      </g>
      <rect x="44" y="14" width="232" height="152" rx="16" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5.5" />
      <rect x="58" y="28" width="204" height="124" rx="8" fill={PAPER} stroke={INK} strokeWidth="4" />
      <g stroke={INK} strokeWidth="3">
        <rect x="66" y="38" width="38" height="104" rx="5" fill="url(#fxa-blue-lit)" />
        <rect x="112" y="38" width="64" height="30" rx="5" fill="#fff" />
        <rect x="184" y="38" width="70" height="30" rx="5" fill="#fff" />
        <rect x="112" y="76" width="142" height="66" rx="5" fill="#fff" />
      </g>
      <path d="M122 130l22-26 20 14 24-34 24 12 30-20" fill="none" stroke="#045cec" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <Face cx={144} cy={53} gap={36} r={9} smile={9} />
      <path d="M20 168h280l-14 26a14 14 0 0 1-12 7H46a14 14 0 0 1-12-7z" fill={PAPER} stroke={INK} strokeWidth="5.5" strokeLinejoin="round" />
      <rect x="132" y="170" width="56" height="8" rx="4" fill={INK} opacity="0.35" />
    </svg>
  );
}

/** AI ASSISTANTS — a speech bubble that talks back. */
export function ChatBuddy({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 260 240" className={className} style={style} role="img" aria-label="Illustration: a friendly chat bubble assistant">
      <ellipse cx="116" cy="232" rx="68" ry="7" fill={INK} opacity="0.16" />
      <Feet x1={78} x2={124} y={170} />
      <path d="M44 146 L28 186 L84 156 Z" fill="url(#fxa-blue-deep)" stroke={INK} strokeWidth="5.5" strokeLinejoin="round" />
      <rect x="22" y="14" width="196" height="140" rx="42" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5.5" />
      <Face cx={120} cy={70} gap={56} r={14} smile={16} />
      <path d="M44 38c6-12 16-18 30-18" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <g className="fxa-wave" data-origin="204 120">
        <rect x="170" y="112" width="76" height="52" rx="24" fill={PAPER} stroke={INK} strokeWidth="5" />
        <circle cx="190" cy="138" r="5" fill={INK} />
        <circle cx="208" cy="138" r="5" fill="#045cec" />
        <circle cx="226" cy="138" r="5" fill={INK} />
      </g>
    </svg>
  );
}

/** DATA & ANALYTICS — bars that grew a face. */
export function ChartBuddy({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 280 240" className={className} style={style} role="img" aria-label="Illustration: a bar chart character with a rising trend line">
      <ellipse cx="140" cy="230" rx="112" ry="8" fill={INK} opacity="0.16" />
      <g stroke={INK} strokeWidth="5.5" strokeLinejoin="round">
        <rect x="26" y="150" width="62" height="70" rx="14" fill="url(#fxa-blue-lit)" />
        <rect x="108" y="100" width="62" height="120" rx="14" fill="url(#fxa-blue)" />
        <rect x="190" y="34" width="66" height="186" rx="14" fill="url(#fxa-blue-deep)" />
      </g>
      <Face cx={223} cy={86} gap={34} r={10} smile={9} />
      <g className="fxa-eye" transform="translate(139 138)">
        <circle r="8" fill="#fff" stroke={INK} strokeWidth="3.5" />
        <circle className="fxa-pupil" r="3.4" fill={INK} />
      </g>
      <g className="fxa-arrow" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M44 126l62-42 56 14 58-50" fill="none" stroke="#045cec" strokeWidth="8" />
        <path d="M206 34l30-4-8 30z" fill="url(#fxa-blue-lit)" />
      </g>
    </svg>
  );
}

/** BUSINESS SYSTEMS — a workflow board with a card being carried. */
export function BoardBuddy({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 300 240" className={className} style={style} role="img" aria-label="Illustration: a workflow board with a card character">
      <ellipse cx="150" cy="232" rx="118" ry="8" fill={INK} opacity="0.16" />
      <rect x="20" y="22" width="260" height="190" rx="22" fill={PAPER} stroke={INK} strokeWidth="5.5" />
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <rect x="34" y="62" width="70" height="136" rx="12" fill="url(#fxa-blue-lit)" opacity="0.5" />
        <rect x="116" y="62" width="70" height="136" rx="12" fill="url(#fxa-blue-lit)" opacity="0.5" />
        <rect x="198" y="62" width="70" height="136" rx="12" fill="url(#fxa-blue-lit)" opacity="0.5" />
        <rect x="42" y="74" width="54" height="30" rx="8" fill="#fff" />
        <rect x="42" y="112" width="54" height="30" rx="8" fill="#fff" />
        <rect x="124" y="74" width="54" height="30" rx="8" fill="#fff" />
        <rect x="206" y="74" width="54" height="30" rx="8" fill="#fff" />
        <rect x="206" y="112" width="54" height="30" rx="8" fill="#fff" />
      </g>
      <rect x="34" y="34" width="46" height="12" rx="6" fill={INK} />
      <rect x="116" y="34" width="46" height="12" rx="6" fill="url(#fxa-blue)" />
      <rect x="198" y="34" width="46" height="12" rx="6" fill="url(#fxa-blue-deep)" />
      <g className="fxa-wave" data-origin="150 110">
        <rect x="104" y="108" width="82" height="62" rx="14" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5.5" />
        <Face cx={145} cy={134} gap={34} r={9} smile={9} />
      </g>
    </svg>
  );
}

/** Floating UI panels for the hero — objects, not characters. */
export function PanelCode({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 200 128" className={className} style={style} aria-hidden="true">
      <rect x="4" y="4" width="192" height="120" rx="14" fill={PAPER} stroke={INK} strokeWidth="5" />
      <path d="M4 18a14 14 0 0 1 14-14h164a14 14 0 0 1 14 14v14H4z" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <circle cx="22" cy="19" r="4" fill="#fff" />
      <circle cx="36" cy="19" r="4" fill="#fff" opacity="0.7" />
      <g strokeLinecap="round" strokeWidth="6">
        <path d="M20 54h54" stroke="#045cec" />
        <path d="M82 54h38" stroke={INK} opacity="0.5" />
        <path d="M34 72h72" stroke={INK} opacity="0.5" />
        <path d="M34 90h40" stroke="#008cff" />
        <path d="M82 90h60" stroke={INK} opacity="0.5" />
        <path d="M20 108h34" stroke={INK} opacity="0.5" />
      </g>
    </svg>
  );
}

export function PanelChart({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 168 128" className={className} style={style} aria-hidden="true">
      <rect x="4" y="4" width="160" height="120" rx="14" fill={PAPER} stroke={INK} strokeWidth="5" />
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <rect x="22" y="72" width="22" height="34" rx="5" fill="url(#fxa-blue-lit)" />
        <rect x="56" y="52" width="22" height="54" rx="5" fill="url(#fxa-blue)" />
        <rect x="90" y="62" width="22" height="44" rx="5" fill="url(#fxa-blue-lit)" />
        <rect x="124" y="32" width="22" height="74" rx="5" fill="url(#fxa-blue-deep)" />
      </g>
      <path d="M22 44l36-14 32 8 56-22" fill="none" stroke="#045cec" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PanelToggles({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 160 112" className={className} style={style} aria-hidden="true">
      <rect x="4" y="4" width="152" height="104" rx="14" fill={PAPER} stroke={INK} strokeWidth="5" />
      {[30, 56, 82].map((y, i) => (
        <g key={y}>
          <rect x="20" y={y - 5} width="46" height="10" rx="5" fill={INK} opacity="0.35" />
          <rect x="102" y={y - 11} width="38" height="22" rx="11" fill={i === 1 ? PAPER : "url(#fxa-blue)"} stroke={INK} strokeWidth="4" />
          <circle cx={i === 1 ? 113 : 129} cy={y} r="7" fill="#fff" stroke={INK} strokeWidth="3.5" />
        </g>
      ))}
    </svg>
  );
}
