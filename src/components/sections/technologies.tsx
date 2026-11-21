import type { AffiliationView, TechnologyView } from "@/lib/content/server";
import { TechMark } from "./tech-mark";
import "./technologies.css";

/**
 * Technologies we work with daily: one continuous, self-moving line of logos.
 *
 * It is pure CSS: a belt of two identical lanes slides left by exactly one lane (-50%) and loops, so there
 * is no seam, no jump and no JavaScript — and nothing is tied to the page scroll (no ScrollTrigger, no
 * pin), so scrolling is never held up. Pauses on hover/focus; with reduced motion it becomes a static,
 * wrapped grid. The list repeats enough times that each lane is wider than any screen.
 *
 * Every entry is managed in admin → Technologies; the logo is cleaned automatically (see /api/logo), and a
 * monogram is shown when there is no logo. Affiliations appear below ONLY when the owner has published some.
 */
export function Technologies({
  items,
  affiliations = [],
  heading = "Technologies we work with daily",
}: {
  items: TechnologyView[];
  affiliations?: AffiliationView[];
  heading?: string;
}) {
  if (!items.length) return null;

  // two rows, dealt alternately so both stay balanced as technologies are added
  const rowA = items.filter((_, i) => i % 2 === 0);
  const rowB = items.filter((_, i) => i % 2 === 1);

  const lane = (list: TechnologyView[], copies: number, hidden: boolean) =>
    Array.from({ length: copies }).flatMap((_, c) =>
      list.map((t) => {
        const inner = (
          <>
            <span className="fxt-plate">
              <TechMark logo={t.logo} name={t.name} />
            </span>
            <span className="fxt-text">
              <span className="fxt-name">{t.name}</span>
              {t.category ? <span className="fxt-cat">{t.category}</span> : null}
            </span>
          </>
        );
        return (
          <li key={`${c}-${t.id}`} className="fxt-item">
            {t.url && !hidden ? (
              <a href={t.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.name} (opens in a new tab)`}>
                {inner}
              </a>
            ) : (
              <div>{inner}</div>
            )}
          </li>
        );
      }),
    );

  /** One self-moving row: two identical lanes (the second is only the seamless loop). */
  const row = (list: TechnologyView[], dir: "left" | "right", label: string) => {
    if (!list.length) return null;
    // enough repeats that one lane is always wider than a wide desktop (about 8 tiles ≈ one 1920px screen)
    const copies = Math.max(1, Math.ceil(12 / list.length));
    return (
      <div className="fxt-marquee" data-dir={dir} style={{ "--fxt-n": list.length * copies } as React.CSSProperties}>
        <div className="fxt-belt">
          <ul className="fxt-lane" aria-label={label}>
            {lane(list, copies, false)}
          </ul>
          <ul className="fxt-lane fxt-lane--clone" aria-hidden="true" {...({ inert: true } as object)}>
            {lane(list, copies, true)}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <section className="fxt" id="technologies" aria-labelledby="fxt-title">
      <div className="fx-container fxt-head">
        <p className="fx-label fxt-eyebrow">Tools &amp; technologies</p>
        <h2 id="fxt-title" className="fxt-h fx-d1 fx-up" data-fx="reveal-lines">
          {heading}
        </h2>
      </div>

      <div className="fxt-rows">
        {row(rowA, "left", "Technologies, first row")}
        {row(rowB, "right", "Technologies, second row")}
      </div>

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
  );
}
