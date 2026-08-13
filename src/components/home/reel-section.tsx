"use client";

import Image from "next/image";
import { useRef } from "react";
import { SOCIAL } from "@/lib/site";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { InstagramIcon, PlayIcon, ArrowIcon } from "@/components/ui/icons";
import { gsap, useMotion } from "@/lib/gsap";

/**
 * "Inside FRX" — the company's own Instagram content, framed editorially.
 *
 * This is the link-out treatment: a vertical poster frame with the PLAY cursor
 * that opens the real Reel on Instagram. No embedded widget (they're heavy and
 * off-brand) and no video shipped in the bundle, so the section costs nothing
 * until someone clicks.
 *
 * If a hosted video file is supplied later, `ReelModal` is the drop-in swap —
 * poster, muted autoplay, controls, Esc-to-close — and only this component
 * changes.
 */
export function ReelSection() {
  const root = useRef<HTMLElement>(null);

  useMotion(
    {
      aboveMobile: () => {
        gsap.fromTo(
          root.current?.querySelector(".reel-frame") ?? null,
          { yPercent: 8 },
          {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      },
    },
    root,
  );

  return (
    <section ref={root} className="section relative overflow-clip bg-[var(--bg-elevated)]">
      <div className="container grid items-center gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
        <div className="flex flex-col gap-7">
          <p className="t-eyebrow">Inside FRX</p>

          <RevealLines
            as="h2"
            className="t-h2 max-w-[16ch]"
            lines={["Follow what", "we're building."]}
          />

          <Reveal className="t-lead max-w-[46ch]" delay={0.1}>
            <p>
              Company updates, new work and technology content — posted as it happens,
              on Instagram and LinkedIn.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="flex flex-wrap gap-3">
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="reel-social"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
                <ArrowIcon className="h-3 w-3" />
              </a>
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="reel-social"
              >
                LinkedIn
                <ArrowIcon className="h-3 w-3" />
              </a>
            </div>
          </Reveal>
        </div>

        <a
          href={SOCIAL.instagram}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="play"
          className="reel-frame on-dark group"
          aria-label="Watch the latest FRX Technologies Reel on Instagram"
        >
          {/* Poster art: the FRX banner's particle field and blue diagonal,
              cropped clear of its typography. Lazy — this sits well below the
              fold and the section costs nothing until it's reached. */}
          <Image
            src="/images/frx-signal-tall.webp"
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 1023px) 100vw, 22rem"
            quality={80}
            className="reel-photo"
          />
          <span className="reel-art" aria-hidden="true">
            <span className="reel-art-beam" />
            <span className="reel-art-grid" />
          </span>

          <span className="reel-badge">
            <InstagramIcon className="h-3.5 w-3.5" />
            Reel
          </span>

          <span className="reel-play" aria-hidden="true">
            <PlayIcon className="h-5 w-5" />
          </span>

          <span className="reel-caption">
            <span className="t-index text-step-xs opacity-70">
              @frx.technologies
            </span>
            <span className="text-step-md font-medium">Watch on Instagram</span>
          </span>
        </a>
      </div>
    </section>
  );
}
