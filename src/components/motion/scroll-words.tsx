"use client";

import { useRef, type ElementType } from "react";
import { gsap, useMotion } from "@/lib/gsap";

/** Resolve a CSS colour expression (including var()) to a concrete rgb() string. */
function resolve(host: HTMLElement, value: string) {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  probe.style.color = value;
  host.appendChild(probe);
  const out = getComputedStyle(probe).color;
  probe.remove();
  return out;
}

/**
 * A paragraph whose words move from neutral to FRX blue as it crosses the
 * viewport. Scrubbed — reading speed is scroll speed. The words are real DOM
 * text from the server render, so it reads correctly with JavaScript off,
 * under reduced motion (final colour, no scrub) and to assistive tech.
 *
 * Colours are re-resolved on every ScrollTrigger refresh, so a theme change
 * mid-page picks up the new tokens.
 */
export function ScrollWords({
  text,
  as: Tag = "p",
  className = "",
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useMotion(
    {
      all: () => {
        const el = ref.current;
        if (!el) return;
        const spans = el.querySelectorAll<HTMLElement>(".sw");
        gsap.fromTo(
          spans,
          { color: () => resolve(el, "var(--fx-ink-3)"), opacity: 0.4 },
          {
            color: () => resolve(el, "var(--fx-accent-text)"),
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "bottom 45%",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      },
      reduced: () => {
        const el = ref.current;
        if (!el) return;
        gsap.set(el.querySelectorAll(".sw"), { color: resolve(el, "var(--fx-accent-text)"), opacity: 1 });
      },
    },
    ref,
  );

  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="sw">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
