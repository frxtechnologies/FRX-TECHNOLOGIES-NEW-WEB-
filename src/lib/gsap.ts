"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });
}

export { gsap, ScrollTrigger };

export const EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  signal: "expo.out",
} as const;

type MediaSetup = (ctx: gsap.Context) => void;

export type MotionConditions = {
  /** >= 1024px, pointer: fine — full pinned and horizontal scenes. */
  desktop?: MediaSetup;
  /** 768–1023px — reduced complexity, no long pins. */
  tablet?: MediaSetup;
  /** < 768px — short reveals, natural vertical flow. */
  mobile?: MediaSetup;
  /** Anything above mobile. */
  aboveMobile?: MediaSetup;
  /** Every viewport, motion allowed. */
  all?: MediaSetup;
  /** prefers-reduced-motion: reduce. Use to place content in its final state. */
  reduced?: MediaSetup;
};

/**
 * One entry point for every scroll scene in the project.
 *
 * matchMedia gives each breakpoint its own timeline and — critically — reverts
 * it on resize, so a pinned desktop scene cannot leave transforms behind when
 * the viewport becomes a phone. Reduced motion gets its own branch rather than
 * a disabled flag, so content is placed rather than merely un-animated.
 */
export function useMotion(
  conditions: MotionConditions,
  scope?: RefObject<HTMLElement | null>,
  deps: unknown[] = [],
) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope?.current ?? undefined);

    const q = {
      desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      tablet:
        "(min-width: 768px) and (max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
      aboveMobile: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      all: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    } as const;

    for (const key of Object.keys(q) as (keyof typeof q)[]) {
      const setup = conditions[key];
      if (setup) mm.add(q[key], setup);
    }

    return () => mm.revert();
    // Conditions are recreated every render by design; deps control re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * ScrollTrigger measures at setup time. Fonts and images that land afterwards
 * change layout and silently invalidate every start/end value, so refresh once
 * both have settled.
 */
export function useScrollTriggerRefresh() {
  const done = useRef(false);
  useLayoutEffect(() => {
    if (done.current) return;
    done.current = true;

    const refresh = () => ScrollTrigger.refresh();

    if (document.fonts?.status === "loaded") {
      requestAnimationFrame(refresh);
    } else {
      document.fonts?.ready.then(() => requestAnimationFrame(refresh));
    }

    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);
}
