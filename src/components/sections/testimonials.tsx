"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useMotion } from "@/lib/gsap";

export type TestimonialItem = {
  id: string;
  name: string;
  designation: string;
  company: string;
  text: string;
  portrait: string | null;
  rating?: number;
};

const initials = (n: string) =>
  n
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * "Apparently, they like us." — a deck of real testimonials. The active card
 * sits in front; the next two peek out behind it. Arrow keys, buttons and swipe
 * move through them, and each change slides the front card away while the deck
 * settles forward. Rendered only when there is at least one approved item —
 * the parent hides the whole section otherwise.
 */
export function Testimonials({ items }: { items: TestimonialItem[] }) {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const busy = useRef(false);
  const n = items.length;

  const go = (dir: 1 | -1) => {
    if (busy.current || n < 2) return;
    busy.current = true;
    const front = root.current?.querySelector<HTMLElement>(".fxq-card[data-pos='0']");
    const next = (i + dir + n) % n;
    if (!front || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setI(next);
      busy.current = false;
      return;
    }
    gsap.to(front, {
      xPercent: dir * 120,
      rotate: dir * 10,
      opacity: 0,
      duration: 0.5,
      ease: "power3.in",
      onComplete: () => {
        gsap.set(front, { clearProps: "transform,opacity" });
        setI(next);
        busy.current = false;
      },
    });
  };

  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el) return;
        gsap.from(el.querySelectorAll(".fxq-card"), {
          y: 60,
          opacity: 0,
          rotate: (k) => (k % 2 ? 3 : -3),
          duration: 1,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });
      },
    },
    root,
  );

  if (!n) return null;
  const order = [0, 1, 2].filter((k) => k < n).map((k) => (i + k) % n);

  return (
    <section
      ref={root}
      className="fxq"
      id="testimonials"
      aria-labelledby="fxq-title"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="fx-container fxq-wrap">
        <h2 id="fxq-title" className="fxq-h fx-d1 fx-up" data-fx="reveal-lines">
          Apparently, they like us.
        </h2>

        <div className="fxq-deck" role="group" aria-roledescription="carousel" aria-label="Testimonials">
          {order
            .slice()
            .reverse()
            .map((idx) => {
              const pos = order.indexOf(idx);
              const t = items[idx];
              return (
                <figure
                  key={t.id}
                  className="fxq-card"
                  data-pos={pos}
                  aria-hidden={pos !== 0}
                  style={{ ["--pos" as string]: pos }}
                >
                  {t.rating ? (
                    <p className="fxq-stars" aria-label={`${t.rating} out of 5 stars`}>
                      {"★★★★★".slice(0, t.rating)}
                    </p>
                  ) : null}
                  <blockquote className="fxq-text fx-h3">&ldquo;{t.text}&rdquo;</blockquote>
                  <figcaption className="fxq-who">
                    <span className="fxq-avatar">
                      {t.portrait ? (
                        <Image src={t.portrait} alt={`Portrait of ${t.name}`} width={56} height={56} />
                      ) : (
                        <span aria-hidden="true">{initials(t.name)}</span>
                      )}
                    </span>
                    <span>
                      <span className="fxq-name fx-h4">{t.name}</span>
                      <span className="fx-small fx-muted">
                        {[t.designation, t.company].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
        </div>

        {n > 1 && (
          <div className="fxq-nav">
            <button type="button" className="fxq-btn" onClick={() => go(-1)} aria-label="Previous testimonial">
              ←
            </button>
            <span className="fx-label fx-tabular" aria-live="polite">
              {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <button type="button" className="fxq-btn" onClick={() => go(1)} aria-label="Next testimonial">
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
