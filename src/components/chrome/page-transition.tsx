"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Route transition.
 *
 * A blue blade sweeps across, the new route mounts behind it, and it clears off
 * the far side. Total 0.75s — fast enough that it never becomes a toll booth
 * between pages.
 *
 * The App Router swaps content synchronously on navigation, so this runs as an
 * exit-then-enter wipe keyed on pathname rather than intercepting the click.
 */
export function PageTransition() {
  const pathname = usePathname();
  const blade = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = blade.current;
    if (!el) return;

    // The loader already covers the first paint; a wipe on top of it would be
    // two intros stacked on each other.
    if (first.current) {
      first.current = false;
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      window.dispatchEvent(new CustomEvent("frx:navigate"));
      return;
    }

    const tl = gsap.timeline();
    tl.set(el, { visibility: "visible", scaleX: 0, transformOrigin: "left center" })
      .to(el, { scaleX: 1, duration: 0.38, ease: "power3.inOut" })
      .add(() => {
        window.scrollTo(0, 0);
        window.dispatchEvent(new CustomEvent("frx:navigate"));
        ScrollTrigger.refresh();
      })
      .to(el, {
        scaleX: 0,
        transformOrigin: "right center",
        duration: 0.42,
        ease: "power3.inOut",
      })
      .set(el, { visibility: "hidden" });

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={blade}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 invisible"
      style={{
        zIndex: "var(--z-transition)",
        background:
          "linear-gradient(100deg, var(--frx-blue-deep) 0%, var(--frx-blue) 55%, var(--frx-blue-bright) 100%)",
      }}
    />
  );
}
