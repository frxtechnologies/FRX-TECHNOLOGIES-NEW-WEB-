"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desktop cursor — a single dot, nothing else.
 *
 * The previous version ran a trailing ring with its own easing, four GSAP
 * tweens per state change, and an `element.closest()` walk on *every*
 * pointermove. That last one is the expensive part: pointermove fires at the
 * display's refresh rate, and doing DOM ancestry work inside it competes with
 * the scroll scenes for the same frame budget.
 *
 * What replaces it:
 *  · position is written once per animation frame, not once per event
 *  · the write is a direct `transform` string — no tween, no interpolation, so
 *    the dot sits exactly under the pointer instead of chasing it
 *  · hover state comes from `pointerover`, which fires only when the element
 *    under the pointer actually changes, and the scale is a CSS transition
 *
 * Net effect: one style write per frame while moving, and zero work while still.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");

    const evaluate = () => setEnabled(fine.matches && wide.matches && !reduced.matches);
    evaluate();

    fine.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);
    wide.addEventListener("change", evaluate);
    return () => {
      fine.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
      wide.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = dot.current;
    if (!el) return;

    document.body.classList.add("has-custom-cursor");

    let x = -100;
    let y = -100;
    let frame = 0;
    let dirty = false;

    const render = () => {
      frame = 0;
      if (!dirty) return;
      dirty = false;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const schedule = () => {
      dirty = true;
      // Coalesce every move that lands within the same frame into one write.
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      schedule();
      if (!el.dataset.visible) el.dataset.visible = "1";
    };

    // Fires only when the hovered element changes, so the ancestry walk happens
    // a handful of times per second rather than a hundred.
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'a, button, input, textarea, select, summary, label, [role="button"], [data-cursor]',
      );
      el.dataset.state = interactive ? "active" : "idle";
    };

    const hide = () => delete el.dataset.visible;

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      if (frame) cancelAnimationFrame(frame);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dot}
      className="frx-cursor"
      style={{ zIndex: "var(--z-cursor)" }}
      aria-hidden="true"
    >
      <span className="frx-cursor-dot" />
    </div>
  );
}
