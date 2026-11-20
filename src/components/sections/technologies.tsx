import type { AffiliationView, TechnologyView } from "@/lib/content/server";

/** Short display marks for the typographic tiles. Real logos (admin upload) replace them. */
const MARK: Record<string, string> = {
  "Next.js": "N",
  "Node.js": "No",
  "Make.com": "Mk",
  n8n: "n8n",
  TypeScript: "TS",
  JavaScript: "JS",
  GSAP: "GS",
  OpenAI: "AI",
  "Tailwind CSS": "TW",
  PostgreSQL: "PG",
  MongoDB: "Mg",
  Supabase: "Sb",
  Firebase: "Fb",
  WordPress: "WP",
  Shopify: "Sh",
  Flutter: "Fl",
  Python: "Py",
  Gemini: "Gm",
  React: "Re",
};
const mark = (name: string) =>
  MARK[name] ?? name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).replace(/^./, (c) => c.toUpperCase());

const TONES = ["paper", "ink", "tint", "blue"] as const;

/**
 * Tools & technologies — a two-row wall of large tiles that travels sideways as
 * the page scrolls (pinned, desktop), and is a native swipe rail on phones and
 * tablets. Driven by the shared `horizontal` convention (design-system/motion).
 *
 * Every entry is editable in admin → Technologies; uploading a logo replaces the
 * typographic mark. A genuine affiliations strip appears below, but only when
 * the owner has published at least one — nothing is shown by default.
 */
export function Technologies({
  items,
  affiliations = [],
  heading = "Tools & technologies",
}: {
  items: TechnologyView[];
  affiliations?: AffiliationView[];
  heading?: string;
}) {
  if (!items.length) return null;
  // The wrapper is React-owned and never touched by ScrollTrigger: pinning moves the
  // <section> into a .pin-spacer INSIDE this wrapper, so React can still remove the
  // wrapper cleanly when the route changes (otherwise: removeChild NotFoundError).
  return (
    <div className="fxt-host">
    <section className="fxt" id="technologies" data-fx="horizontal" aria-labelledby="fxt-title">
      <div className="fx-container fxt-head">
        <h2 id="fxt-title" className="fxt-h fx-d1 fx-up" data-fx="reveal-lines">
          {heading}
        </h2>
        <p className="fx-lead fxt-lead" data-fx="fade-up">
          What we build with. Chosen for each project — not by habit.
        </p>
      </div>

      <ul className="fxt-track" data-fx-track aria-label="Technologies">
        {items.map((t, i) => {
          const tone = TONES[i % TONES.length];
          const inner = (
            <>
              <span className="fxt-mark" aria-hidden="true">
                {t.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.logo} alt="" loading="lazy" />
                ) : (
                  <span className="fxt-mono">{mark(t.name)}</span>
                )}
              </span>
              <span className="fxt-name fx-h3">{t.name}</span>
              {t.category ? <span className="fxt-cat fx-label">{t.category}</span> : null}
            </>
          );
          return (
            <li key={t.id} className="fxt-tile" data-tone={tone}>
              {t.url ? (
                <a href={t.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.name} (opens in a new tab)`}>
                  {inner}
                </a>
              ) : (
                <div>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      {affiliations.length > 0 && (
        <div className="fx-container fxt-aff">
          <p className="fx-label">Affiliations</p>
          <ul>
            {affiliations.map((a) => (
              <li key={a.id}>
                {a.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.logo} alt={a.name} loading="lazy" />
                ) : (
                  <span className="fx-h4">{a.name}</span>
                )}
                {a.description ? <span className="fx-small fx-muted">{a.description}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
    </div>
  );
}
