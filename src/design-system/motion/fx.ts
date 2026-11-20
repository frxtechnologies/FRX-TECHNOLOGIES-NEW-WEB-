"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";
import { DURATION, EASE, MQ, STAGGER } from "./tokens";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

/**
 * FRX MOTION CONVENTIONS — one declarative controller.
 *
 * Mark up an element with `data-fx`, call `useFx(ref)` once on a parent, done.
 * Everything below is created inside gsap.matchMedia(), so each breakpoint gets
 * its own set of tweens and ALL of them are reverted when the viewport or the
 * reduced-motion setting changes. Nothing is left behind.
 *
 *   data-fx="reveal-lines"   headline rises line by line through a mask
 *   data-fx="reveal-words"   …word by word
 *   data-fx="reveal-chars"   …character by character (use sparingly: big moments)
 *      data-fx-trigger="load"   play immediately instead of on scroll
 *      data-fx-delay="0.2"      seconds
 *   data-fx="fade-up"        block fades and rises 24px
 *   data-fx="image-reveal"   clip-path wipe + counter-scale. Needs ONE child.
 *      data-fx-dir="up|left|right"
 *   data-fx="parallax"       scrubbed vertical drift (not on phones)
 *      data-fx-speed="0.15"     ±15% of its own height
 *   data-fx="color-scroll"   section ground/ink cross-fade while scrolling in
 *      data-fx-bg="var(--fx-accent)"  data-fx-ink="var(--fx-on-accent)"
 *      data-fx-from-bg / data-fx-from-ink   (default: page bg / ink)
 *   data-fx="pin"            desktop: pinned stage that steps through
 *                            [data-fx-step] children. data-fx-length="300%"
 *   data-fx="horizontal"     desktop: pinned horizontal travel of [data-fx-track]
 *                            phones/tablets: native snap-scroll rail instead
 *
 * Reduced motion: every element is placed in its final state. Information and
 * function are untouched; only movement is removed.
 *
 * Fonts first: line splitting measures real glyphs, so setup waits for
 * document.fonts.ready — otherwise lines break differently after the swap.
 */

type Conditions = { desktop: boolean; aboveMobile: boolean; reduce: boolean };
type Cleanup = () => void;

const toArray = <T extends Element>(root: Element, sel: string) =>
  gsap.utils.toArray<T>(root.querySelectorAll(sel));

/** Resolve a CSS expression ("var(--fx-accent)", "#fff") to a concrete colour. */
function resolveColor(host: HTMLElement, value: string): string {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  probe.style.color = value;
  host.appendChild(probe);
  const out = getComputedStyle(probe).color;
  probe.remove();
  return out;
}

function build(root: HTMLElement, c: Conditions, splits: SplitText[], cleanups: Cleanup[]) {
  /* ---- text reveals ----------------------------------------------------- */
  toArray<HTMLElement>(root, '[data-fx^="reveal-"]').forEach((el) => {
    if (c.reduce) {
      gsap.set(el, { visibility: "visible" });
      return;
    }
    const kind = (el.dataset.fx ?? "reveal-lines").replace("reveal-", "") as
      | "lines"
      | "words"
      | "chars";
    const onLoad = el.dataset.fxTrigger === "load";
    const delay = Number(el.dataset.fxDelay ?? 0);
    let played = false;

    const split = SplitText.create(el, {
      type: kind === "chars" ? "lines,words,chars" : kind === "words" ? "lines,words" : "lines",
      mask: "lines",
      autoSplit: true,
      aria: "auto",
      onSplit(self) {
        gsap.set(el, { visibility: "visible" });
        // Bricolage runs at line-heights below 1: pad each clip box (and cancel the
        // padding with a negative margin) so letter tops and descenders survive the mask.
        self.masks.forEach((m) => {
          (m as HTMLElement).style.paddingBlock = "0.12em";
          (m as HTMLElement).style.marginBlock = "-0.12em";
        });
        // Re-splits (resize / late font swap) must not replay a finished reveal.
        if (played) return;
        return gsap.from(self[kind], {
          yPercent: 115,
          duration: kind === "chars" ? DURATION.slow : DURATION.cinematic,
          ease: EASE.out,
          stagger: STAGGER[kind],
          delay,
          scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 88%", once: true },
          onComplete: () => {
            played = true;
          },
        });
      },
    });
    splits.push(split);
  });

  /* ---- fade up ----------------------------------------------------------- */
  toArray<HTMLElement>(root, '[data-fx="fade-up"]').forEach((el) => {
    gsap.set(el, { visibility: "visible" });
    if (c.reduce) return;
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: DURATION.slow,
      ease: EASE.outSoft,
      delay: Number(el.dataset.fxDelay ?? 0),
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  /* ---- image reveal ------------------------------------------------------ */
  toArray<HTMLElement>(root, '[data-fx="image-reveal"]').forEach((el) => {
    gsap.set(el, { visibility: "visible" });
    if (c.reduce) return;
    const inner = el.firstElementChild as HTMLElement | null;
    const dir = el.dataset.fxDir ?? "up";
    const from =
      dir === "left"
        ? "inset(0 100% 0 0)"
        : dir === "right"
          ? "inset(0 0 0 100%)"
          : "inset(100% 0 0 0)";
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    tl.fromTo(
      el,
      { clipPath: from },
      { clipPath: "inset(0% 0% 0% 0%)", duration: DURATION.cinematic, ease: EASE.out },
    );
    if (inner) {
      tl.fromTo(
        inner,
        { scale: 1.18 },
        { scale: 1, duration: DURATION.cinematic * 1.15, ease: EASE.out },
        0,
      );
    }
  });

  /* ---- parallax ---------------------------------------------------------- */
  if (c.aboveMobile && !c.reduce) {
    toArray<HTMLElement>(root, '[data-fx="parallax"]').forEach((el) => {
      const s = Number(el.dataset.fxSpeed ?? 0.15) * 100;
      gsap.fromTo(
        el,
        { yPercent: s },
        {
          yPercent: -s,
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
  }

  /* ---- scroll-linked colour --------------------------------------------- */
  if (!c.reduce) {
    toArray<HTMLElement>(root, '[data-fx="color-scroll"]').forEach((el) => {
      const d = el.dataset;
      const col = (v: string | undefined, fallback: string) => () =>
        resolveColor(root, v ?? fallback);
      gsap.fromTo(
        el,
        {
          backgroundColor: col(d.fxFromBg, "var(--fx-bg)"),
          color: col(d.fxFromInk, "var(--fx-ink)"),
        },
        {
          backgroundColor: col(d.fxBg, "var(--fx-bg)"),
          color: col(d.fxInk, "var(--fx-ink)"),
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 25%",
            scrub: true,
            invalidateOnRefresh: true, // re-resolves tokens after a theme swap
          },
        },
      );
    });
  }

  /* ---- pinned stage ------------------------------------------------------ */
  if (c.desktop && !c.reduce) {
    toArray<HTMLElement>(root, '[data-fx="pin"]').forEach((el) => {
      const steps = toArray<HTMLElement>(el, "[data-fx-step]");
      el.classList.add("fx-pin--live");
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: `+=${el.dataset.fxLength ?? "300%"}`,
        pin: true,
        scrub: true,
        onUpdate(self) {
          const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
          steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
          el.style.setProperty("--fx-progress", self.progress.toFixed(3));
        },
      });
      steps[0]?.classList.add("is-active");
      cleanups.push(() => {
        st.kill();
        el.classList.remove("fx-pin--live");
        steps.forEach((s) => s.classList.remove("is-active"));
      });
    });

    /* ---- horizontal travel ---------------------------------------------- */
    toArray<HTMLElement>(root, '[data-fx="horizontal"]').forEach((el) => {
      const track = el.querySelector<HTMLElement>("[data-fx-track]");
      if (!track) return;
      el.classList.add("fx-hz--live");
      const dist = () => Math.max(0, track.scrollWidth - el.clientWidth);
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: EASE.scrub,
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      cleanups.push(() => {
        tween.kill();
        el.classList.remove("fx-hz--live");
        gsap.set(track, { clearProps: "transform" });
      });
    });
  }
}

/** Attach every data-fx convention found under `scope`. */
export function useFx(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add({ desktop: MQ.desktop, aboveMobile: MQ.aboveMobile, reduce: MQ.reduce }, (ctx) => {
      const conditions = ctx.conditions as unknown as Conditions;
      const splits: SplitText[] = [];
      const cleanups: Cleanup[] = [];
      let dead = false;

      document.fonts.ready.then(() => {
        if (dead) return;
        // ctx.add keeps tweens created after the await inside this context,
        // so mm.revert() still reaches them.
        ctx.add?.(() => build(root, conditions, splits, cleanups));
        ScrollTrigger.refresh();
      });

      return () => {
        dead = true;
        cleanups.forEach((fn) => fn());
        splits.forEach((s) => s.revert());
      };
    });

    // A theme swap changes what color-scroll tokens resolve to.
    const themeObserver = new MutationObserver(() => ScrollTrigger.refresh());
    themeObserver.observe(root.closest("[data-fx-theme]") ?? root, {
      attributes: true,
      attributeFilter: ["data-fx-theme"],
    });

    return () => {
      themeObserver.disconnect();
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Page-transition recipe: a blade covers the screen, the route swaps while it
 * is covered, the blade exits. Same movement as the existing PageTransition
 * component, parameterised so it can be driven from anywhere.
 */
export function fxWipe(blade: HTMLElement, onCovered?: () => void) {
  if (window.matchMedia(MQ.reduce).matches) {
    onCovered?.();
    return gsap.timeline();
  }
  return gsap
    .timeline()
    .set(blade, { visibility: "visible", scaleX: 0, transformOrigin: "left center" })
    .to(blade, { scaleX: 1, duration: DURATION.base * 0.8, ease: EASE.inOut })
    .add(() => onCovered?.())
    .to(blade, {
      scaleX: 0,
      transformOrigin: "right center",
      duration: DURATION.base * 0.9,
      ease: EASE.inOut,
    })
    .set(blade, { visibility: "hidden" });
}
