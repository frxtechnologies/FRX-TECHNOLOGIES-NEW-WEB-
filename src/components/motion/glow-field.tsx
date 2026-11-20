"use client";

import { useEffect } from "react";

/**
 * A soft, brand-coloured glow that follows the pointer inside sections marked
 * `data-glow` — and nowhere else. One passive pointermove listener for the whole
 * site (rAF-throttled) writes two CSS variables on the hovered section; the glow
 * itself is a single gradient on a pseudo-element behind the content (see
 * glow.css), so it never touches layout, never blurs anything and cannot cover
 * text. Colours come from the active palette, so it adapts to all eight looks.
 *
 * Touch / coarse pointers and reduced-motion visitors get no tracking: the CSS
 * shows a quiet, fixed ambient glow instead.
 */
export function GlowField() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let frame = 0;
    let target: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    let active: HTMLElement | null = null;

    const paint = () => {
      frame = 0;
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--gx", `${x - r.left}px`);
      target.style.setProperty("--gy", `${y - r.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      const sec = (e.target as Element | null)?.closest<HTMLElement>("[data-glow]") ?? null;
      if (sec !== active) {
        active?.removeAttribute("data-glow-on");
        sec?.setAttribute("data-glow-on", "");
        active = sec;
      }
      target = sec;
      x = e.clientX;
      y = e.clientY;
      if (sec && !frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      active?.removeAttribute("data-glow-on");
      active = null;
      target = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      active?.removeAttribute("data-glow-on");
    };
  }, []);

  return null;
}
