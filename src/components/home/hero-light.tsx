"use client";

import { useEffect, useRef } from "react";

/**
 * The FRX light system.
 *
 * A volumetric blue beam originating off the lower-right, built from layered
 * conic and linear gradients on a handful of skewed planes. Pure CSS — no
 * canvas, no WebGL, no shader compile on a phone — and it responds to the
 * pointer with a small, damped drift.
 *
 * Dark mode: electric blue against true black.
 * Light mode: the same geometry read as refracted light across white — lower
 * opacity, warmer falloff, so it stays premium rather than turning into a
 * washed-out gradient.
 */
export function HeroLight() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const beam = el.querySelector<HTMLElement>(".beam-group");
    const halo = el.querySelector<HTMLElement>(".beam-halo");
    if (!beam || !halo) return;

    // Two CSS custom properties drive the drift, eased by a plain transition on
    // the elements. The previous version ran four GSAP tweens per pointermove,
    // which meant four tween instances competing with the scroll scenes for the
    // same frame — for a 3% parallax nobody would notice was tweened.
    let tx = 0;
    let ty = 0;
    let frame = 0;

    const render = () => {
      frame = 0;
      beam.style.transform = `translate3d(${tx * 3.5}%, ${ty * 2.5}%, 0)`;
      halo.style.transform = `translate3d(${tx * -7}%, ${ty * -5}%, 0)`;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(render);
    };

    // Only track while the hero is actually on screen. Past the fold this
    // listener is pure waste.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener("pointermove", onMove, { passive: true });
        } else {
          window.removeEventListener("pointermove", onMove);
        }
      },
      { threshold: 0 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={root} className="hero-light pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Ambient wash behind everything. */}
      <div className="beam-halo absolute inset-0" />

      {/* The beam itself: three planes at slightly different angles so the
          light has volume instead of reading as one flat wedge. */}
      <div className="beam-group absolute inset-0">
        <span className="beam beam-1" />
        <span className="beam beam-2" />
        <span className="beam beam-3" />
      </div>

      {/* A single hairline that traces the beam's leading edge — the same blue
          signal used in the loader and under section headings. */}
      <span className="beam-edge" />

      <div className="signal-grid" />
    </div>
  );
}
