"use client";

import { useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent } from "react";
import { gsap } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { STAGE_ART } from "./how-we-build-art";
import "./how-we-build.css";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

export type Principle = { title: string; body: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** A gently waving line through `n` evenly spaced stations (y = 20 at every station), in a 1000×40 box. */
function waveLine(n: number) {
  if (n < 2) return "M0 20H1000";
  const step = 1000 / (n - 1);
  let d = "M0 20";
  for (let k = 0; k < n - 1; k++) {
    const x0 = k * step;
    const x1 = (k + 1) * step;
    const h = step / 2;
    d += `C${(x0 + h).toFixed(1)} 34 ${(x1 - h).toFixed(1)} 6 ${x1.toFixed(1)} 20`;
  }
  return d;
}

/**
 * "How we build." — a scroll-driven story of FRX's principles.
 *
 * DESKTOP (≥1024px wide, ≥700px tall, motion allowed): the section pins for a short stretch (about half a
 * screen of scrolling per stage) and a horizontal line is drawn across five stations as the visitor
 * scrolls. Each station lights up as the line reaches it, and the large illustration and explanation beside
 * it change to match. Scrolling back reverses everything.
 *
 * Built so that fast scrolling can never lag behind:
 *  · ONE scrubbed ScrollTrigger owns the scene. The line is a single scrubbed tween (it eases toward the
 *    current scroll position, so it always catches up instead of queueing), and a dot rides its tip.
 *  · The active stage is computed from the live scroll progress and applied only when it CHANGES, straight
 *    to the DOM (data attributes) — there is no React state and no work per scroll event otherwise.
 *  · Illustrations and texts are all mounted and stacked; a stage change just flips `data-state`, and CSS
 *    transitions retarget themselves, so jumping from stage 1 to 5 shows stage 5 immediately with no queue
 *    of animations to finish first. Nothing is measured per frame except the line's tip position.
 *
 * PHONES / TABLETS / short screens / reduced motion: no pinning and no scroll animation. The same markup
 * becomes a compact selector (a swipeable row of pills on phones, a vertical list beside the card on wide
 * screens): choose a stage and its illustration and text appear.
 *
 * The principles are the editable text of the About page (admin → Pages → About). The five illustrations
 * map to the five default principles; with more or fewer they cycle. Every stage's text is in the page for
 * search engines. Strictly blue / white / navy: no yellow or palette-accent colour in this section.
 */
export function HowWeBuild({ items }: { items: Principle[] }) {
  const root = useRef<HTMLElement>(null);
  const current = useRef(0);
  const story = useRef<{ start: () => number; end: () => number } | null>(null);
  const N = items.length;

  /** Make stage `n` the active one. Pure DOM writes, and only when the stage actually changes. */
  const apply = (n: number, force = false) => {
    const el = root.current;
    if (!el || (!force && n === current.current)) return;
    current.current = n;
    el.querySelectorAll<HTMLButtonElement>(".fxhb-tab").forEach((t, k) => {
      t.setAttribute("aria-selected", String(k === n));
      t.dataset.on = String(k === n);
      t.dataset.done = String(k < n);
      t.tabIndex = k === n ? 0 : -1;
    });
    const state = (k: number) => (k === n ? "on" : k < n ? "before" : "after");
    el.querySelectorAll<HTMLElement>(".fxhb-layer").forEach((l, k) => (l.dataset.state = state(k)));
    el.querySelectorAll<HTMLElement>(".fxhb-panel").forEach((p, k) => {
      p.dataset.state = state(k);
      p.inert = k !== n;
      p.setAttribute("aria-hidden", String(k !== n));
    });
    const count = el.querySelector(".fxhb-count b");
    if (count) count.textContent = pad(n + 1);
    el.querySelector<HTMLElement>(".fxhb-nav")?.style.setProperty("--p", String((n + 1) / N));
  };

  // the pinned, scroll-driven story (desktop only; everything is reverted when the screen no longer qualifies)
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || N < 2) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)", () => {
      const path = el.querySelector<SVGPathElement>(".fxhb-fill");
      const dot = el.querySelector<HTMLElement>(".fxhb-dot");
      if (!path) return;
      el.dataset.mode = "story";
      const length = path.getTotalLength();
      const place = (p: number) => {
        if (!dot) return;
        const pt = path.getPointAtLength(length * p);
        dot.style.left = `${pt.x / 10}%`;
        dot.style.transform = `translate(-50%, ${pt.y - 20}px)`;
      };
      place(0);

      const tween = gsap.fromTo(
        path,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          ease: "none",
          onUpdate() {
            place(this.progress());
          },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${(N - 1) * Math.max(320, window.innerHeight * 0.42)}`,
            pin: true,
            scrub: 0.4, // eases toward the live scroll position: it catches up, it never queues
            invalidateOnRefresh: true,
            onUpdate: (self) => apply(Math.min(N - 1, Math.round(self.progress * (N - 1)))),
            onRefresh: (self) => apply(Math.min(N - 1, Math.round(self.progress * (N - 1)))),
          },
        },
      );
      const st = tween.scrollTrigger!;
      story.current = { start: () => st.start, end: () => st.end };

      return () => {
        story.current = null;
        el.dataset.mode = "compact";
        if (dot) {
          dot.style.left = "";
          dot.style.transform = "";
        }
      };
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  if (!N) return null;

  const go = (i: number, focus = false) => {
    const el = root.current;
    if (!el) return;
    const tabs = el.querySelectorAll<HTMLButtonElement>(".fxhb-tab");
    if (story.current) {
      // pinned story: move the page to that stage; the scene follows the scroll position
      const k = Math.max(0, Math.min(N - 1, i));
      const { start, end } = story.current;
      const top = start() + (end() - start()) * (k / (N - 1));
      window.dispatchEvent(new CustomEvent("frx:scrollto", { detail: top }));
      if (focus) tabs[k]?.focus({ preventScroll: true });
      return;
    }
    const k = (i + N) % N;
    apply(k);
    if (focus) tabs[k]?.focus({ preventScroll: true });
    // keep the chosen pill in view in the swipeable row (never scrolls the page itself)
    const tab = tabs[k];
    const row = tab?.parentElement;
    if (row && tab && row.scrollWidth > row.clientWidth) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
  };

  const onKey = (e: KeyboardEvent) => {
    const tabs = Array.from(root.current?.querySelectorAll<HTMLButtonElement>(".fxhb-tab") ?? []);
    const at = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const from = at >= 0 ? at : current.current;
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowRight") go(from + 1, true);
    else if (k === "ArrowUp" || k === "ArrowLeft") go(from - 1, true);
    else if (k === "Home") go(0, true);
    else if (k === "End") go(N - 1, true);
    else return;
    e.preventDefault();
  };

  return (
    <section ref={root} className="fxhb" data-mode="compact" id="how-we-build" aria-labelledby="fxhb-title" style={{ "--n": N } as CSSProperties}>
      <div className="fx-container fxhb-pin">
        <header className="fxhb-head">
          <div>
            <p className="fx-label fxhb-eyebrow">
              <span className="fxhb-tick" aria-hidden="true" />
              Our principles
            </p>
            <h2 id="fxhb-title" className="fxhb-h fx-d1 fx-up" data-fx="reveal-lines">
              How we <span className="fxhb-blue">build.</span>
            </h2>
          </div>
          <p className="fxhb-count fx-tabular" aria-hidden="true">
            <b>{pad(1)}</b> / {pad(N)}
          </p>
        </header>

        <div className="fxhb-stage">
          <div className="fxhb-nav" role="tablist" aria-label="How we build" style={{ "--p": 1 / N } as CSSProperties}>
            <span className="fxhb-rail" aria-hidden="true">
              <i />
            </span>
            {/* the horizontal line (pinned story only): a grey path with the blue path drawn over it, and a dot on its tip */}
            <div className="fxhb-track" aria-hidden="true">
              <svg viewBox="0 0 1000 40" preserveAspectRatio="none" focusable="false">
                <path className="fxhb-base" d={waveLine(N)} />
                <path className="fxhb-fill" d={waveLine(N)} />
              </svg>
              <span className="fxhb-dot" />
            </div>
            <div className="fxhb-tabs" onKeyDown={onKey}>
              {items.map((p, i) => (
                <button
                  key={p.title}
                  type="button"
                  role="tab"
                  id={`fxhb-tab-${i}`}
                  aria-selected={i === 0}
                  aria-controls={`fxhb-panel-${i}`}
                  tabIndex={i === 0 ? 0 : -1}
                  data-on={i === 0}
                  data-done={false}
                  className="fxhb-tab"
                  onClick={() => go(i)}
                  onPointerDown={(e) => e.pointerType === "mouse" && !story.current && go(i)}
                >
                  <span className="fxhb-n fx-tabular">{pad(i + 1)}</span>
                  <span className="fxhb-t">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="fxhb-card">
            <div className="fxhb-art">
              {items.map((p, i) => {
                const Art = STAGE_ART[i % STAGE_ART.length];
                return (
                  <div key={p.title} className="fxhb-layer" data-state={i === 0 ? "on" : "after"}>
                    <Art />
                  </div>
                );
              })}
            </div>
            <div className="fxhb-panels">
              {items.map((p, i) => (
                <div
                  key={p.title}
                  role="tabpanel"
                  id={`fxhb-panel-${i}`}
                  aria-labelledby={`fxhb-tab-${i}`}
                  aria-hidden={i !== 0}
                  inert={i !== 0}
                  data-state={i === 0 ? "on" : "after"}
                  className="fxhb-panel"
                >
                  <p className="fxhb-kicker fx-tabular" aria-hidden="true">
                    Stage {pad(i + 1)}
                  </p>
                  <h3 className="fxhb-title">{p.title}</h3>
                  {p.body ? <p className="fxhb-body">{p.body}</p> : null}
                  <button type="button" className="fxhb-next" onClick={() => go(i + 1)}>
                    {i === N - 1 ? "Start over" : "Next principle"} <span aria-hidden="true">→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
