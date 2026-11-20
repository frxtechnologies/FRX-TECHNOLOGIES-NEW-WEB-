"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/gsap";
import "./fx-marquee.css";

const WORDS = ["Build smarter", "Automate better", "Create what’s next", "Software without limits"];
const LABEL = WORDS.join(". ") + ".";

/**
 * The marks between phrases: small original software symbols, not ornaments.
 * Each has its own idle motion (a turning gear, a nodding cursor, a pulsing node)
 * and uses the secondary accent for its one coloured detail.
 */
function Mark({ kind }: { kind: number }) {
  const line = { fill: "none", stroke: "currentColor", strokeWidth: 3.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 48 48" className={`fxm-mark fxm-mark--${kind}`} aria-hidden="true">
      {kind === 0 && (
        <g>
          <path {...line} d="M17 14 7 24l10 10M31 14l10 10-10 10" />
          <path className="fxm-slash" d="M27 10 21 38" fill="none" stroke="var(--fx-sub)" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {kind === 1 && (
        <g className="fxm-spin">
          <path
            {...line}
            d="M24 6l3 4 5-1 1 5 5 2-2 5 3 4-4 3 0 5-5 1-2 5-5-2-4 3-3-4-5-1 1-5-4-3 3-4-2-5 5-2 1-5 5 1z"
          />
          <circle cx="24" cy="24" r="6" fill="var(--fx-sub)" stroke="none" />
        </g>
      )}
      {kind === 2 && (
        <g className="fxm-nod">
          <path d="M10 6v31l8-7 6 13 6-3-6-12h11z" fill="var(--fx-sub)" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {kind === 3 && (
        <g>
          <path {...line} d="M12 34 24 14l12 20M12 34h24" />
          <circle cx="24" cy="12" r="6" fill="currentColor" stroke="none" />
          <circle className="fxm-pulse" cx="11" cy="35" r="5" fill="var(--fx-sub)" stroke="none" />
          <circle cx="37" cy="35" r="5" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  );
}

/**
 * Blue band carrying the FRX statements.
 *
 * The belt is always moving, and scrolling drives it: velocity speeds it up,
 * scroll direction reverses it, and the whole band skews with the push — so the
 * page feels like it is pulling the type along. Reduced motion: static, one line.
 */
export function FxMarquee() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el) return;
        const belt = el.querySelector<HTMLElement>(".fxm-belt");
        const band = el.querySelector<HTMLElement>(".fxm-band");
        if (!belt || !band) return;

        const wrap = gsap.utils.wrap(-50, 0);
        const skew = gsap.quickTo(band, "skewX", { duration: 0.5, ease: "power3.out" });
        let pos = 0;
        let dir = -1;
        let boost = 0;
        let visible = true;

        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
        io.observe(el);

        const st = ScrollTrigger.create({
          onUpdate: (self) => {
            const v = self.getVelocity();
            boost = Math.min(Math.abs(v) / 1100, 9);
            if (v !== 0) dir = v > 0 ? -1 : 1;
            skew(gsap.utils.clamp(-9, 9, v / -260));
          },
        });

        const tick = (_t: number, dt: number) => {
          if (!visible) return;
          boost *= 0.94;
          pos = wrap(pos + dir * (0.5 + boost) * (dt / 16.67) * 0.09);
          gsap.set(belt, { xPercent: pos });
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          io.disconnect();
          st.kill();
        };
      },
    },
    root,
  );

  const unit = (
    <>
      {WORDS.map((w, i) => (
        <span className="fxm-item" key={w}>
          {w}.<Mark kind={i % 4} />
        </span>
      ))}
    </>
  );

  return (
    <section ref={root} id="after-hero" className="fxm" aria-label={LABEL}>
      <div className="fxm-band">
        <div className="fxm-belt" aria-hidden="true">
          <div className="fxm-unit">{unit}</div>
          <div className="fxm-unit">{unit}</div>
          <div className="fxm-unit">{unit}</div>
          <div className="fxm-unit">{unit}</div>
        </div>
        <p className="sr-only">{LABEL}</p>
      </div>
    </section>
  );
}
