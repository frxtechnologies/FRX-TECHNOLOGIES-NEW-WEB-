"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Magnetic wrapper for the two or three most important calls to action only.
 * Maximum displacement is 8px — enough to feel alive, not enough to make anyone
 * chase a button around the screen.
 *
 * Split out of ui/button.tsx on purpose: this is the only thing in that module
 * that needs GSAP. Colocating it with `ActionButton` meant every caller that
 * only wanted the plain button — including the admin login page, which has
 * zero animation — pulled in GSAP and ScrollTrigger anyway, because a single
 * shared top-level `import { gsap }` in a file is not something a bundler can
 * tree-shake away per-export.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    gsap.to(el, {
      x: gsap.utils.clamp(-8, 8, dx * strength),
      y: gsap.utils.clamp(-8, 8, dy * strength),
      duration: 0.45,
      ease: "power3.out",
    });
  };

  const reset = () => {
    if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" });
  };

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`inline-block ${className}`}
    >
      {children}
    </span>
  );
}
