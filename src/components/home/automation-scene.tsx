"use client";

import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { RevealLines } from "@/components/ui/reveal";

const STEPS = [
  { label: "Form submitted", note: "A lead arrives" },
  { label: "Data processed", note: "Parsed and classified" },
  { label: "CRM updated", note: "One record, no retyping" },
  { label: "Follow-up triggered", note: "Before it goes cold" },
];

/**
 * What an automation actually looks like, drawn as a signal travelling between
 * nodes. Illustrative of the mechanism — not a screenshot of anyone's product,
 * because no client work has been supplied to show.
 *
 * The connecting line draws with scroll and a pulse rides along it, so the
 * diagram reads as flow rather than as four boxes with arrows.
 */
export function AutomationScene() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el) return;

        gsap.fromTo(
          el.querySelectorAll(".flow-line"),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            stagger: 0.16,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 68%", once: true },
          },
        );

        gsap.fromTo(
          el.querySelectorAll(".flow-node"),
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.16,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 68%", once: true },
          },
        );

        // A pulse that keeps travelling once the diagram has drawn itself. The
        // distance is measured from the rail rather than expressed as a
        // percentage of the pulse's own width, so it always crosses fully.
        const rail = el.querySelector<HTMLElement>(".flow-rail");
        const pulse = el.querySelector<HTMLElement>(".flow-pulse");
        if (rail && pulse) {
          gsap.fromTo(
            pulse,
            { x: 0, opacity: 0 },
            {
              keyframes: [
                { opacity: 1, duration: 0.18 },
                { x: () => rail.clientWidth - pulse.offsetWidth, duration: 2.4, ease: "none" },
                { opacity: 0, duration: 0.18 },
              ],
              repeat: -1,
              repeatDelay: 0.6,
              // Paused while off screen so it isn't burning frames unseen.
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
                end: "bottom top",
                toggleActions: "play pause resume pause",
                invalidateOnRefresh: true,
              },
            },
          );
        }
      },
    },
    root,
  );

  return (
    <section ref={root} className="section relative overflow-clip">
      <div className="container">
        <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6">
          <p className="t-eyebrow">How automation runs</p>
          <RevealLines
            as="h2"
            className="t-h2 max-w-[20ch]"
            lines={["One trigger.", "Everything downstream."]}
          />
          <p className="t-lead max-w-[52ch]">
            A single event sets off the whole sequence. Nobody copies anything between
            tools, and nothing waits for someone to remember.
          </p>
        </div>

        <div className="flow" role="list" aria-label="Example automation sequence">
          {/* The rail the pulse travels along. Decorative — the nodes carry the
              actual content. */}
          <div className="flow-rail" aria-hidden="true">
            <span className="flow-pulse" />
          </div>

          {STEPS.map((s, i) => (
            <div key={s.label} className="flow-cell" role="listitem">
              <div className="flow-node">
                <span className="t-index flow-node-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flow-node-label">{s.label}</span>
                <span className="flow-node-note">{s.note}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="flow-line" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
