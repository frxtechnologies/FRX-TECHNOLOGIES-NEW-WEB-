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

/**
 * AI AUTOMATION & INTEGRATION — an input → agent → output pipeline.
 * Three everyday business apps (inbox, CRM table, chat) feed a chip-bodied AI agent through pipes; the agent
 * (face, antenna, a slowly turning gear) hands finished, checked-off tasks out the other side. Same house
 * style as the other service scenes: ink outlines, the shared blue gradients, tone-aware ink/paper, a face.
 * Motion is minimal: data dots travel along the pipes (dash offset), the gear turns, the eyes track.
 */
export function AutomationBuddy({ className, style }: ArtProps) {
  const pipe = (d: string, k: string) => (
    <g key={k} fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth="11" />
      <path d={d} stroke="url(#fxa-blue-lit)" strokeWidth="6" />
      <path d={d} className="fxa-flow" stroke="#fff" strokeWidth="3" />
    </g>
  );
  return (
    <svg viewBox="0 0 340 260" className={className} style={style} role="img" aria-label="Illustration: apps feeding an AI agent that hands back finished tasks">
      <ellipse cx="170" cy="250" rx="140" ry="8" fill={INK} opacity="0.16" />

      {/* pipes first, so the tiles and the agent sit on top of their ends */}
      {pipe("M74 66C96 66 98 104 124 108", "i1")}
      {pipe("M74 130C100 130 104 128 124 128", "i2")}
      {pipe("M74 194C96 194 98 152 124 148", "i3")}
      {pipe("M216 108C242 104 242 66 268 66", "o1")}
      {pipe("M216 128C240 128 244 130 268 130", "o2")}
      {pipe("M216 148C242 152 244 194 268 194", "o3")}

      {/* INPUT APPS */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <rect x="16" y="38" width="58" height="56" rx="14" fill={PAPER} />
        <path d="M28 56h34v22H28z" fill="url(#fxa-blue-lit)" />
        <path d="M28 57l17 13 17-13" fill="none" />
        <rect x="16" y="102" width="58" height="56" rx="14" fill={PAPER} />
        <path d="M28 114h34v32H28z" fill="#fff" strokeWidth="3.5" />
        <path d="M28 125h34M28 136h34M45 114v32" fill="none" strokeWidth="3.5" />
        <rect x="16" y="166" width="58" height="56" rx="14" fill={PAPER} />
        <path d="M27 180h36v22H49l-9 9v-9h-13z" fill="url(#fxa-blue)" />
        <path d="M35 190h20" fill="none" stroke="#fff" strokeWidth="3.5" />
      </g>

      {/* THE AGENT: a chip body with pins, an antenna, a face and a gear */}
      <g className="fxa-bob">
        <g stroke={INK} strokeWidth="4" strokeLinecap="round">
          {[86, 108, 130, 152, 174].map((y) => (
            <path key={`l${y}`} d={`M114 ${y}h-9M226 ${y}h9`} />
          ))}
          {[142, 170, 198].map((x) => (
            <path key={`t${x}`} d={`M${x} 62v-8M${x} 198v8`} />
          ))}
        </g>
        <path d="M170 56V36" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <circle className="fxa-ping" data-origin="170 32" cx="170" cy="32" r="8" fill="url(#fxa-blue-lit)" stroke={INK} strokeWidth="4.5" />
        <rect x="114" y="62" width="112" height="136" rx="24" fill="url(#fxa-blue)" stroke={INK} strokeWidth="5.5" />
        <rect x="126" y="76" width="88" height="68" rx="16" fill={PAPER} stroke={INK} strokeWidth="4.5" />
        <Face cx={170} cy={104} gap={36} r={11} smile={11} />
        <g stroke={INK} strokeWidth="3.5" strokeLinecap="round">
          <rect x="128" y="156" width="40" height="26" rx="8" fill="#fff" />
          <path d="M136 169h24" fill="none" stroke="#045cec" strokeWidth="5" />
          <circle cx="198" cy="169" r="14" fill="url(#fxa-blue-deep)" />
        </g>
        <g className="fxa-cog" data-origin="198 169">
          <path d="M198 160v18M189 169h18M191.6 162.6l12.800 12.800M204.4 162.6l-12.800 12.800" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      </g>

      {/* OUTPUT: finished tasks */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <rect x="266" y="38" width="58" height="56" rx="14" fill={PAPER} />
        <circle cx="284" cy="56" r="9" fill="url(#fxa-blue)" strokeWidth="3.5" />
        <path d="M279.500 56l3.500 3.500 6-7" fill="none" stroke="#fff" strokeWidth="3.5" />
        <path d="M298 52h14M298 62h10M278 78h34" fill="none" strokeWidth="3.5" opacity="0.55" />
        <rect x="266" y="102" width="58" height="56" rx="14" fill={PAPER} />
        <circle cx="284" cy="120" r="9" fill="url(#fxa-blue)" strokeWidth="3.5" />
        <path d="M279.500 120l3.500 3.500 6-7" fill="none" stroke="#fff" strokeWidth="3.5" />
        <path d="M298 116h14M298 126h10M278 142h34" fill="none" strokeWidth="3.5" opacity="0.55" />
        <rect x="266" y="166" width="58" height="56" rx="14" fill={PAPER} />
        <path d="M278 208V196M290 208V186M302 208V178M314 208V190" fill="none" stroke="url(#fxa-blue)" strokeWidth="7" />
        <path d="M278 186l12-9 12-4 12-8" fill="none" strokeWidth="3.5" />
      </g>
    </svg>
  );
}
