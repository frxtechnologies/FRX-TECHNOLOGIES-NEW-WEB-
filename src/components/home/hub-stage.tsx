"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Gives the hero illustration (art/hub.tsx) its restrained interactivity. The artwork itself is untouched.
 *
 *  · A very slow float (CSS, in fx-hub.css) — transform only, paused whenever the hero is off screen.
 *  · Desktop with a mouse only: the whole illustration leans a few degrees toward the pointer (a soft 3D
 *    tilt), and the product window and the AI chip drift a few units more than the platforms beneath them,
 *    which reads as depth. The response is strongest when the pointer is near the illustration and eases
 *    off with distance, so it feels attentive rather than twitchy.
 *  · Touch screens and reduced motion get none of the pointer behaviour (reduced motion also loses the float).
 *
 * Cost: one passive pointermove listener that exists only while the hero is on screen; each move writes six
 * `quickTo` targets (transforms) and reads no layout — the illustration's centre is cached, in page
 * coordinates, and refreshed only when it is resized or the page finishes loading.
 */
export function HubStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    const win = el.querySelector<SVGGElement>(".fxhub-win");
    const chip = el.querySelector<SVGGElement>(".fxhub-chip");

    gsap.set(el, { transformPerspective: 1100, transformOrigin: "50% 58%" });
    const ease = { duration: 1.1, ease: "power3.out" } as const;
    const tiltY = gsap.quickTo(el, "rotationY", ease);
    const tiltX = gsap.quickTo(el, "rotationX", ease);
    const winX = win ? gsap.quickTo(win, "x", ease) : null;
    const winY = win ? gsap.quickTo(win, "y", ease) : null;
    const chipX = chip ? gsap.quickTo(chip, "x", ease) : null;
    const chipY = chip ? gsap.quickTo(chip, "y", ease) : null;

    const settle = () => {
      tiltY(0);
      tiltX(0);
      winX?.(0);
      winY?.(0);
      chipX?.(0);
      chipY?.(0);
    };

    // the illustration's centre and half-size, in page coordinates (no layout reads while the pointer moves)
    let cx = 0;
    let cy = 0;
    let hw = 1;
    let hh = 1;
    const measure = () => {
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2 + window.scrollX;
      cy = r.top + r.height / 2 + window.scrollY;
      hw = Math.max(r.width / 2, 120);
      hh = Math.max(r.height / 2, 100);
    };
    measure();

    const onMove = (e: PointerEvent) => {
      // where the pointer is relative to the illustration, in "half-sizes" (1 = its edge)
      const u = (e.pageX - cx) / hw;
      const v = (e.pageY - cy) / hh;
      const nx = Math.max(-1, Math.min(1, u));
      const ny = Math.max(-1, Math.min(1, v));
      // attention: full on and around it, easing to 0.3 as the pointer moves well away within the hero
      const att = Math.max(0.3, 1 - Math.max(0, Math.hypot(u, v) - 1) / 2.4);
      tiltY(nx * 6 * att);
      tiltX(-ny * 4.5 * att);
      winX?.(nx * 8 * att);
      winY?.(ny * 5 * att);
      chipX?.(nx * 5 * att);
      chipY?.(ny * 3 * att);
    };

    let on = false;
    const listen = (v: boolean) => {
      if (v === on) return;
      on = v;
      if (v) {
        measure();
        window.addEventListener("pointermove", onMove, { passive: true });
      } else {
        window.removeEventListener("pointermove", onMove);
        settle();
      }
    };

    const io = new IntersectionObserver(([e]) => listen(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const onLoad = () => measure();
    window.addEventListener("load", onLoad);
    document.documentElement.addEventListener("pointerleave", settle);

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("load", onLoad);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", settle);
      gsap.killTweensOf([el, win, chip]);
      gsap.set([el, win, chip].filter(Boolean), { clearProps: "transform" });
    };
  }, []);

  return (
    <span ref={ref} className="fxhub-stage">
      {children}
    </span>
  );
}
