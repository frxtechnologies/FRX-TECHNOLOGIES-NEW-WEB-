"use client";

import { useRef, useState } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { PROCESS } from "@/lib/services";
import { RevealLines } from "@/components/ui/reveal";

/**
 * How FRX works — a pinned column on the left whose number and title swap as
 * the stages scroll past on the right, with a progress line tracking position.
 *
 * Below 1024px the pin is dropped entirely and the stages become a numbered
 * vertical list. Pinning a tall column against a short viewport is what makes
 * these sections feel broken on laptops and phones.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  useMotion(
    {
      desktop: () => {
        const section = root.current;
        if (!section) return;

        gsap.fromTo(
          section.querySelector(".process-progress"),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section.querySelector(".process-list"),
              start: "top center",
              end: "bottom center",
              scrub: true,
            },
          },
        );

        section.querySelectorAll<HTMLElement>(".process-stage").forEach((stage, i) => {
          gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: "top 62%",
              end: "bottom 62%",
              onEnter: () => setStep(i),
              onEnterBack: () => setStep(i),
            },
          });
        });
      },
    },
    root,
  );

  const current = PROCESS[step];

  return (
    <section ref={root} className="section relative">
      <div className="container">
        <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6">
          <p className="t-eyebrow">Process</p>
          <RevealLines
            as="h2"
            className="t-h2 max-w-[18ch]"
            lines={["Six stages,", "no mystery."]}
          />
        </div>

        <div className="grid gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* The pinned indicator. Hidden below lg, where the list stands alone. */}
          <div className="hidden lg:block">
            <div className="sticky top-[calc(var(--nav-h)+3rem)] flex gap-6">
              <span className="relative block w-px shrink-0 bg-[var(--border)]">
                <span className="process-progress absolute inset-0 origin-top bg-[var(--accent)]" />
              </span>

              <div className="flex flex-col gap-4">
                <span
                  key={current.index}
                  className="t-index process-big-index block text-[clamp(4rem,9vw,8rem)] leading-none font-semibold tracking-[-0.06em]"
                >
                  {current.index}
                </span>
                <span key={current.title} className="process-big-title t-h3">
                  {current.title}
                </span>
                <span className="text-step-xs text-[var(--text-faint)]">
                  Stage {step + 1} of {PROCESS.length}
                </span>
              </div>
            </div>
          </div>

          <ol className="process-list border-t border-[var(--border)]">
            {PROCESS.map((stage, i) => (
              <li
                key={stage.index}
                className="process-stage"
                data-current={i === step}
              >
                <span className="t-index process-stage-index">{stage.index}</span>
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-step-lg leading-tight font-medium tracking-[-0.03em]">
                    {stage.title}
                  </h3>
                  <p className="max-w-[52ch] text-step-sm leading-relaxed text-[var(--text-muted)]">
                    {stage.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
