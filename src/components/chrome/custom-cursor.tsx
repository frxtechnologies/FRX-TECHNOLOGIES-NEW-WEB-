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
 * Net effect: one style write per frame while moving, and zero work while still. The dot is hidden whenever the
 * pointer leaves the window, the window loses focus or the tab is hidden.
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

    // Chrome delivers pointermove once per frame, just before rendering, so writing the transform right here
    // lands in that same frame. (An extra requestAnimationFrame hop would add a frame of delay for nothing.)
    // The last coalesced sample is used, i.e. the newest position the browser has.
    const onMove = (e: PointerEvent) => {
      const list = e.getCoalescedEvents?.();
      const last = list && list.length ? list[list.length - 1] : e;
      el.style.transform = `translate3d(${last.clientX}px, ${last.clientY}px, 0)`;
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
    document.addEventListener("visibilitychange", hide);

    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
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
