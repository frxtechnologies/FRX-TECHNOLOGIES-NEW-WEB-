"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SERVICES } from "@/lib/services";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { ArrowIcon } from "@/components/ui/icons";

/**
 * The services index — full-width rows, not cards.
 *
 * Each row is index / name / description / arrow across the whole container. On
 * hover a blue rule draws under the row, the name shifts right, and an abstract
 * scene fades in behind the whole list. On touch the same rows are plain links
 * with no hover dependency, so nothing is gated behind a pointer.
 */
export function ServiceIndex() {
  const [active, setActive] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);

  return (
    <section ref={root} className="section relative overflow-clip">
      {/* Backdrop that responds to the hovered row. Decorative and hidden from
          assistive tech; the rows carry all the meaning. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {SERVICES.map((s, i) => (
          <div
            key={s.slug}
            className="service-backdrop"
            data-active={active === i}
            data-scene={s.scene}
          />
        ))}
      </div>

      <div className="container relative">
        <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6">
          <p className="t-eyebrow">What we build</p>
          <RevealLines
            as="h2"
            className="t-h2 max-w-[20ch]"
            lines={[
              "We don't just build pages.",
              <span key="s">
                We build <span className="accent">systems</span>.
              </span>,
            ]}
          />
        </div>

        <ul className="border-t border-[var(--border)]">
          {SERVICES.map((service, i) => (
            <Reveal as="li" key={service.slug} delay={i * 0.05}>
              <Link
                href={`/services/${service.slug}`}
                className="service-row"
                data-cursor="view"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span className="t-index service-row-index">{service.index}</span>

                <span className="service-row-name">{service.name}</span>

                <span className="service-row-body">{service.summary}</span>

                <span className="service-row-arrow" aria-hidden="true">
                  <ArrowIcon className="h-4 w-4" />
                </span>

                <span className="service-row-rule" aria-hidden="true" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
