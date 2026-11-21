"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";

/**
 * Stops paying for animation nobody can see.
 *
 * Every page section and the footer is watched; while one is more than a screen away from the viewport it
 * gets `data-offscreen`, and:
 *   - every CSS animation inside it is paused (see the rule in glow.css) — marquees, glows, bobs, draws;
 *   - every GSAP tween whose target lives inside it is paused (the illustration loops: waves, cogs, blinks).
 * Both resume at the same frame they stopped on as soon as the section approaches the screen again, so there
 * is no restart, no jump, and nothing is ever visibly paused (the margin is a full viewport of look-ahead).
 *
 * Measured with the idle rig: main-thread busy time on the home page dropped from ~83% to ~24% with only
 * the CSS half of this in place. Entrance animations are unaffected — they have not started yet when the
 * section is far away, and they begin as it arrives.
 *
 * Reduced motion: nothing animates there anyway, so nothing is observed.
 */
export function OffscreenPause() {
  // the layout persists across client-side navigations, so the sections are re-collected for every route
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tweensIn = (el: Element) =>
      gsap.globalTimeline
        .getChildren(true, true, true)
        .filter((t) => {
          const targets = (t as gsap.core.Tween).targets?.() ?? [];
          return targets.some((n) => n instanceof Element && el.contains(n));
        });

    const paused = new WeakMap<Element, gsap.core.Animation[]>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target;
          if (e.isIntersecting) {
            el.removeAttribute("data-offscreen");
            const list = paused.get(el);
            if (list) {
              list.forEach((t) => t.resume());
              paused.delete(el);
            }
          } else {
            el.setAttribute("data-offscreen", "");
            // only pause what is actually running, so we never resume something that was meant to stay paused
            const running = tweensIn(el).filter((t) => !t.paused());
            running.forEach((t) => t.pause());
            if (running.length) paused.set(el, running);
          }
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );

    const watch = () => document.querySelectorAll("main > section, #main section, footer").forEach((s) => io.observe(s));
    watch();
    // client islands mount a little after hydration; pick up anything added since
    const again = window.setTimeout(watch, 1500);

    return () => {
      window.clearTimeout(again);
      io.disconnect();
      document.querySelectorAll("[data-offscreen]").forEach((n) => n.removeAttribute("data-offscreen"));
      document.querySelectorAll("main > section, #main section, footer").forEach((s) => {
        paused.get(s)?.forEach((t) => t.resume());
      });
    };
  }, [pathname]);

  return null;
}
