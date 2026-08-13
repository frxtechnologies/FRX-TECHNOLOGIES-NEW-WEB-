"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { ActionButton } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { RevealLines } from "@/components/ui/reveal";

/**
 * The closing statement. Full-bleed FRX blue — the last colour handoff before
 * the footer, and the one section on the site where blue is the ground rather
 * than the accent.
 */
export function ContactCta({
  eyebrow = "Start here",
  lines = ["Let's build", "something useful."],
  body = "Tell us what you're trying to build and the problem you're trying to solve. We'll come back with an approach, not a brochure.",
}: {
  eyebrow?: string;
  lines?: string[];
  body?: string;
}) {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      aboveMobile: () => {
        gsap.fromTo(
          root.current?.querySelector(".cta-wash") ?? null,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      },
    },
    root,
  );

  return (
    <section ref={root} className="cta on-dark relative overflow-clip">
      <span className="cta-wash" aria-hidden="true" />

      <div className="container relative flex flex-col gap-9 py-[clamp(4.5rem,10vw,9rem)]">
        <p className="t-eyebrow cta-eyebrow">{eyebrow}</p>

        <RevealLines as="h2" className="t-display max-w-[16ch]" lines={lines} />

        <p className="max-w-[50ch] text-step-md leading-relaxed text-white/75">
          {body}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Magnetic>
            <ActionButton href="/contact" className="cta-button text-step-md">
              Start a Project
            </ActionButton>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
