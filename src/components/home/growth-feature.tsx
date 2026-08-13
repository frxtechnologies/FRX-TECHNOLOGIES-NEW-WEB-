"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { ActionButton } from "@/components/ui/button";

/**
 * "Less Work. More Growth." — the automation argument, at full viewport width.
 *
 * The visual is an abstract FRX-blue environment rather than a photograph:
 * concentric light planes with a rising blue horizon, parallaxed against the
 * type. When the branded workspace photograph is supplied it drops in behind
 * this composition through `--feature-image` without any layout change.
 */
export function GrowthFeature() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      aboveMobile: () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          })
          .fromTo(".feature-plane", { yPercent: 12 }, { yPercent: -12, ease: "none" }, 0)
          .fromTo(".feature-horizon", { yPercent: 30 }, { yPercent: -20, ease: "none" }, 0)
          .fromTo(".feature-copy", { yPercent: 6 }, { yPercent: -6, ease: "none" }, 0);
      },
    },
    root,
  );

  return (
    <section ref={root} className="feature on-dark relative overflow-clip">
      <div className="feature-stage" aria-hidden="true">
        {/* The particle field from the supplied FRX banner artwork, cropped
            clear of its typography. It sits behind the CSS light planes so the
            two read as one environment rather than a photo with shapes on it. */}
        <Image
          src="/images/frx-signal-wide.webp"
          alt=""
          fill
          sizes="100vw"
          quality={80}
          className="feature-art"
        />
        <span className="feature-plane feature-plane-1" />
        <span className="feature-plane feature-plane-2" />
        <span className="feature-plane feature-plane-3" />
        <span className="feature-horizon" />
        <span className="feature-scan" />
      </div>

      <div className="container relative flex min-h-[clamp(30rem,82vh,46rem)] items-end py-[clamp(4rem,9vw,8rem)]">
        <div className="feature-copy flex max-w-[46ch] flex-col gap-7">
          <p className="t-eyebrow">Automation</p>

          <RevealLines
            as="h2"
            className="t-h2"
            lines={[
              "Less Work.",
              <span key="growth" className="accent">
                More Growth.
              </span>,
            ]}
          />

          <Reveal className="t-lead" delay={0.1}>
            <p>
              We build intelligent websites and automation systems that help businesses
              operate smarter — moving information between tools, triggering the next
              step, and taking the repetitive work off people who have better things to
              do.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <ActionButton href="/services/ai-automation" variant="outline">
              How automation works
            </ActionButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
