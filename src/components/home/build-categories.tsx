"use client";

import { BUILD_CATEGORIES } from "@/lib/services";
import { Reveal, RevealLines } from "@/components/ui/reveal";

/**
 * Systems FRX can build, described as categories.
 *
 * Deliberately not a portfolio: no client names, no invented case studies, no
 * fabricated dashboards. This says what FRX is capable of without implying work
 * that was never done. A real `/work` route can be added later without touching
 * this component.
 */
export function BuildCategories() {
  return (
    <section className="section">
      <div className="container">
        <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6">
          <p className="t-eyebrow">Systems we can create</p>
          <RevealLines
            as="h2"
            className="t-h2 max-w-[20ch]"
            lines={["The shapes this", "work usually takes."]}
          />
        </div>

        <ul className="build-grid">
          {BUILD_CATEGORIES.map((cat, i) => (
            <Reveal as="li" key={cat.title} className="build-cell" delay={i * 0.04}>
              <span className="t-index build-cell-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="build-cell-title">{cat.title}</h3>
              <p className="build-cell-body">{cat.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
