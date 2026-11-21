"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import "./how-we-build.css";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

export type Principle = { title: string; body: string };

/**
 * "How we build." — the homepage's scroll story. It borrows the About page's language (a hand-drawn
 * line that is drawn by the reader's scroll, with a dot riding its tip) and adapts it to a short,
 * unpinned timeline of FRX's own principles (the same text as the About page, editable in admin).
 *
 * DESKTOP: a wobbling spine is drawn as you scroll past; each principle's node pops and its card slides
 * in from its side, over a giant outlined number that drifts at its own pace (three layers: line,
 * cards, numbers). Nothing is pinned and the page is never lengthened: it is ordinary scrolling.
 *
 * PHONES / TABLETS / reduced motion: a plain vertical timeline, fully visible, no scroll animation.
 */
export function HowWeBuild({ items }: { items: Principle[] }) {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      desktop: () => {
        const el = root.current;
        if (!el) return;
        const list = el.querySelector<HTMLElement>(".fxhb-steps");
        const path = el.querySelector<SVGPathElement>(".fxhb-line path");
        const dot = el.querySelector<SVGCircleElement>(".fxhb-line circle");
        if (!list || !path) return;

        // the line, drawn by the reader (scrubbed), with a dot riding its tip
        gsap.fromTo(
          path,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: list,
              start: "top 65%",
              end: "bottom 65%",
              scrub: 0.5,
              onUpdate: (self) => {
                if (!dot) return;
                const len = path.getTotalLength();
                const pt = path.getPointAtLength(len * self.progress);
                dot.setAttribute("cx", String(pt.x));
                dot.setAttribute("cy", String(pt.y));
              },
            },
          },
        );

        el.querySelectorAll<HTMLElement>(".fxhb-step").forEach((step, i) => {
          const card = step.querySelector<HTMLElement>(".fxhb-card");
          const node = step.querySelector<HTMLElement>(".fxhb-node");
          const big = step.querySelector<HTMLElement>(".fxhb-big");
          const dir = i % 2 ? 1 : -1;

          // card + node arrive together once, when the step is comfortably in view
          gsap.set(card, { autoAlpha: 0, x: 46 * dir, y: 14 });
          gsap.set(node, { scale: 0.4, autoAlpha: 0 });
          gsap
            .timeline({ scrollTrigger: { trigger: step, start: "top 80%", toggleActions: "play none none none" } })
            .to(node, { scale: 1, autoAlpha: 1, duration: 0.55, ease: "back.out(2.2)" }, 0)
            .to(card, { autoAlpha: 1, x: 0, y: 0, duration: 0.8, ease: "power3.out" }, 0.08);

          // the giant number drifts against the scroll (transform-only, scrubbed)
          if (big) gsap.fromTo(big, { yPercent: 16 }, { yPercent: -16, ease: "none", scrollTrigger: { trigger: step, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        });
      },
    },
    root,
    [items.length],
  );

  if (!items.length) return null;

  return (
    <section ref={root} className="fxhb" data-glow id="how-we-build" aria-labelledby="fxhb-title">
      <div className="fx-container">
        <header className="fxhb-head">
          <p className="fx-label fxhb-eyebrow">
            <span className="fxa-tick" aria-hidden="true" />
            Our principles
          </p>
          <h2 id="fxhb-title" className="fxhb-h fx-d1 fx-up" data-fx="reveal-lines">
            How we build.
          </h2>
        </header>

        <ol className="fxhb-steps">
          <svg className="fxhb-line" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M20 0C6 90 34 170 20 260S6 430 20 520 34 690 20 780 6 910 20 1000"
              fill="none"
              stroke="var(--fx-blue)"
              strokeWidth="6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle r="8" cx="20" cy="0" fill="var(--fx-sub)" stroke="var(--fx-ink)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>

          {items.map((p, i) => (
            <li key={p.title} className="fxhb-step" data-side={i % 2 ? "r" : "l"}>
              <span className="fxhb-big" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="fxhb-node fx-tabular" aria-hidden="true">
                {i + 1}
              </span>
              <div className="fxhb-card">
                <h3 className="fxhb-title">{p.title}</h3>
                {p.body ? <p className="fxhb-body">{p.body}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
