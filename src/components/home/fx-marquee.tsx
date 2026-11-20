"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/gsap";
import "./fx-marquee.css";

const WORDS = ["Build smarter", "Automate better", "Create what’s next", "Software without limits"];
const LABEL = WORDS.join(". ") + ".";

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
      {WORDS.map((w) => (
        <span className="fxm-item" key={w}>
          {w}.<i aria-hidden="true" className="fxm-star" />
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
