"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger, gsap } from "@/lib/gsap";

/**
 * Lenis drives the scroll position and GSAP's ticker drives Lenis, so scroll
 * scenes and the smoothing run on one clock. Without that, ScrollTrigger reads
 * a position Lenis has already moved past and pinned scenes judder.
 *
 * Deliberately light smoothing: a heavy lerp reads as input lag, not polish.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Touch devices already have excellent native inertia. Overriding it
      // makes phones feel worse, not better.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Keep in-page anchors and the skip link working.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };
    document.addEventListener("click", onClick);

    // Route changes must reset both the scroller and its measurements.
    const onNavigate = () => {
      lenis.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
    };
    window.addEventListener("frx:navigate", onNavigate);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("frx:navigate", onNavigate);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
