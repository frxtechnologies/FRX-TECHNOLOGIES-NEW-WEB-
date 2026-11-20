"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/gsap";
import { SERVICE_LABEL, type Service } from "@/lib/services";
import { useArtLife } from "@/components/motion/use-art-life";
import { ServiceScene } from "./service-scene";
import "./services-pinned.css";

const TONES = ["tint", "ink", "blue", "paper"] as const;
/** Only the properties GSAP animates — never `all`, which would also strip React inline styles (chip positions). */
const ANIMATED = "opacity,visibility,transform,translate,rotate,scale";
export type PinnedService = Service & { artUrl?: string | null };

/**
 * "This is our thing." — the services as a guided scroll.
 *
 * DESKTOP (≥1024px, motion allowed): the section pins for ~0.42 viewport-heights
 * per service (≈3.8 screens for nine — deliberately short), and the scroll position
 * selects the active service. Changing service plays a timed transition (not a
 * scrub, so a fast flick still resolves cleanly): the old title slides up through
 * its mask, the scene's layers fall away, then the new service's title rises and
 * its character and interface chips arrive on staggered layers. A numbered rail on
 * the left fills as you progress and each tick jumps to its service. The pin
 * releases after the last one and the page continues normally.
 *
 * Layout makes overlap impossible: copy and scene are separate grid columns, the
 * scene is its own clipped panel, and every moving thing lives on its own layer.
 *
 * MOBILE / TABLET / reduced motion: no pin. Each service is a compact card; tapping
 * a header opens its scene and description (one open at a time), with a slim
 * progress bar pinned under the nav. Natural scrolling throughout.
 */
export function ServicesPinned({ services }: { services: PinnedService[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const jump = useRef<((i: number) => void) | null>(null);
  useArtLife(root);

  /* ---- desktop: pinned, scroll-selected ------------------------------------- */
  useMotion(
    {
      desktop: () => {
        const el = root.current;
        const pin = el?.querySelector<HTMLElement>(".fxsp-pin");
        if (!el || !pin) return;
        const steps = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".fxsp-step"));
        const N = steps.length;
        let cur = 0;

        const bits = (s: HTMLElement) => ({
          title: s.querySelector<HTMLElement>(".fxsp-title-in"),
          body: s.querySelectorAll<HTMLElement>("[data-l='body']"),
          layers: s.querySelectorAll<HTMLElement>(".fxsp-l"),
        });

        steps.forEach((s, i) => {
          gsap.set(s, { autoAlpha: i === 0 ? 1 : 0 });
          s.inert = i !== 0;
        });

        let tl: gsap.core.Timeline | null = null;
        const go = (to: number) => {
          if (to === cur) return;
          const from = cur;
          cur = to;
          setActive(to);
          const a = bits(steps[from]);
          const b = bits(steps[to]);
          tl?.kill();
          // anything mid-flight from a previous change snaps to a clean state first
          steps.forEach((s, i) => {
            if (i !== from && i !== to) gsap.set(s, { autoAlpha: 0 });
          });
          steps[from].inert = true;
          steps[to].inert = false;

          const dir = to > from ? 1 : -1;
          tl = gsap
            .timeline({ defaults: { overwrite: "auto" } })
            // out
            .to(a.title, { yPercent: -112 * dir, duration: 0.32, ease: "power3.in" }, 0)
            .to(a.body, { opacity: 0, y: -14 * dir, duration: 0.22, stagger: 0.03, ease: "power2.in" }, 0)
            .to(a.layers, { opacity: 0, scale: 0.9, y: -30 * dir, duration: 0.3, stagger: 0.025, ease: "power2.in" }, 0)
            .set(steps[from], { autoAlpha: 0 }, 0.34)
            // in
            .set(steps[to], { autoAlpha: 1 }, 0.3)
            .fromTo(b.title, { yPercent: 112 * dir }, { yPercent: 0, duration: 0.75, ease: "expo.out" }, 0.32)
            .fromTo(b.body, { opacity: 0, y: 22 * dir }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 0.45)
            .fromTo(
              b.layers,
              { opacity: 0, scale: 0.8, y: 56 * dir, rotate: -4 * dir },
              { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.95, stagger: 0.07, ease: "back.out(1.5)" },
              0.36,
            );
        };

        const st = ScrollTrigger.create({
          // No JS pin: the stage is `position: sticky` inside a section that is exactly
          // one screen + 0.42 screens per service tall (see the CSS). Sticky stays on the
          // compositor — no fixed↔static flip, so no layout-shift report and no jitter.
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            el.style.setProperty("--fxsp-p", self.progress.toFixed(3));
            go(Math.min(N - 1, Math.floor(self.progress * N)));
          },
        });

        jump.current = (i: number) => {
          const span = st.end - st.start;
          window.scrollTo({ top: st.start + (span * (i + 0.5)) / N, behavior: "smooth" });
        };

        return () => {
          jump.current = null;
          tl?.kill();
          st.kill();
          steps.forEach((s) => {
            s.inert = false;
            gsap.set(s, { clearProps: ANIMATED });
            s.querySelectorAll(".fxsp-title-in, [data-l='body'], .fxsp-l").forEach((n) => gsap.set(n, { clearProps: ANIMATED }));
          });
          el.style.removeProperty("--fxsp-p");
          setActive(0);
        };
      },
    },
    root,
    [services.length],
  );

  /* ---- mobile + tablet: slim progress bar, natural scrolling ----------------- */
  const progress = () => {
    const el = root.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 40%",
      onUpdate: (self) => el.style.setProperty("--fxsp-p", self.progress.toFixed(3)),
    });
    return () => st.kill();
  };
  useMotion({ mobile: progress, tablet: progress }, root);

  const open = (i: number) => {
    if (jump.current) jump.current(i);
    else setActive(i);
  };

  return (
    <section
      ref={root}
      className="fxsp"
      id="services"
      aria-labelledby="fxsp-title"
      style={{ "--fxsp-n": services.length } as CSSProperties}
    >
      <div className="fxsp-pin">
        <div className="fx-container fxsp-head">
          <h2 id="fxsp-title" className="fxsp-h fx-d1 fx-up" data-fx="reveal-lines">
            This is our thing.
          </h2>
          <p className="fxsp-count fx-label fx-tabular" aria-hidden="true">
            <b>{String(active + 1).padStart(2, "0")}</b> / {String(services.length).padStart(2, "0")}
          </p>
        </div>

        <div className="fx-container fxsp-main">
          {/* progress: a vertical rail on desktop, a slim bar under the nav on small screens */}
          <nav className="fxsp-rail" aria-label="Services">
            <span className="fxsp-track" aria-hidden="true">
              <i className="fxsp-fill" />
            </span>
            <ol>
              {services.map((s, i) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    className="fxsp-tick fx-label fx-tabular"
                    data-on={active === i}
                    aria-label={`Show ${SERVICE_LABEL[s.slug]}`}
                    aria-current={active === i ? "step" : undefined}
                    onClick={() => open(i)}
                  >
                    {s.index}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="fxsp-steps">
            {services.map((s, i) => (
              <article key={s.slug} className="fxsp-step" data-open={active === i} data-tone={TONES[i % TONES.length]}>
                <header className="fxsp-bar">
                  <button
                    type="button"
                    className="fxsp-toggle"
                    aria-expanded={active === i}
                    aria-controls={`fxsp-b-${s.slug}`}
                    onClick={() => open(i)}
                  >
                    <span className="fxsp-n fx-label fx-tabular">{s.index}</span>
                    <span className="fxsp-bar-title">{SERVICE_LABEL[s.slug]}</span>
                    <span className="fxsp-chev" aria-hidden="true" />
                  </button>
                </header>

                <div className="fxsp-body" id={`fxsp-b-${s.slug}`}>
                  <div className="fxsp-body-in">
                    <div className="fxsp-copy">
                      <p className="fxsp-eyebrow fx-label" data-l="body">
                        {s.index} — Service
                      </p>
                      <h3 className="fxsp-title fx-up">
                        <span className="fxsp-title-in">{SERVICE_LABEL[s.slug]}</span>
                      </h3>
                      <p className="fxsp-tag fx-h3" data-l="body">
                        {s.tagline}
                      </p>
                      <p className="fxsp-sum fx-body" data-l="body">
                        {s.summary}
                      </p>
                      <ul className="fxsp-caps" data-l="body" aria-label={`${s.name} capabilities`}>
                        {s.capabilities.slice(0, 4).map((c) => (
                          <li key={c} className="fx-small">
                            {c}
                          </li>
                        ))}
                      </ul>
                      <Link href={`/services/${s.slug}`} className="fx-btn fx-btn--ink fx-hover-shift fxsp-cta" data-l="body">
                        Explore {s.name} <span className="fx-shift" aria-hidden="true">→</span>
                      </Link>
                    </div>

                    <div className="fxsp-scene">
                      <ServiceScene slug={s.slug} art={s.art} artUrl={s.artUrl} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="fx-container fxsp-foot">
        <Link href="/services" className="fx-btn fx-btn--outline fx-hover-shift">
          All services <span className="fx-shift" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
