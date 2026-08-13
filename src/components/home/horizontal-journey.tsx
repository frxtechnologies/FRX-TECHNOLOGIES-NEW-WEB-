"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { JOURNEY_PANELS } from "@/lib/services";
import { ArrowIcon } from "@/components/ui/icons";

/**
 * The capability journey.
 *
 * Desktop: the section pins and the panels travel horizontally as one continuous
 * canvas — the vertical scroll distance is derived from the track's real width,
 * so the scene always ends exactly as the last panel lands and hands back to
 * vertical scrolling without a jolt.
 *
 * Tablet and mobile get a genuine touch rail with scroll-snap instead. Forcing
 * desktop pin physics onto a touch device is how these sections end up trapping
 * people mid-page.
 */
export function HorizontalJourney() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useMotion(
    {
      desktop: () => {
        const section = root.current;
        const rail = track.current;
        if (!section || !rail) return;

        // Measured in a function so ScrollTrigger re-reads it on refresh rather
        // than baking in a width from before the fonts loaded.
        const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth);

        const tween = gsap.to(rail, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // The progress rule fills across the top of the pinned scene.
        gsap.fromTo(
          section.querySelector(".journey-progress"),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );

        return () => tween.kill();
      },
    },
    root,
  );

  return (
    <section
      ref={root}
      aria-label="Capabilities"
      className="journey relative bg-[var(--bg-elevated)]"
    >
      <div className="journey-viewport">
        <div className="journey-head container">
          <p className="t-eyebrow">Capabilities</p>
          <span
            className="journey-progress hidden origin-left lg:block"
            aria-hidden="true"
          />
          <p className="t-index journey-hint hidden lg:block">Scroll</p>
        </div>

        <div ref={track} className="journey-track" data-cursor="drag">
          {JOURNEY_PANELS.map((panel) => (
            <article key={panel.index} className="journey-panel">
              <Link href={panel.href} className="journey-panel-link">
                <span className="t-index journey-panel-index">{panel.index}</span>
                <h3 className="journey-panel-title">{panel.title}</h3>
                <p className="journey-panel-body">{panel.body}</p>
                <span className="journey-panel-cta">
                  Explore
                  <ArrowIcon className="h-3 w-3" />
                </span>
              </Link>
            </article>
          ))}

          {/* The canvas closes rather than stopping at the last panel. */}
          <article className="journey-panel journey-panel-end">
            <p className="t-index text-[var(--text-faint)]">End of capabilities</p>
            <p className="journey-panel-title max-w-[12ch]">
              Something <span className="accent">else</span> in mind?
            </p>
            <Link href="/contact" className="journey-panel-cta">
              Start a Project
              <ArrowIcon className="h-3 w-3" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
