"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A lightweight "section became visible" entrance for a grid of cards. It is NOT scroll-scrubbed and
 * pins nothing: one IntersectionObserver fires once, the cards then run a short CSS stagger
 * (see work.css). Cards are only hidden once this has mounted AND the visitor allows motion, so
 * content is never withheld without JavaScript, and reduced-motion visitors see everything at once.
 * Cards that mount later (e.g. after a filter change) animate in on their own.
 */
export function RevealGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      el.dataset.in = "";
      return;
    }
    el.dataset.armed = "";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.in = "";
        io.disconnect();
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
