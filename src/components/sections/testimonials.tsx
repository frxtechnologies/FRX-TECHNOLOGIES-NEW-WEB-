"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import "./testimonials.css";

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
 * "Apparently, they like us." — large flip cards.
 *
 * The front of each card is the words; turn it over (click, tap, Enter or Space)
 * and the back is the person: portrait, name, designation, company. Cards sit in a
 * deck — the active one in front, the next two leaning out behind — and ← / →,
 * the buttons or a swipe move through them: the front card is thrown aside while
 * the deck settles forward. Flip is a CSS 3D transform (cheap and smooth); the
 * throw is GSAP. Reduced-motion visitors get a cross-fade instead of any rotation.
 *
 * Content is admin-managed (Testimonials + approved Reviews). With nothing
 * published the section shows an honest empty state — it never pretends there are
 * clients or reviews, and invites the visitor to leave the first one.
 */
export function Testimonials({ items }: { items: TestimonialItem[] }) {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const busy = useRef(false);
  const touch = useRef<number | null>(null);
  const n = items.length;

  const go = (dir: 1 | -1) => {
    if (busy.current || n < 2) return;
    busy.current = true;
    const front = root.current?.querySelector<HTMLElement>(".fxq-card[data-pos='0']");
    const next = (i + dir + n) % n;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!front || reduce) {
      setI(next);
      busy.current = false;
      return;
    }
    gsap.to(front, {
      xPercent: dir * 118,
      rotate: dir * 12,
      opacity: 0,
      duration: 0.55,
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
        if (!el || !n) return;
        gsap.from(el.querySelectorAll(".fxq-card"), {
          y: 70,
          opacity: 0,
          rotate: (k) => (k % 2 ? 4 : -4),
          duration: 1,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });
      },
    },
    root,
    [n],
  );

  if (!n) {
    return (
      <section ref={root} className="fxq fxq--empty" id="testimonials" aria-labelledby="fxq-title">
        <div className="fx-container fxq-wrap">
          <h2 id="fxq-title" className="fxq-h fx-d1 fx-up" data-fx="reveal-lines">
            Apparently, they like us.
          </h2>
          <div className="fxq-ghosts" aria-hidden="true">
            <span className="fxq-ghost fxq-ghost--c" />
            <span className="fxq-ghost fxq-ghost--b" />
            <span className="fxq-ghost fxq-ghost--a">
              <b>“</b>
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="fxq-empty-copy">
            <p className="fx-lead">
              FRX Technologies launched in 2026, so there are no client testimonials to show yet — and we won&apos;t make any up.
              When real feedback arrives and is approved, it will appear here.
            </p>
            <Link href="#review" className="fx-btn fx-hover-shift">
              Leave the first review <span className="fx-shift" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const order = [0, 1, 2].filter((k) => k < n).map((k) => (i + k) % n);
  const active = items[i];

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
        <div className="fxq-side">
          <h2 id="fxq-title" className="fxq-h fx-d1 fx-up" data-fx="reveal-lines">
            Apparently, they like us.
          </h2>
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
          <p className="fx-small fx-muted fxq-hint">Turn the card over to meet the person.</p>
        </div>

        <div
          className="fxq-deck"
          role="group"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          {order
            .slice()
            .reverse()
            .map((idx) => {
              const pos = order.indexOf(idx);
              const t = items[idx];
              const isFlipped = !!flipped[t.id];
              return (
                <figure key={t.id} className="fxq-card" data-pos={pos} data-flipped={isFlipped} style={{ ["--pos" as string]: pos }}>
                  <button
                    type="button"
                    className="fxq-flip"
                    aria-pressed={isFlipped}
                    aria-label={isFlipped ? `Show ${t.name}'s words` : `Turn over to see who ${t.name} is`}
                    tabIndex={pos === 0 ? 0 : -1}
                    onClick={() => pos === 0 && setFlipped((f) => ({ ...f, [t.id]: !f[t.id] }))}
                  >
                    {/* FRONT: the words */}
                    <span className="fxq-face fxq-front" aria-hidden={isFlipped}>
                      {t.rating ? (
                        <span className="fxq-stars" role="img" aria-label={`${t.rating} out of 5 stars`}>
                          {"★★★★★".slice(0, t.rating)}
                        </span>
                      ) : (
                        <span className="fxq-quote-mark" aria-hidden="true">
                          “
                        </span>
                      )}
                      <blockquote className="fxq-text">{t.text}</blockquote>
                      <span className="fxq-turn fx-label">Turn over ↻</span>
                    </span>

                    {/* BACK: the person */}
                    <span className="fxq-face fxq-back" aria-hidden={!isFlipped}>
                      <span className="fxq-avatar">
                        {t.portrait ? (
                          <Image src={t.portrait} alt={`Portrait of ${t.name}`} width={240} height={240} />
                        ) : (
                          <span aria-hidden="true">{initials(t.name)}</span>
                        )}
                      </span>
                      <span className="fxq-name">{t.name}</span>
                      {(t.designation || t.company) && (
                        <span className="fxq-role">{[t.designation, t.company].filter(Boolean).join(" · ")}</span>
                      )}
                      <span className="fxq-turn fx-label">Back to the words ↻</span>
                    </span>
                  </button>
                </figure>
              );
            })}
        </div>
      </div>
      <p className="sr-only">
        Current testimonial from {active.name}
        {active.company ? ` of ${active.company}` : ""}: {active.text}
      </p>
    </section>
  );
}
