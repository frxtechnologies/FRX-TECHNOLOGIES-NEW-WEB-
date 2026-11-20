"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

/**
 * The line that runs down the About page. One continuous hand-drawn stroke
 * behind the content; its length is tied to scroll progress through the parent
 * section, so it appears to be drawn by the reader. A moving dot rides its
 * leading edge. Decorative only — reduced-motion visitors see it fully drawn.
 */
export function AboutPath() {
  const root = useRef<SVGSVGElement>(null);

  useMotion(
    {
      all: () => {
        const svg = root.current;
        const host = svg?.parentElement;
        if (!svg || !host) return;
        const path = svg.querySelector<SVGPathElement>("path");
        const dot = svg.querySelector<SVGCircleElement>("circle");
        if (!path) return;
        gsap.fromTo(
          path,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: host,
              start: "top 70%",
              end: "bottom 70%",
              scrub: 0.5,
              onUpdate: (self) => {
                if (!dot) return;
                const len = path.getTotalLength();
                const p = path.getPointAtLength(len * self.progress);
                dot.setAttribute("cx", String(p.x));
                dot.setAttribute("cy", String(p.y));
              },
            },
          },
        );
      },
      reduced: () => {
        const dot = root.current?.querySelector("circle");
        dot?.setAttribute("opacity", "0");
      },
    },
  );

  return (
    <svg ref={root} className="fxab-path" viewBox="0 0 1000 3200" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M120 0 C 120 220, 880 260, 860 520 S 140 760, 160 1040 S 860 1260, 840 1560 S 160 1800, 180 2080 S 840 2300, 820 2600 S 200 2860, 500 3200"
        fill="none"
        stroke="var(--fx-blue)"
        strokeWidth="7"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle r="9" cx="120" cy="0" fill="var(--fx-blue)" />
    </svg>
  );
}
