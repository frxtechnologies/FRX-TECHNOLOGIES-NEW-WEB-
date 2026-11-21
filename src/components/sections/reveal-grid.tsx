"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/**
 * The motion for a grid of project cards. Pure GSAP, no ScrollTrigger and no pinning, so scrolling is never
 * touched and no card is ever held back from the visitor for long.
 *
 * ENTRANCE (once, when the grid first scrolls into view; replayed quickly when the filter changes):
 * each card fades up, its picture is revealed by a mask that wipes open while the image settles from a
 * slight zoom, and then the category, title, description and link rise in one after another.
 *
 * HOVER (mouse only): the picture drifts a few pixels against the pointer and eases to a slight zoom, so
 * the card feels lit from where you are. Written with `quickTo`, so there is no tween churn per move.
 *
 * Safety: cards are only hidden once this has mounted AND motion is allowed; without JavaScript or with
 * reduced motion everything is simply there. Every tween clears its inline styles when it finishes, so the
 * layout, the CSS hover states and focus rings are never left in an animated state. All of it is reverted
 * on unmount.
 */
export function RevealGrid({ children, className = "", revealKey = "" }: { children: ReactNode; className?: string; revealKey?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);

  // entrance
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      el.dataset.in = "";
      return;
    }
    const cards = () => gsap.utils.toArray<HTMLElement>(".fxw-card", el);

    const reveal = (quick: boolean) => {
      const list = cards();
      if (!list.length) return;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.set(list.flatMap((c) => [c, ...c.querySelectorAll<HTMLElement>(".fxw-media, .fxw-fg, .fxw-no, .fxw-cat, .fxw-title, .fxw-desc, .fxw-go")]), { clearProps: "opacity,transform,clipPath,visibility" });
        },
      });
      list.forEach((card, i) => {
        const media = card.querySelector<HTMLElement>(".fxw-media");
        const fg = card.querySelector<HTMLElement>(".fxw-fg");
        const meta = card.querySelectorAll<HTMLElement>(".fxw-cat, .fxw-title, .fxw-desc, .fxw-go");
        const at = i * (quick ? 0.04 : 0.09);
        tl.fromTo(card, { opacity: 0, y: quick ? 14 : 30 }, { opacity: 1, y: 0, duration: quick ? 0.4 : 0.7 }, at);
        if (!quick) {
          if (media) tl.fromTo(media, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.85, ease: "power4.inOut" }, at + 0.05);
          if (fg) tl.fromTo(fg, { scale: 1.18 }, { scale: 1, duration: 1.2, ease: "power3.out" }, at + 0.05);
          if (meta.length) tl.fromTo(meta, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.06 }, at + 0.4);
        }
      });
    };

    // hide the cards (inline) BEFORE releasing the CSS hold, so nothing flashes
    const arm = () => {
      el.dataset.armed = "";
    };
    arm();

    if (seen.current) {
      // filter changed: new cards were mounted visible; replay a quick staggered fade
      gsap.set(cards(), { opacity: 0 });
      el.dataset.in = "";
      reveal(true);
      return;
    }

    const ctx = gsap.context(() => {});
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        seen.current = true;
        ctx.add(() => {
          gsap.set(cards(), { opacity: 0 });
          el.dataset.in = "";
          reveal(false);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [revealKey]);

  // hover: the picture drifts against the pointer and eases to a slight zoom (mouse only)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fns = new WeakMap<HTMLElement, { x: (v: number) => void; y: (v: number) => void; s: (v: number) => void }>();
    const parts = (card: HTMLElement) => {
      let f = fns.get(card);
      if (!f) {
        const fg = card.querySelector<HTMLElement>(".fxw-fg");
        if (!fg) return null;
        f = {
          x: gsap.quickTo(fg, "x", { duration: 0.7, ease: "power3.out" }) as (v: number) => void,
          y: gsap.quickTo(fg, "y", { duration: 0.7, ease: "power3.out" }) as (v: number) => void,
          s: gsap.quickTo(fg, "scale", { duration: 0.8, ease: "power3.out" }) as (v: number) => void,
        };
        fns.set(card, f);
      }
      return f;
    };
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>("a.fxw-card");
      if (!card) return;
      const f = parts(card);
      if (!f) return;
      const r = card.getBoundingClientRect();
      f.x(-((e.clientX - r.left) / r.width - 0.5) * 16);
      f.y(-((e.clientY - r.top) / r.height - 0.5) * 12);
      f.s(1.05);
    };
    const onOut = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>("a.fxw-card");
      if (!card || card.contains(e.relatedTarget as Node | null)) return;
      const f = fns.get(card);
      f?.x(0);
      f?.y(0);
      f?.s(1);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerout", onOut, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerout", onOut);
      gsap.set(el.querySelectorAll(".fxw-fg"), { clearProps: "transform" });
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
