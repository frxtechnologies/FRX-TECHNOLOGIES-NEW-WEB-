"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { CAPABILITY_STATS } from "@/lib/site";
import { Counter, Reveal, RevealLines } from "@/components/ui/reveal";

/**
 * The statement that follows the rails, with the capability counts folded into
 * the same block rather than parked in a separate stats band.
 *
 * The numbers are FRX's actual capability counts — service lines, technologies,
 * founders. No client counts, no revenue, no success rates.
 */
export function IntroStatement() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      aboveMobile: () => {
        // The rule beside the statement draws itself as the block arrives.
        gsap.fromTo(
          ".statement-rule",
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
          },
        );
      },
    },
    root,
  );

  return (
    <section ref={root} className="section">
      <div className="container grid gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[auto_minmax(0,1fr)]">
        <span
          aria-hidden="true"
          className="statement-rule hidden w-px origin-top bg-gradient-to-b from-[var(--accent)] to-transparent lg:block"
        />

        <div className="flex flex-col gap-[clamp(2.5rem,5vw,4.5rem)]">
          <div className="flex flex-col gap-8">
            <p className="t-eyebrow">Approach</p>

            <RevealLines
              as="h2"
              className="t-h2 max-w-[18ch]"
              lines={[
                "Technology should",
                "remove friction.",
                <span key="not" className="text-[var(--text-faint)]">
                  Not create more of it.
                </span>,
              ]}
            />

            <Reveal className="t-lead max-w-[54ch]" delay={0.1}>
              <p>
                FRX designs software, AI systems and digital experiences around real
                business requirements — turning complex workflows into technology that is
                practical, scalable and easier to operate. We build technology around
                businesses, not the other way around.
              </p>
            </Reveal>
          </div>

          <dl className="grid grid-cols-1 gap-px border-t border-[var(--border)] sm:grid-cols-3">
            {CAPABILITY_STATS.map((stat) => (
              <Reveal
                key={stat.label}
                className="flex flex-col gap-2 border-b border-[var(--border)] py-7 sm:border-b-0 sm:border-r sm:pr-6 sm:last:border-r-0"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="flex flex-col gap-2">
                  <span className="t-index block text-[clamp(2.75rem,6vw,4.75rem)] leading-none font-semibold tracking-[-0.05em]">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-step-xs text-[var(--text-muted)]">
                    {stat.label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
