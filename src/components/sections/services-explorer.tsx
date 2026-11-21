"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SERVICE_LABEL, type Service } from "@/lib/services";
import { useArtLife } from "@/components/motion/use-art-life";
import { ServiceScene } from "./service-scene";
import "./service-scene.css";
import "./services-explorer.css";

const TONES = ["tint", "ink", "blue", "paper"] as const;
export type ExplorerService = Service & { artUrl?: string | null };

/**
 * "What we make possible." — the services as an interactive explorer, not a scroll animation.
 *
 * A clear selector (a numbered list beside the stage on desktop, a swipeable row of pills on phones)
 * and one panel at a time: the service name, a one-line summary, what it covers, a link to its page,
 * and its existing illustration. Nothing waits on scroll, nothing is pinned, nothing is hidden behind a
 * transition: the text of the selected service is on screen immediately and every service's text is in
 * the page for search engines (inactive panels are only `hidden`).
 *
 * Keyboard: the selector is a proper tablist (arrow keys / Home / End; the selected tab is the only tab
 * stop). Only the visible scene's artwork is animated, so choosing a service costs almost nothing.
 */
export function ServicesExplorer({ services }: { services: ExplorerService[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useArtLife(panel, [active]); // life loops (bobbing, blinking…) only for the scene on screen

  // keep the chosen pill in view in the swipeable row (phones) — never scrolls the page itself
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const tab = tabs.current[active];
    const row = tab?.parentElement;
    if (!tab || !row || row.scrollWidth <= row.clientWidth) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  const choose = (i: number, focus = false) => {
    const n = (i + services.length) % services.length;
    setActive(n);
    if (focus) tabs.current[n]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowRight") choose(active + 1, true);
    else if (k === "ArrowUp" || k === "ArrowLeft") choose(active - 1, true);
    else if (k === "Home") choose(0, true);
    else if (k === "End") choose(services.length - 1, true);
    else return;
    e.preventDefault();
  };

  return (
    <section className="fxse" id="services" aria-labelledby="fxse-title">
      <div className="fx-container">
        <header className="fxse-head">
          <p className="fx-label fxse-eyebrow">Services</p>
          <h2 id="fxse-title" className="fxse-h fx-d1 fx-up" data-fx="reveal-lines">
            What we make possible.
          </h2>
          <p className="fx-lead fxse-lead">Choose a service to see what it covers.</p>
        </header>

        <div className="fxse-grid">
          <div className="fxse-tabs" role="tablist" aria-label="Services" onKeyDown={onKey}>
            {services.map((s, i) => (
              <button
                key={s.slug}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`fxse-tab-${s.slug}`}
                aria-selected={active === i}
                aria-controls={`fxse-panel-${s.slug}`}
                tabIndex={active === i ? 0 : -1}
                data-on={active === i}
                className="fxse-tab"
                onClick={() => choose(i)}
              >
                <span className="fxse-n fx-tabular">{s.index}</span>
                <span className="fxse-t">{SERVICE_LABEL[s.slug]}</span>
                <span className="fxse-arr" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>

          <div className="fxse-stage">
            {services.map((s, i) => (
              <div
                key={s.slug}
                ref={active === i ? panel : undefined}
                role="tabpanel"
                id={`fxse-panel-${s.slug}`}
                aria-labelledby={`fxse-tab-${s.slug}`}
                hidden={active !== i}
                className="fxse-panel"
              >
                <div className="fxsp-scene" data-tone={TONES[i % TONES.length]}>
                  <ServiceScene slug={s.slug} art={s.art} artUrl={s.artUrl} />
                </div>

                <div className="fxse-copy">
                  <p className="fxse-kicker fx-label">{s.index} — Service</p>
                  <h3 className="fxse-title">{SERVICE_LABEL[s.slug]}</h3>
                  <p className="fxse-tag">{s.tagline}</p>
                  <p className="fxse-sum">{s.summary}</p>
                  <ul className="fxse-caps" aria-label={`${s.name}: what it covers`}>
                    {s.capabilities.slice(0, 6).map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <Link href={`/services/${s.slug}`} className="fx-btn fx-btn--ink fx-hover-shift fxse-cta">
                    Explore {s.name} <span className="fx-shift" aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fxse-foot">
          <Link href="/services" className="fx-btn fx-btn--outline fx-hover-shift">
            All services <span className="fx-shift" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
