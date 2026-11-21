/**
 * "The FRX systems hub" — the large hero illustration. Original artwork, pure SVG (no raster, so no
 * rectangular background and it stays sharp at any size).
 *
 * What it says: custom software, AI automation and connected business systems. A lit isometric platform
 * carries a glowing core cube marked with the FRX "X"; around it float a code window, an AI chat bubble
 * with a bot avatar, a live dashboard, a workflow, a database and a turning gear, joined to the core by
 * lines along which little data packets travel.
 *
 * Depth comes from three things: stacked slabs with a lit top and two shaded faces, a soft glow and
 * contact shadow under the platform, and each floating piece casting its own offset "sticker" shadow in
 * the palette's secondary accent (so it follows every theme). Motion is transform/dash-offset only, lives
 * in fx-hub.css and is switched off for reduced-motion visitors.
 */
const INK = "#0a0a0c";

export function FxHub({ className = "" }: { className?: string }) {
  const sw = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;
  return (
    <svg viewBox="0 0 640 520" className={`fxhub ${className}`} role="presentation" focusable="false" aria-hidden="true">
      <defs>
        <radialGradient id="hub-glow" cx="320" cy="300" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4aa3ff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#045cec" stopOpacity="0.18" />
          <stop offset="1" stopColor="#045cec" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hub-top" x1="70" y1="225" x2="570" y2="475" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#58a6ff" />
          <stop offset="0.55" stopColor="#1b72f5" />
          <stop offset="1" stopColor="#0a4fd0" />
        </linearGradient>
        <linearGradient id="hub-core-top" x1="258" y1="238" x2="382" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfe3ff" />
        </linearGradient>
        <linearGradient id="hub-core-l" x1="258" y1="269" x2="320" y2="362" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e9f2ff" />
          <stop offset="1" stopColor="#9cc4ff" />
        </linearGradient>
        <linearGradient id="hub-core-r" x1="320" y1="300" x2="382" y2="331" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f7bf0" />
        </linearGradient>
        <filter id="hub-blur" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="hub-blur-s" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* atmosphere + contact shadow */}
      <ellipse cx="320" cy="300" rx="310" ry="250" fill="url(#hub-glow)" />
      <ellipse cx="322" cy="500" rx="236" ry="26" fill={INK} opacity="0.2" filter="url(#hub-blur)" />

      {/* the platform: two shaded side faces and a lit top */}
      <g className="fxhub-platform">
        <path d="M70 350 320 475v34L70 384z" fill="#0338a3" {...sw} />
        <path d="M320 475 570 350v34L320 509z" fill="#0a4fd0" {...sw} />
        <path d="M320 225 570 350 320 475 70 350z" fill="url(#hub-top)" {...sw} />
        {/* faint isometric grid on the lit face */}
        <g stroke="#fff" strokeOpacity="0.2" strokeWidth="1.5" fill="none">
          <path d="M120 325 370 450M170 300 420 425M220 275 470 400M270 250 520 375" />
          <path d="M370 250 120 375M420 275 170 400M470 300 220 425M520 325 270 450" />
        </g>
        {/* a specular edge along the top-left rim */}
        <path d="M74 346 318 228" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* circuit traces running out of the core */}
        <g fill="none" stroke="var(--fx-sub)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M320 350 260 380 200 380 160 360" opacity="0.9" />
          <path d="M320 350 380 380 440 380 480 360" opacity="0.9" />
          <path d="M320 350 360 330 430 330" opacity="0.9" />
          <path d="M320 350 280 330 220 330" opacity="0.9" />
        </g>
        <g fill="var(--fx-sub)" stroke={INK} strokeWidth="2.4">
          <circle cx="160" cy="360" r="5.5" />
          <circle cx="480" cy="360" r="5.5" />
          <circle cx="430" cy="330" r="5.5" />
          <circle cx="220" cy="330" r="5.5" />
        </g>
      </g>

      {/* glow where the core sits on the platform */}
      <ellipse cx="320" cy="352" rx="78" ry="38" fill="var(--fx-sub)" opacity="0.5" filter="url(#hub-blur-s)" />

      {/* connectors: thin line + travelling packets */}
      <g fill="none" strokeLinecap="round">
        {[
          "M125 172C170 200 220 240 262 262",
          "M470 150C440 190 405 230 378 262",
          "M470 254C440 272 410 286 386 294",
          "M158 300C195 300 226 300 260 300",
        ].map((d) => (
          <g key={d}>
            <path d={d} stroke={INK} strokeOpacity="0.28" strokeWidth="2" />
            <path d={d} className="fxhub-flow" stroke="var(--fx-sub)" strokeWidth="5.5" />
          </g>
        ))}
      </g>

      {/* the core cube */}
      <g className="fxhub-core fxhub-float fxhub-float--core">
        <path d="M258 269 320 300v62l-62-31z" fill="url(#hub-core-l)" {...sw} />
        <path d="M320 300 382 269v62l-62 31z" fill="url(#hub-core-r)" {...sw} />
        <path d="M320 238 382 269 320 300 258 269z" fill="url(#hub-core-top)" {...sw} />
        {/* the FRX "X" on the left face */}
        <g transform="matrix(1 .5 0 1 258 269)" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round">
          <path d="M16 16 46 46M46 16 16 46" />
        </g>
        {/* three interface lines on the right face */}
        <g transform="matrix(1 -.5 0 1 320 300)" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.9">
          <path d="M12 18h38M12 31h26M12 44h34" />
        </g>
        {/* the power dot on the top face */}
        <ellipse cx="320" cy="269" rx="15" ry="7.5" fill="var(--fx-sub)" stroke={INK} strokeWidth="2.6" />
      </g>

      {/* ---- floating pieces ---- */}
      {/* code window */}
      <g className="fxhub-float fxhub-float--a" transform="translate(52 100)">
        <rect x="6" y="7" width="140" height="96" rx="13" fill="var(--fx-sub)" stroke={INK} strokeWidth="3" />
        <rect x="0" y="0" width="140" height="96" rx="13" fill="#fff" {...sw} />
        <path d="M0 26h140" stroke={INK} strokeWidth="3" />
        <path d="M0 13Q0 0 13 0h114q13 0 13 13v13H0z" fill="#045cec" />
        <path d="M0 26h140" stroke={INK} strokeWidth="3" />
        <circle cx="16" cy="13" r="4" fill="#fff" />
        <circle cx="30" cy="13" r="4" fill="#fff" />
        <circle cx="44" cy="13" r="4" fill="#fff" />
        <g strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M16 44h34" stroke="#045cec" />
          <path d="M58 44h40" stroke={INK} strokeOpacity="0.3" />
          <path d="M28 59h46" stroke={INK} strokeOpacity="0.3" />
          <path d="M82 59h30" stroke="#045cec" />
          <path d="M16 74h24" stroke={INK} strokeOpacity="0.3" />
          <path d="M48 74h44" stroke="var(--fx-sub)" />
        </g>
      </g>

      {/* AI chat bubble with a bot avatar */}
      <g className="fxhub-float fxhub-float--b" transform="translate(432 54)">
        <path d="M8 9h150a22 22 0 0 1 22 22v36a22 22 0 0 1-22 22H62l-26 22V89H8A22 22 0 0 1-14 67V31A22 22 0 0 1 8 9z" fill="var(--fx-sub)" stroke={INK} strokeWidth="3" transform="translate(8 8)" />
        <path d="M8 0h150a22 22 0 0 1 22 22v36a22 22 0 0 1-22 22H62L36 102V80H8A22 22 0 0 1-14 58V22A22 22 0 0 1 8 0z" fill="#fff" {...sw} transform="translate(0 0)" />
        <circle cx="26" cy="38" r="17" fill="#045cec" {...sw} />
        <circle cx="20" cy="36" r="3.6" fill="#fff" />
        <circle cx="32" cy="36" r="3.6" fill="#fff" />
        <path d="M20 44q6 4 12 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <g className="fxhub-dots" fill="#045cec">
          <circle cx="76" cy="38" r="6" />
          <circle cx="98" cy="38" r="6" />
          <circle cx="120" cy="38" r="6" />
        </g>
      </g>

      {/* live dashboard */}
      <g className="fxhub-float fxhub-float--c" transform="translate(470 196)">
        <rect x="6" y="7" width="120" height="92" rx="13" fill="var(--fx-sub)" stroke={INK} strokeWidth="3" />
        <rect x="0" y="0" width="120" height="92" rx="13" fill="#fff" {...sw} />
        <g {...sw} strokeWidth="2.6">
          <rect className="fxhub-bar" x="18" y="52" width="18" height="28" rx="3" fill="#8fb9ff" />
          <rect className="fxhub-bar fxhub-bar--2" x="44" y="38" width="18" height="42" rx="3" fill="#2f7bf0" />
          <rect className="fxhub-bar fxhub-bar--3" x="70" y="24" width="18" height="56" rx="3" fill="#045cec" />
        </g>
        <path d="M16 36 48 22l26-10 30-5" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="104" cy="7" r="5" fill="var(--fx-sub)" stroke={INK} strokeWidth="2.4" />
      </g>

      {/* workflow */}
      <g className="fxhub-float fxhub-float--d" transform="translate(20 258)">
        <path d="M30 42h44M104 42h40" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="1 9" fill="none" className="fxhub-flow" />
        <circle cx="18" cy="42" r="17" fill="#fff" {...sw} />
        <path d="M11 42h14M19 35v14" stroke="#045cec" strokeWidth="4" strokeLinecap="round" />
        <rect x="76" y="24" width="36" height="36" rx="9" fill="#045cec" {...sw} />
        <path d="M86 42h16M94 34v16" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity="0" />
        <path d="M86 43l6 6 11-13" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="146" cy="42" r="17" fill="var(--fx-sub)" {...sw} />
        <path d="M139 42h14M146 35v14" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* database, standing on the platform */}
      <g className="fxhub-float fxhub-float--e" transform="translate(448 322)">
        <ellipse cx="30" cy="62" rx="30" ry="9" fill={INK} opacity="0.22" filter="url(#hub-blur-s)" />
        <path d="M0 14v38c0 7.5 13.4 13.5 30 13.5S60 59.500 60 52V14" fill="#2f7bf0" {...sw} />
        <path d="M0 33c0 7.500 13.400 13.500 30 13.500S60 40.500 60 33" fill="none" stroke={INK} strokeWidth="3" />
        <ellipse cx="30" cy="14" rx="30" ry="12" fill="#8fb9ff" {...sw} />
        <ellipse cx="22" cy="12" rx="9" ry="3.5" fill="#fff" opacity="0.7" />
      </g>

      {/* the turning gear */}
      <g transform="translate(120 360)">
        <ellipse cx="0" cy="26" rx="36" ry="9" fill={INK} opacity="0.22" filter="url(#hub-blur-s)" />
        <g className="fxhub-gear">
          <path
            d="M-8-34h16l3 9a26 26 0 0 1 8 4.500l9-3 8 14-7 6a26 26 0 0 1 0 9.200l7 6-8 14-9-3a26 26 0 0 1-8 4.600l-3 9h-16l-3-9a26 26 0 0 1-8-4.600l-9 3-8-14 7-6a26 26 0 0 1 0-9.200l-7-6 8-14 9 3a26 26 0 0 1 8-4.500z"
            transform="translate(0 -2) scale(.9)"
            fill="var(--fx-sub)"
            {...sw}
          />
          <circle cx="0" cy="-2" r="10" fill="#fff" {...sw} />
        </g>
      </g>
    </svg>
  );
}
