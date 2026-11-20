"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ScrollTrigger, useMotion } from "@/lib/gsap";
import { SERVICE_LABEL, type Service } from "@/lib/services";
import { ServiceArtView } from "@/components/art/registry";
import { useArtLife } from "@/components/motion/use-art-life";

const TONES = ["ink", "paper", "tint", "blue"] as const;

/**
 * "This is our thing." — nine services as a directory of huge names beside one
 * sticky stage. The stage swaps scene, ground colour and copy as the active
 * service changes: on hover/focus with a pointer, and on scroll as each name
 * crosses the reading line (desktop). Below 900px the stage is replaced by an
 * inline panel that opens under the tapped name, so nothing needs hover.
 */
export function ServicesStage({ services }: { services: Service[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useArtLife(root);

  // Scroll → active service (desktop only; touch/tablet use tap).
  useMotion(
    {
      desktop: () => {
        const el = root.current;
        if (!el) return;
        const items = el.querySelectorAll<HTMLElement>(".fxs2-item");
        const triggers = Array.from(items).map((item, i) =>
          ScrollTrigger.create({
            trigger: item,
            start: "top 58%",
            end: "bottom 58%",
            onToggle: (self) => self.isActive && setActive(i),
          }),
        );
        return () => triggers.forEach((t) => t.kill());
      },
    },
    root,
    [services.length],
  );

  const current = services[active] ?? services[0];
  const tone = TONES[active % TONES.length];

  return (
    <section ref={root} className="fxs2" id="services" aria-labelledby="fxs2-title">
      <div className="fx-container fxs2-head">
        <h2 id="fxs2-title" className="fxs2-h fx-d1 fx-up" data-fx="reveal-lines">
          This is our thing.
        </h2>
        <p className="fx-lead fxs2-lead" data-fx="fade-up">
          Nine ways we build software that works harder for your business.
        </p>
      </div>

      <div className="fx-container fxs2-body">
        <ol className="fxs2-list">
          {services.map((s, i) => (
            <li key={s.slug} className="fxs2-item" data-active={active === i}>
              <Link
                href={`/services/${s.slug}`}
                className="fxs2-link"
                aria-current={active === i ? "true" : undefined}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={(e) => {
                  // Small screens: first tap opens the inline panel; the panel's own link navigates.
                  if (window.matchMedia("(max-width: 899px)").matches && active !== i) {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
              >
                <span className="fxs2-num fx-label">{s.index}</span>
                <span className="fxs2-name fx-up">{SERVICE_LABEL[s.slug]}</span>
                <span className="fxs2-arrow" aria-hidden="true">→</span>
              </Link>

              <div className="fxs2-inline" data-open={active === i}>
                <div className="fxs2-inline-in">
                  <div className="fxs2-inline-art" aria-hidden="true">
                    <ServiceArtView art={s.art} className="fxs2-art fxa-bob" />
                  </div>
                  <p className="fx-h3">{s.tagline}</p>
                  <p className="fx-body fxs2-sum">{s.summary}</p>
                  <Link href={`/services/${s.slug}`} className="fx-btn fx-btn--ink fx-hover-shift">
                    Explore <span className="fx-shift" aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <aside className="fxs2-stage" data-tone={tone} aria-live="polite">
          <div className="fxs2-scenes" aria-hidden="true">
            {services.map((s, i) => (
              <div key={s.slug} className="fxs2-scene" data-on={active === i}>
                <ServiceArtView art={s.art} className="fxs2-art fxa-bob" />
              </div>
            ))}
          </div>
          <div className="fxs2-info">
            <p className="fx-label fxs2-idx">
              {current.index} / {String(services.length).padStart(2, "0")}
            </p>
            <p className="fx-h2 fxs2-tag">{current.tagline}</p>
            <p className="fx-body fxs2-sum">{current.summary}</p>
            <Link href={`/services/${current.slug}`} className="fx-btn fx-btn--ink fx-hover-shift">
              Explore {current.name} <span className="fx-shift" aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>
      </div>

      <div className="fx-container fxs2-foot">
        <Link href="/services" className="fx-btn fx-btn--outline fx-hover-shift">
          All services <span className="fx-shift" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
