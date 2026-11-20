"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CAPABILITY_STATS } from "@/lib/site";
import { Counter, Reveal } from "@/components/ui/reveal";
import { Asterisk, Squiggle } from "@/components/art/characters";
import "./fx-manifesto.css";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText, DrawSVGPlugin);

/**
 * The approach statement, set as the page's second headline.
 *
 * The sentence starts faint and fills with ink word by word as it crosses the
 * viewport — scrubbed, so the reading speed is the scroll speed. The accent
 * words and the doodles beneath them draw in when their line lands. The counts
 * are FRX's real capability figures (service lines, technologies, founders);
 * nothing here is a client or revenue claim.
 */
export function FxManifesto() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el) return;
        const h = el.querySelector<HTMLElement>(".fxn-statement");
        if (!h) return;

        let split: SplitText | undefined;
        document.fonts.ready.then(() => {
          if (!el.isConnected) return;
          split = SplitText.create(h, { type: "words", aria: "none" });
          gsap.fromTo(
            split.words,
            { opacity: 0.12 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.12,
              scrollTrigger: { trigger: h, start: "top 82%", end: "bottom 46%", scrub: 0.4 },
            },
          );
        });

        gsap.fromTo(
          el.querySelectorAll("[data-draw]"),
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration: 1,
            ease: "power2.inOut",
            stagger: 0.15,
            scrollTrigger: { trigger: h, start: "bottom 70%", once: true },
          },
        );

        return () => split?.revert();
      },
    },
    root,
  );

  // Rotating asterisk — decoration that follows the scroll, aboveMobile only.
  useMotion(
    {
      aboveMobile: () => {
        gsap.to(".fxn-ast", {
          rotate: 220,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      },
    },
    root,
  );

  return (
    <section ref={root} className="fxn">
      <div className="fx-container fxn-wrap">
        <p className="fx-label fxn-eyebrow">
          <span aria-hidden="true" className="fxn-tick" />
          Approach
        </p>

        <div className="fxn-head">
          <h2 className="fxn-statement fx-d2 fx-up">
            Technology should remove friction.{" "}
            <span className="fxn-accent">Not create more of it.</span>
          </h2>
          <Squiggle className="fxn-squig" />
          <Asterisk className="fxn-ast" />
        </div>

        <div className="fxn-body">
          <Reveal className="fx-lead fxn-lead" delay={0.05}>
            <p>
              FRX designs software, AI systems and digital experiences around real business
              requirements — turning complex workflows into technology that is practical,
              scalable and easier to operate. We build technology around businesses, not the
              other way around.
            </p>
          </Reveal>

          <dl className="fxn-stats">
            {CAPABILITY_STATS.map((stat) => (
              <Reveal key={stat.label} className="fxn-stat">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="fxn-num fx-tabular">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="fx-label fxn-cap">{stat.label}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
