"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { FOUNDERS } from "@/lib/site";
import { fetchPublicFounders, type PublicFounder } from "@/lib/supabase/public";
import { RevealLines } from "@/components/ui/reveal";

const STATIC_FOUNDERS: PublicFounder[] = FOUNDERS.map((f) => ({
  name: f.name,
  role: f.role,
  imageUrl: f.image,
}));

/**
 * The founding team.
 *
 * Both portraits are the same size, in the same treatment, entering at the same
 * moment from opposite sides, with the word BUILT TOGETHER set behind them.
 * Neither founder is staged as primary — that symmetry is the whole point of
 * the composition, and it holds at every breakpoint: stacked on mobile, still
 * identical in scale and styling.
 */
export function Founders() {
  const root = useRef<HTMLElement>(null);
  const [founders, setFounders] = useState<PublicFounder[]>(STATIC_FOUNDERS);

  // Supabase is the source of truth once it answers; the hand-authored pair
  // is what paints first and what stays if the project is unreachable, so a
  // visitor never sees an empty section because a fetch was slow.
  useEffect(() => {
    let cancelled = false;
    fetchPublicFounders().then((rows) => {
      if (!cancelled && rows?.length) setFounders(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useMotion(
    {
      aboveMobile: () => {
        const el = root.current;
        if (!el) return;

        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top 72%", once: true },
          })
          .fromTo(
            el.querySelectorAll(".founder-figure"),
            { yPercent: 26, opacity: 0, xPercent: (i) => (i === 0 ? -8 : 8) },
            {
              yPercent: 0,
              opacity: 1,
              xPercent: 0,
              duration: 1.3,
              ease: "expo.out",
              stagger: 0,
            },
          )
          .fromTo(
            el.querySelector(".founders-word"),
            { opacity: 0, scale: 1.06 },
            { opacity: 1, scale: 1, duration: 1.4, ease: "expo.out" },
            0.1,
          )
          .fromTo(
            el.querySelectorAll(".founder-name"),
            { yPercent: 105 },
            { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0 },
            0.55,
          );

        // Portraits drift a touch against the backdrop. Tiny on purpose.
        gsap.to(el.querySelectorAll(".founder-figure"), {
          yPercent: -5,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      },
      mobile: () => {
        const el = root.current;
        if (!el) return;
        gsap.fromTo(
          el.querySelectorAll(".founder-figure"),
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          },
        );
        gsap.set(el.querySelectorAll(".founder-name"), { yPercent: 0 });
      },
      reduced: () => {
        const el = root.current;
        if (!el) return;
        gsap.set(el.querySelectorAll(".founder-figure, .founders-word"), {
          opacity: 1,
        });
        gsap.set(el.querySelectorAll(".founder-name"), { yPercent: 0 });
      },
    },
    root,
  );

  return (
    <section ref={root} className="founders section relative overflow-clip">
      <div className="container relative">
        <div className="mb-[clamp(2rem,4vw,3.5rem)] flex flex-col gap-6">
          <p className="t-eyebrow">The team</p>
          <RevealLines
            as="h2"
            className="t-h2 max-w-[18ch]"
            lines={["Built by people", "who build."]}
          />
        </div>

        <div className="founders-stage">
          {/* The word sits behind the portraits — depth, not decoration. */}
          <span className="founders-word" aria-hidden="true">
            BUILT TOGETHER
          </span>

          <ul className="founders-grid">
            {founders.map((f) => (
              <li key={f.name} className="founder">
                <figure className="founder-figure">
                  <div className="founder-frame">
                    <FounderPortrait name={f.name} role={f.role} src={f.imageUrl} />
                    <span className="founder-glow" aria-hidden="true" />
                  </div>

                  <figcaption className="founder-caption">
                    <span className="reveal-mask block">
                      <span className="founder-name block">{f.name}</span>
                    </span>
                    <span className="founder-role">{f.role}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * A portrait that degrades to a branded monogram panel when no image is
 * supplied, or when one fails to load.
 *
 * Both founders must carry identical visual weight, so the fallback matches the
 * frame's dimensions and treatment exactly — it reads as a deliberate panel, not
 * as a broken image. Set the path in `FOUNDERS` and it takes over unchanged.
 */
function FounderPortrait({
  name,
  role,
  src,
}: {
  name: string;
  role: string;
  src: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const initials = name
      .split(" ")
      .map((p) => p[0])
      .join("");

    return (
      <span className="founder-fallback" role="img" aria-label={`${name}, ${role}`}>
        <span className="founder-fallback-initials" aria-hidden="true">
          {initials}
        </span>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name}, ${role} of FRX Technologies`}
      width={900}
      height={1100}
      sizes="(max-width: 767px) 84vw, (max-width: 1200px) 42vw, 480px"
      className="founder-photo"
      onError={() => setFailed(true)}
    />
  );
}
