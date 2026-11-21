import type { ServiceSlug } from "@/lib/services";
import { ServiceArtView } from "@/components/art/registry";
import type { ServiceArt } from "@/lib/services";

type Glyph = "code" | "bolt" | "check" | "chat" | "chart" | "lock" | "cursor" | "layers" | "bell" | "db" | "flow" | "phone";

/** Floating interface chips per service. Generic UI labels only — never metrics or claims. */
const CHIPS: Record<ServiceSlug, { label: string; glyph: Glyph; x: number; y: number }[]> = {
  "software-development": [
    { label: "API", glyph: "code", x: 4, y: 12 },
    { label: "Auth & roles", glyph: "lock", x: 62, y: 6 },
    { label: "Database", glyph: "db", x: 58, y: 78 },
  ],
  "ai-automation": [
    { label: "Trigger", glyph: "bolt", x: 2, y: 3 },
    { label: "Workflow", glyph: "flow", x: 62, y: 3 },
    { label: "Done", glyph: "check", x: 50, y: 86 },
  ],
  "web-development": [
    { label: "Responsive", glyph: "layers", x: 2, y: 14 },
    { label: "SEO-ready", glyph: "check", x: 66, y: 8 },
    { label: "</>", glyph: "code", x: 56, y: 80 },
  ],
  "mobile-app-development": [
    { label: "Push", glyph: "bell", x: 2, y: 20 },
    { label: "iOS + Android", glyph: "phone", x: 60, y: 8 },
    { label: "Offline", glyph: "bolt", x: 62, y: 78 },
  ],
  "web-applications-saas": [
    { label: "Dashboard", glyph: "chart", x: 2, y: 10 },
    { label: "Teams", glyph: "layers", x: 64, y: 10 },
    { label: "Accounts", glyph: "lock", x: 52, y: 80 },
  ],
  "business-systems-crm": [
    { label: "Pipeline", glyph: "flow", x: 2, y: 12 },
    { label: "Contacts", glyph: "layers", x: 64, y: 6 },
    { label: "Reports", glyph: "chart", x: 56, y: 80 },
  ],
  "ai-assistants-chatbots": [
    { label: "Ask anything", glyph: "chat", x: 2, y: 14 },
    { label: "Hand-off", glyph: "flow", x: 62, y: 8 },
    { label: "Your content", glyph: "db", x: 54, y: 80 },
  ],
  "ui-ux": [
    { label: "Wireframe", glyph: "layers", x: 2, y: 12 },
    { label: "Prototype", glyph: "cursor", x: 62, y: 8 },
    { label: "Components", glyph: "code", x: 56, y: 80 },
  ],
  "data-analytics-bi": [
    { label: "Dashboard", glyph: "chart", x: 2, y: 12 },
    { label: "Pipeline", glyph: "flow", x: 62, y: 8 },
    { label: "KPIs", glyph: "check", x: 56, y: 80 },
  ],
};

function GlyphIcon({ k }: { k: Glyph }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {k === "code" && <path {...p} d="M8 7 3 12l5 5M16 7l5 5-5 5M14 5l-4 14" />}
      {k === "bolt" && <path {...p} d="M13 3 5 14h6l-1 7 8-11h-6z" />}
      {k === "check" && <path {...p} d="m5 12 5 5 9-10" />}
      {k === "chat" && <path {...p} d="M4 6h16v10H9l-5 4z" />}
      {k === "chart" && <path {...p} d="M5 20V10M12 20V4M19 20v-8" />}
      {k === "lock" && <path {...p} d="M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3" />}
      {k === "cursor" && <path {...p} d="M6 4v15l4-4 3 6 3-1-3-6h6z" />}
      {k === "layers" && <path {...p} d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5" />}
      {k === "bell" && <path {...p} d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" />}
      {k === "db" && <path {...p} d="M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />}
      {k === "flow" && <path {...p} d="M5 5h5v5H5zM14 14h5v5h-5zM10 7.5h4a3 3 0 0 1 3 3V14" />}
      {k === "phone" && <path {...p} d="M8 3h8v18H8zM11 18h2" />}
    </svg>
  );
}

/**
 * One service's scene, built from INDEPENDENT layers so each can be animated and
 * clipped on its own: `.fxsp-l--bg` (backdrop shapes), `.fxsp-l--art` (the character
 * or the admin-uploaded image) and `.fxsp-l--chip` (floating interface labels).
 * The whole scene lives in its own clipped panel, so nothing in it can ever reach
 * the copy beside it.
 */
export function ServiceScene({ slug, art, artUrl }: { slug: ServiceSlug; art: ServiceArt; artUrl?: string | null }) {
  return (
    <div className="fxsp-scene-in" aria-hidden="true">
      <span className="fxsp-l fxsp-l--bg fxsp-bg-a" data-depth="0.4" />
      <span className="fxsp-l fxsp-l--bg fxsp-bg-b" data-depth="0.7" />
      <span className="fxsp-l fxsp-l--bg fxsp-bg-grid" data-depth="0.2" />
      <span className="fxsp-l fxsp-l--art" data-depth="1.2">
        {artUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artUrl} alt="" className="fxsp-img fxa-bob" loading="lazy" />
        ) : (
          <ServiceArtView art={art} className="fxsp-art fxa-bob" />
        )}
      </span>
      {CHIPS[slug].map((c, i) => (
        <span key={c.label} className="fxsp-l fxsp-l--chip" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
          {/* the idle bob is on the inner element so it never fights the entrance tween on the layer */}
          <span className="fxsp-chip fxa-bob" style={{ animationDelay: `${i * 0.3}s` }}>
            <span className="fxsp-chip-ic">
              <GlyphIcon k={c.glyph} />
            </span>
            {c.label}
          </span>
        </span>
      ))}
    </div>
  );
}
