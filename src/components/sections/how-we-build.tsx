"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { STAGE_ART } from "./how-we-build-art";
import "./how-we-build.css";

export type Principle = { title: string; body: string };

/**
 * "How we build." — one compact, interactive stage instead of a long timeline.
 *
 * The visitor picks a principle from a numbered selector (a vertical list with a blue progress rail on
 * desktop, a swipeable row of pills on phones) and sees a purpose-drawn illustration for it on a navy
 * blueprint panel, with its explanation underneath. The picture draws itself in each time. The whole
 * section is roughly one screen tall, uses no scroll animation or pinning, and never loops anything.
 *
 * The principles are the same editable text as the About page (admin → Pages → About). The five
 * illustrations map to the five default principles; with more or fewer, they cycle. The text of every
 * principle is in the page for search engines (inactive panels are only `hidden`); only the active
 * illustration is rendered. Strictly blue / white / navy: no yellow or palette-accent colour here.
 */
export function HowWeBuild({ items }: { items: Principle[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!items.length) return null;

  const choose = (i: number, focus = false) => {
    const n = (i + items.length) % items.length;
    setActive(n);
    if (focus) tabs.current[n]?.focus();
    // keep the chosen pill in view in the swipeable row (never scrolls the page itself)
    const row = tabs.current[n]?.parentElement;
    const tab = tabs.current[n];
    if (row && tab && row.scrollWidth > row.clientWidth) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
  };
  const onKey = (e: KeyboardEvent) => {
    const at = tabs.current.indexOf(document.activeElement as HTMLButtonElement);
    const from = at >= 0 ? at : active;
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowRight") choose(from + 1, true);
    else if (k === "ArrowUp" || k === "ArrowLeft") choose(from - 1, true);
    else if (k === "Home") choose(0, true);
    else if (k === "End") choose(items.length - 1, true);
    else return;
    e.preventDefault();
  };

  const Art = STAGE_ART[active % STAGE_ART.length];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="fxhb" id="how-we-build" aria-labelledby="fxhb-title">
      <div className="fx-container">
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
            <b>{pad(active + 1)}</b> / {pad(items.length)}
          </p>
        </header>

        <div className="fxhb-stage">
          <div className="fxhb-nav" role="tablist" aria-label="How we build">
            <span className="fxhb-rail" aria-hidden="true">
              <i style={{ "--p": (active + 1) / items.length } as React.CSSProperties} />
            </span>
            <div className="fxhb-tabs" onKeyDown={onKey}>
              {items.map((p, i) => (
                <button
                  key={p.title}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`fxhb-tab-${i}`}
                  aria-selected={active === i}
                  aria-controls={`fxhb-panel-${i}`}
                  tabIndex={active === i ? 0 : -1}
                  data-on={active === i}
                  data-done={i < active}
                  className="fxhb-tab"
                  onClick={() => choose(i)}
                  onPointerDown={(e) => e.pointerType === "mouse" && choose(i)}
                >
                  <span className="fxhb-n fx-tabular">{pad(i + 1)}</span>
                  <span className="fxhb-t">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="fxhb-card">
            <div className="fxhb-art" aria-hidden={false}>
              <Art key={active} />
            </div>
            {items.map((p, i) => (
              <div key={p.title} role="tabpanel" id={`fxhb-panel-${i}`} aria-labelledby={`fxhb-tab-${i}`} hidden={active !== i} className="fxhb-panel">
                <h3 className="fxhb-title">{p.title}</h3>
                {p.body ? <p className="fxhb-body">{p.body}</p> : null}
                <button type="button" className="fxhb-next" onClick={() => choose(i + 1)}>
                  {i === items.length - 1 ? "Start over" : "Next principle"} <span aria-hidden="true">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
