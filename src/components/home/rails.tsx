"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";

type Rail = {
  items: string[];
  angle: number;
  direction: 1 | -1;
  speed: number;
  outline?: boolean;
};

const RAILS: Rail[] = [
  {
    items: ["Build smarter", "Launch faster", "Grow further"],
    angle: -2.6,
    direction: -1,
    speed: 34,
  },
  {
    items: ["AI", "Software", "Automation", "Digital experiences"],
    angle: 2.2,
    direction: 1,
    speed: 44,
    outline: true,
  },
  {
    items: ["From idea to intelligent product", "Less friction, more growth"],
    angle: -1.4,
    direction: -1,
    speed: 52,
  },
];

/**
 * Typographic rails crossing the viewport at shallow angles.
 *
 * The failure mode this is built against: rails that overlap into mush, get
 * clipped mid-word, or push a horizontal scrollbar onto the document. The
 * defences are structural rather than cosmetic —
 *
 *  · the scene clips its own overflow, and the track is over-wide by design
 *  · each track holds two identical copies and translates by exactly -50%, so
 *    the loop is seamless at any width without measuring anything
 *  · rails are spaced by their own line height, so angling them cannot make
 *    them collide
 *  · rotation happens on a wrapper wider than the viewport, so the corners a
 *    tilt exposes are already covered
 *
 * Mobile drops to one rail with no angle: three tilted rails on a 390px screen
 * is noise, not motion.
 */
export function Rails() {
  const root = useRef<HTMLDivElement>(null);

  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el) return;

        el.querySelectorAll<HTMLElement>(".rail-track").forEach((track) => {
          const dir = Number(track.dataset.dir ?? 1);
          const speed = Number(track.dataset.speed ?? 40);

          // -50% is exactly one copy of the duplicated content, so the reset is
          // invisible regardless of viewport width or font metrics.
          gsap.fromTo(
            track,
            { xPercent: dir > 0 ? -50 : 0 },
            {
              xPercent: dir > 0 ? 0 : -50,
              duration: speed,
              ease: "none",
              repeat: -1,
            },
          );
        });

        // Scroll adds a small directional offset on top of the constant drift,
        // so the rails respond to the reader without ever stopping.
        gsap.to(el.querySelectorAll(".rail-shift"), {
          xPercent: (i) => (i % 2 === 0 ? -6 : 6),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      },
    },
    root,
  );

  return (
    <section
      ref={root}
      aria-label="FRX in short"
      className="relative overflow-clip border-y border-[var(--border)] bg-[var(--bg)] py-[clamp(2.5rem,6vw,5rem)]"
    >
      <div className="flex flex-col gap-[clamp(0.1rem,0.6vw,0.5rem)]">
        {RAILS.map((rail, i) => (
          <div
            key={i}
            className={`rail-wrap ${i > 0 ? "hidden md:block" : ""}`}
            style={{ "--angle": `${rail.angle}deg` } as React.CSSProperties}
          >
            <div className="rail-shift">
              <div
                className="rail-track flex w-max will-change-transform"
                data-dir={rail.direction}
                data-speed={rail.speed}
              >
                {/* Two identical copies — the second is what makes the -50%
                    translation loop seamlessly. */}
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
                    {rail.items.map((item) => (
                      <span
                        key={item}
                        className={`rail-item ${rail.outline ? "rail-item-outline" : ""}`}
                      >
                        {item}
                        <RailStar />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** The FRX cross, reduced to a separator. Same motif as the X in the logo. */
function RailStar() {
  return (
    <svg viewBox="0 0 24 24" className="rail-star" aria-hidden="true" fill="none">
      <path
        d="M4 20 20 4M9.5 4H20v10.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
    </svg>
  );
}
