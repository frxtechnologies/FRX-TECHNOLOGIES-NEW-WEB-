"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { TECH_CATEGORIES } from "@/lib/technologies";
import { RevealLines } from "@/components/ui/reveal";

/**
 * The technology scene.
 *
 * Not a thirty-cell logo grid. The heading pins while the categories travel
 * past as horizontal columns, each a controlled typographic set that lights up
 * blue on hover.
 *
 * Third-party logos are deliberately not shipped: each mark carries its own
 * usage terms, and a consistent type treatment reads better than thirty PNGs at
 * thirty different weights anyway.
 */
export function TechnologyScene() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useMotion(
    {
      desktop: () => {
        const section = root.current;
        const rail = track.current;
        if (!section || !rail) return;

        const distance = () => Math.max(0, rail.scrollWidth - rail.clientWidth);

        gsap.to(rail, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      },
    },
    root,
  );

  return (
    <section ref={root} className="tech relative overflow-clip bg-[var(--bg-sunken)]">
      <div className="tech-inner">
        <div className="container flex flex-col gap-6 pb-[clamp(2.5rem,5vw,4rem)]">
          <p className="t-eyebrow">Stack</p>
          <RevealLines
            as="h2"
            className="t-h2 max-w-[16ch]"
            lines={[
              "Tools change.",
              <span key="eng">
                Good <span className="accent">engineering</span> doesn&apos;t.
              </span>,
            ]}
          />
          <p className="t-lead max-w-[52ch]">
            The stack is chosen per project. These are the technologies FRX works across
            — not a list of everything that exists.
          </p>
        </div>

        <div ref={track} className="tech-track">
          {TECH_CATEGORIES.map((cat) => (
            <div key={cat.key} className="tech-column">
              <div className="tech-column-head">
                <h3 className="tech-column-label">{cat.label}</h3>
                <p className="tech-column-note">{cat.note}</p>
                <span className="signal-rule mt-4" />
              </div>
              <ul className="tech-items">
                {cat.items.map((item) => (
                  <li key={item} className="tech-item">
                    <span className="tech-item-dot" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
