"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { ActionButton } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { useIntro } from "@/components/providers/intro-provider";
import { HeroLight } from "./hero-light";

/**
 * The homepage hero.
 *
 * No laptop mockup, no gradient blob. A blue volumetric beam originates off the
 * lower right and cuts up through the composition — the FRX light system that
 * threads the rest of the site — with the statement set against it.
 *
 * On scroll the hero doesn't just end: the type lifts, the beam expands and
 * fades, and the next section rises into the space. One handoff, not a cut.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { ready } = useIntro();

  // Entry. Gated on the intro clearing, so the two never overlap.
  useMotion(
    {
      all: () => {
        if (!ready) return;
        const tl = gsap.timeline();
        // GSAP parses the CSS start state's percentage transform into `y` as
        // pixels, so both components have to be declared explicitly: without
        // `y: 0` the tween stacks 105% on top of the pixels it already read.
        tl.fromTo(
          ".hero-line > span",
          { yPercent: 105, y: 0 },
          { yPercent: 0, y: 0, duration: 1.15, stagger: 0.08, ease: "expo.out" },
        )
          .from(".hero-eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0.1)
          .from(".hero-sub", { opacity: 0, y: 18, duration: 0.8 }, 0.5)
          .from(".hero-actions > *", { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 }, 0.62)
          .from(".hero-meta", { opacity: 0, duration: 0.8 }, 0.75);
      },
      reduced: () => {
        gsap.set(".hero-line > span", { yPercent: 0, y: 0 });
      },
    },
    root,
    [ready],
  );

  // Parallax handoff into the next section. Desktop and tablet only — on a
  // phone this just fights the browser's own address-bar behaviour.
  useMotion(
    {
      aboveMobile: () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          })
          .to(".hero-type", { yPercent: -22, opacity: 0.15, ease: "none" }, 0)
          .to(".hero-meta", { yPercent: -40, opacity: 0, ease: "none" }, 0);
      },
    },
    root,
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-clip pb-[clamp(2.5rem,6vh,5rem)]"
    >
      <HeroLight />

      <div className="container relative flex flex-col gap-[clamp(1.75rem,4vh,3rem)] pt-[calc(var(--nav-h)+clamp(4rem,12vh,8rem))]">
        <div className="hero-type flex flex-col gap-[clamp(1.5rem,3.5vh,2.5rem)]">
          <p className="hero-eyebrow t-eyebrow flex items-center gap-3">
            <span className="signal-tick" />
            FRX Technologies
          </p>

          <h1 className="t-display max-w-[15ch]" data-reveal="line">
            <span className="reveal-mask hero-line">
              <span>We build digital systems</span>
            </span>
            <span className="reveal-mask hero-line">
              <span>
                that drive <span className="accent">growth</span>.
              </span>
            </span>
          </h1>

          <div className="grid gap-[clamp(1.5rem,3vw,3rem)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <p className="hero-sub t-lead max-w-[46ch]">
              Modern websites, intelligent automation and custom software built
              around real business needs.
            </p>

            <div className="hero-actions flex flex-wrap items-center gap-3">
              <Magnetic>
                <ActionButton href="/contact">Start a Project</ActionButton>
              </Magnetic>
              <ActionButton href="/services" variant="outline">
                Explore Capabilities
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Quiet technical footer to the hero — anchors the composition and
            gives the eye a reason to keep moving down. */}
        <div className="hero-meta mt-[clamp(1rem,3vh,2.5rem)] flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-[var(--border)] pt-5">
          <ul className="t-index flex flex-wrap gap-x-6 gap-y-2 text-step-xs text-[var(--text-faint)]">
            <li>AI &amp; Automation</li>
            <li>Web Experiences</li>
            <li>Custom Software</li>
            <li className="hidden sm:list-item">UI/UX</li>
          </ul>
          <p className="t-index hidden text-step-xs text-[var(--text-faint)] md:block">
            Build smarter. Launch faster. Grow further.
          </p>
        </div>
      </div>
    </section>
  );
}
