"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SERVICES, type ServiceSlug } from "@/lib/services";
import {
  BlockStack,
  BotBuddy,
  CursorBuddy,
  LoopArrow,
  Sparkle,
  WindowBuddy,
  Zig,
  Asterisk,
} from "@/components/art/characters";
import "./fx-services.css";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

/** Per-service staging: which character, which ground, which doodle. */
const STAGE: Record<ServiceSlug, { art: ReactNode; tone: "ink" | "paper" | "tint" | "blue"; doodle: ReactNode }> = {
  "ai-automation": {
    art: <BotBuddy className="fxs-art" />,
    tone: "ink",
    doodle: <LoopArrow className="fxs-doodle fxs-doodle--a" />,
  },
  "web-development": {
    art: <WindowBuddy className="fxs-art" />,
    tone: "paper",
    doodle: <Sparkle className="fxs-doodle fxs-doodle--b" />,
  },
  "software-development": {
    art: <BlockStack className="fxs-art" />,
    tone: "tint",
    doodle: <Zig className="fxs-doodle fxs-doodle--c" />,
  },
  "ui-ux": {
    art: <CursorBuddy className="fxs-art" />,
    tone: "blue",
    doodle: <Asterisk className="fxs-doodle fxs-doodle--d" />,
  },
};

/**
 * The services — four panels that stack like a deck as you scroll.
 *
 * Each panel is `position: sticky`, so the stacking is plain CSS and survives
 * without JavaScript. GSAP adds the depth on top: as the next panel slides over,
 * the one beneath scales back and dims, and each character wakes up (eyes,
 * bob, doodle drawing in) the first time its panel is the one in front. Below
 * 900px the stack is released into ordinary flow — a panel taller than a phone
 * cannot be sticky without hiding its own bottom half.
 */
export function FxServices() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el) return;
        const panels = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".fxs-panel"));

        panels.forEach((panel) => {
          // character bob, always on (cheap, transform only)
          const art = panel.querySelector(".fxs-art");
          if (art) {
            gsap.to(art, {
              y: -12,
              rotate: 1.2,
              duration: 2.6,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              transformOrigin: "50% 100%",
            });
          }
          panel.querySelectorAll<HTMLElement>(".fxa-wave").forEach((a) =>
            gsap.fromTo(
              a,
              { rotate: -10, svgOrigin: a.dataset.origin },
              { rotate: 14, svgOrigin: a.dataset.origin, duration: 0.55, ease: "sine.inOut", repeat: -1, yoyo: true },
            ),
          );
          panel.querySelectorAll<HTMLElement>(".fxa-cog").forEach((c) =>
            gsap.to(c, { rotate: 360, svgOrigin: c.dataset.origin, duration: 9, ease: "none", repeat: -1 }),
          );

          // entrance: character pops, numeral + doodles draw
          gsap
            .timeline({ scrollTrigger: { trigger: panel, start: "top 72%", once: true } })
            .from(panel.querySelector(".fxs-figure"), { scale: 0.4, rotate: -10, opacity: 0, duration: 1, ease: "back.out(1.6)" }, 0)
            .fromTo(
              panel.querySelectorAll("[data-draw]"),
              { drawSVG: "0%" },
              { drawSVG: "100%", duration: 0.9, ease: "power2.inOut", stagger: 0.12 },
              0.25,
            );
        });
      },
    },
    root,
  );

  // Depth: the panel underneath recedes as the next one covers it. Only where
  // the stack is actually sticky.
  useMotion(
    {
      desktop: () => {
        const el = root.current;
        if (!el) return;
        const panels = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".fxs-panel"));
        panels.forEach((panel, i) => {
          const next = panels[i + 1];
          if (!next) return;
          gsap.to(panel, {
            scale: 0.94,
            filter: "brightness(0.82)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top 85%", end: "top 18%", scrub: true },
          });
        });
      },
      tablet: () => {
        const el = root.current;
        if (!el) return;
        gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".fxs-panel")).forEach((panel, i, all) => {
          const next = all[i + 1];
          if (!next) return;
          gsap.to(panel, {
            scale: 0.96,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top 85%", end: "top 20%", scrub: true },
          });
        });
      },
    },
    root,
  );

  return (
    <section ref={root} className="fxs" aria-labelledby="fxs-title">
      <div className="fx-container fxs-head">
        <p className="fx-label fxs-eyebrow">What we build</p>
        <h2 id="fxs-title" className="fx-d2 fx-up fxs-title">
          We don&apos;t just build pages. <span className="fxs-accent">We build systems.</span>
        </h2>
      </div>

      <div className="fx-container fxs-stack">
        {SERVICES.map((s, i) => {
          const stage = STAGE[s.slug];
          return (
            <article
              key={s.slug}
              className={`fxs-panel fxs-panel--${stage.tone}`}
              style={{ ["--i" as string]: i }}
            >
              <div className="fxs-copy">
                <span className="fxs-index fx-outline fx-outline--lg" aria-hidden="true">
                  {s.index}
                </span>
                <h3 className="fxs-name fx-d3 fx-up">{s.name}</h3>
                <p className="fxs-tag fx-h3">{s.tagline}</p>
                <p className="fxs-sum fx-body">{s.summary}</p>

                <ul className="fxs-caps" aria-label={`${s.name} capabilities`}>
                  {s.capabilities.slice(0, 4).map((c) => (
                    <li key={c} className="fx-small">
                      {c}
                    </li>
                  ))}
                </ul>

                <Link href={`/services/${s.slug}`} className="fx-btn fx-btn--ink fx-hover-shift fxs-cta">
                  Explore {s.name} <span className="fx-shift" aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="fxs-figure" aria-hidden="true">
                {stage.art}
                {stage.doodle}
              </div>
            </article>
          );
        })}
      </div>

      <div className="fx-container fxs-foot">
        <Link href="/services" className="fx-btn fx-btn--outline fx-hover-shift">
          All services <span className="fx-shift" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
