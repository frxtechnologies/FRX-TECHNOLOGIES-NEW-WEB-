"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/gsap";

/**
 * Headline reveal: each line rides up from behind an overflow mask.
 *
 * Lines are authored explicitly rather than measured from wrapped text — a
 * measured split re-runs on every resize and fights fluid type. Passing the
 * breaks in makes them a design decision instead of a side effect.
 */
export function RevealLines({
  lines,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.09,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useMotion(
    {
      all: () => {
        const el = ref.current;
        if (!el) return;
        // GSAP parses the CSS start state's percentage transform into `y` as
        // pixels, so both components have to be declared explicitly: without
        // `y: 0` the tween stacks 105% on top of the pixels it already read.
        gsap.fromTo(
          el.querySelectorAll(".reveal-mask > span"),
          { yPercent: 105, y: 0 },
          {
            yPercent: 0,
            y: 0,
            duration: 1,
            delay,
            stagger,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      },
      reduced: () => {
        const el = ref.current;
        if (!el) return;
        gsap.set(el.querySelectorAll(".reveal-mask > span"), { yPercent: 0 });
      },
    },
    ref,
  );

  return (
    <Tag ref={ref} className={className} data-reveal="line">
      {lines.map((line, i) => (
        <span className="reveal-mask" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Fade-and-rise for supporting content. Deliberately small movement. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 18,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useMotion(
    {
      all: () => {
        const el = ref.current;
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            delay,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      },
      reduced: () => {
        if (ref.current) gsap.set(ref.current, { opacity: 1, y: 0 });
      },
    },
    ref,
  );

  return (
    <Tag ref={ref} className={className} data-reveal="fade">
      {children}
    </Tag>
  );
}

/**
 * Image reveal: the frame wipes open while the image itself counter-scales, so
 * the picture appears to be uncovered rather than to grow.
 */
export function ImageReveal({
  children,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    {
      all: () => {
        const el = ref.current;
        if (!el) return;
        const inner = el.firstElementChild;
        const from =
          direction === "up" ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)";

        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } })
          .fromTo(
            el,
            { clipPath: from },
            { clipPath: "inset(0% 0 0 0)", duration: 1.15, ease: "expo.out" },
          )
          .fromTo(
            inner,
            { scale: 1.18 },
            { scale: 1, duration: 1.35, ease: "expo.out" },
            0,
          );
      },
    },
    ref,
    [direction],
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/**
 * Count-up. Values are real FRX capability counts, passed in from site data —
 * this component never invents a number.
 */
export function Counter({
  value,
  suffix = "",
  className = "",
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useMotion(
    {
      all: () => {
        const el = ref.current;
        if (!el) return;
        // The server renders the final value so it is correct without JS. Once
        // the tween is registered, reset to zero so it counts rather than jumps.
        el.textContent = "0" + suffix;

        const box = { n: 0 };
        gsap.to(box, {
          n: value,
          duration: 1.6,
          ease: "power2.out",
          snap: { n: 1 },
          onUpdate: () => {
            el.textContent = String(Math.round(box.n)) + suffix;
          },
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      },
      reduced: () => {
        if (ref.current) ref.current.textContent = String(value) + suffix;
      },
    },
    ref,
    [value, suffix],
  );

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {/* Rendered as the final value so it is correct with JS disabled and for
          anything reading the DOM before the tween starts. */}
      {value}
      {suffix}
    </span>
  );
}

export { ScrollTrigger };
