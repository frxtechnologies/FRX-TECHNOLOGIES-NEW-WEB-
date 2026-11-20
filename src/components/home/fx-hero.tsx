"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useIntro } from "@/components/providers/intro-provider";
import { SERVICES } from "@/lib/services";
import {
  Asterisk,
  BlockStack,
  BotBuddy,
  LoopArrow,
  ScribbleRing,
  Sparkle,
  Squiggle,
  WindowBuddy,
  Zig,
} from "@/components/art/characters";
import "./fx-hero.css";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

/**
 * The homepage hero.
 *
 * A three-row statement — BUILD. AUTOMATE. SCALE. — set in Bricolage at the
 * largest size the viewport can hold without cropping (min of the type token,
 * the viewport height and the viewport width). Original characters share the
 * rows with the words; hand-drawn blue doodles are stroke-drawn on entry.
 *
 * Life, in layers (each on its own element so transforms never fight):
 *   entry   .fxh-char          scale-in after the loader clears
 *   pointer .fxh-par           depth parallax toward the cursor
 *   idle    svg.fxh-float      slow bob; arm waves, cog turns, antenna pings
 *   gaze    .fxa-pupil         eyes follow the pointer
 *   scroll  .fxh-row           rows drift apart in opposite directions
 *
 * Fine pointers get gaze + parallax; touch devices get a slow idle glance
 * instead. Reduced motion places everything in its final state.
 */
export function FxHero() {
  const root = useRef<HTMLElement>(null);
  const { ready } = useIntro();

  /* ---- entry: held until the loader has cleared ---------------------------- */
  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el || !ready) return;
        const q = (s: string) => el.querySelectorAll(s);

        gsap.set(q("[data-hide]"), { visibility: "visible" });
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(q(".fxh-word"), { yPercent: 118 }, { yPercent: 0, duration: 1.25, stagger: 0.11 })
          .from(q(".fxh-eyebrow"), { opacity: 0, y: 14, duration: 0.8 }, 0.1)
          .fromTo(
            q(".fxh-char"),
            { scale: 0, rotate: -12, transformOrigin: "50% 100%" },
            { scale: 1, rotate: 0, duration: 1, ease: "back.out(1.7)", stagger: 0.14 },
            0.38,
          )
          .fromTo(
            q("[data-draw]"),
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 0.95, ease: "power2.inOut", stagger: 0.12 },
            0.75,
          )
          .from(q(".fxh-foot > *"), { opacity: 0, y: 22, duration: 0.9, stagger: 0.09 }, 0.7);
      },
      reduced: () => {
        const el = root.current;
        if (!el) return;
        gsap.set(el.querySelectorAll("[data-hide]"), { visibility: "visible" });
      },
    },
    root,
    [ready],
  );

  /* ---- life: idle loops, gaze, pointer depth -------------------------------- */
  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el) return;
        const q = <T extends Element>(s: string) => gsap.utils.toArray<T>(el.querySelectorAll(s));

        // idle
        q(".fxh-float").forEach((svg, i) => {
          gsap.to(svg, {
            y: i % 2 ? -10 : -14,
            rotate: i % 2 ? 1.4 : -1.6,
            duration: 2.2 + i * 0.35,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "50% 100%",
          });
        });
        // SVG groups rotate about the SVG origin unless told otherwise, so every
        // pivot is stated explicitly (data-origin, in the artwork's own units).
        const origin = (n: Element) => (n as HTMLElement).dataset.origin;
        q(".fxa-wave").forEach((a) =>
          gsap.fromTo(
            a,
            { rotate: -10, svgOrigin: origin(a) },
            { rotate: 14, svgOrigin: origin(a), duration: 0.55, ease: "sine.inOut", repeat: -1, yoyo: true },
          ),
        );
        q(".fxa-cog").forEach((c) =>
          gsap.to(c, { rotate: 360, svgOrigin: origin(c), duration: 9, ease: "none", repeat: -1 }),
        );
        q(".fxa-ping").forEach((p) =>
          gsap.to(p, { scale: 1.35, svgOrigin: origin(p), duration: 0.7, ease: "sine.inOut", repeat: -1, yoyo: true }),
        );

        // blink — staggered, irregular
        q(".fxa-eye").forEach((eye, i) => {
          const blink = () =>
            gsap
              .timeline({ delay: 2.4 + Math.random() * 3.2 + i * 0.2, onComplete: blink })
              .to(eye, { scaleY: 0.08, duration: 0.07, ease: "power2.in" })
              .to(eye, { scaleY: 1, duration: 0.12, ease: "power2.out" });
          blink();
        });

        // gaze + depth
        const pupils = q<SVGElement>(".fxa-pupil");
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const gx = pupils.map((p) => gsap.quickTo(p, "x", { duration: 0.35, ease: "power3.out" }));
        const gy = pupils.map((p) => gsap.quickTo(p, "y", { duration: 0.35, ease: "power3.out" }));
        const pars = q<HTMLElement>(".fxh-par");
        const px = pars.map((p) => gsap.quickTo(p, "x", { duration: 0.9, ease: "power3.out" }));
        const py = pars.map((p) => gsap.quickTo(p, "y", { duration: 0.9, ease: "power3.out" }));

        const look = (cx: number, cy: number) => {
          pupils.forEach((p, i) => {
            const eye = p.parentElement as unknown as SVGGraphicsElement;
            const r = eye.getBoundingClientRect();
            const dx = cx - (r.left + r.width / 2);
            const dy = cy - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy) || 1;
            const reach = Math.min(d / 260, 1) * 6; // SVG units
            gx[i](Math.round((dx / d) * reach * 10) / 10);
            gy[i](Math.round((dy / d) * reach * 10) / 10);
          });
        };

        let glance: gsap.core.Tween | undefined;
        if (fine) {
          const onMove = (e: PointerEvent) => {
            look(e.clientX, e.clientY);
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            pars.forEach((p, i) => {
              const depth = Number(p.dataset.depth ?? 1);
              px[i](-nx * 16 * depth);
              py[i](-ny * 10 * depth);
            });
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          return () => window.removeEventListener("pointermove", onMove);
        }

        // touch: no pointer to follow — a slow idle glance instead
        const t = { a: 0 };
        glance = gsap.to(t, {
          a: Math.PI * 2,
          duration: 7,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            pupils.forEach((_, i) => {
              gx[i](Math.cos(t.a + i) * 3.5);
              gy[i](Math.sin(t.a * 1.3 + i) * 2.5);
            });
          },
        });
        return () => glance?.kill();
      },
    },
    root,
  );

  /* ---- scroll: rows drift apart, characters trail, the stage lifts away ---- */
  useMotion(
    {
      aboveMobile: () => {
        const el = root.current;
        if (!el) return;
        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.7 },
          })
          .to(
            ".fxh-row",
            { x: (_i, t: HTMLElement) => Number(t.dataset.dir) * window.innerWidth * 0.16, ease: "none" },
            0,
          )
          .to(".fxh-stage", { yPercent: -10, ease: "none" }, 0)
          .to(".fxh-foot", { opacity: 0, y: -40, ease: "none" }, 0)
          .to(".fxh-scroll", { opacity: 0, ease: "none" }, 0);
      },
    },
    root,
  );

  return (
    <section ref={root} className="fxh" aria-labelledby="fxh-title">
      <div className="fxh-stage fx-container">
        <p className="fxh-eyebrow fx-label" data-hide>
          <span className="fxh-dot" aria-hidden="true" />
          FRX Technologies<span className="fxh-eyebrow-extra"> · digital systems</span>
        </p>

        <h1 id="fxh-title" className="fxh-title fx-mega fx-up">
          <span className="sr-only">Build. Automate. Scale.</span>

          {/* ROW 1 — BUILD. + the window */}
          <span className="fxh-row" data-dir="-1" aria-hidden="true">
            <span className="fxh-wordwrap">
              <span className="fxh-mask">
                <span className="fxh-word" data-hide>
                  Build.
                </span>
              </span>
              <Squiggle className="fxh-doodle fxh-doodle--under" />
            </span>
            <span className="fxh-char fxh-char--window" data-hide>
              <span className="fxh-par" data-depth="1.2">
                <WindowBuddy className="fxh-art fxh-float" />
              </span>
            </span>
            <Sparkle className="fxh-doodle fxh-doodle--spark1" />
          </span>

          {/* ROW 2 — AUTOMATE. + the loop arrow + the bot */}
          <span className="fxh-row fxh-row--bot" data-dir="1" aria-hidden="true">
            <span className="fxh-wordwrap">
              <span className="fxh-mask">
                <span className="fxh-word" data-hide>
                  Automate.
                </span>
              </span>
            </span>
            <LoopArrow className="fxh-doodle fxh-doodle--loop" />
            <span className="fxh-char fxh-char--bot" data-hide>
              <span className="fxh-par" data-depth="0.8">
                <BotBuddy className="fxh-art fxh-float" />
              </span>
            </span>
            <Asterisk className="fxh-doodle fxh-doodle--ast" />
          </span>

          {/* ROW 3 — SCALE. + the blocks */}
          <span className="fxh-row" data-dir="-1" aria-hidden="true">
            <span className="fxh-wordwrap">
              <span className="fxh-mask">
                <span className="fxh-word" data-hide>
                  Scale.
                </span>
              </span>
              <ScribbleRing className="fxh-doodle fxh-doodle--ring" />
            </span>
            <span className="fxh-char fxh-char--blocks" data-hide>
              <span className="fxh-par" data-depth="1.5">
                <BlockStack className="fxh-art fxh-float" />
              </span>
            </span>
            <Zig className="fxh-doodle fxh-doodle--zig" />
            <Sparkle className="fxh-doodle fxh-doodle--spark2" />
          </span>
        </h1>

        <div className="fxh-foot">
          <p className="fxh-lead fx-lead">
            Websites, AI automation and custom software — built around how your business
            actually works.
          </p>

          <div className="fxh-ctas">
            <Link href="/contact" className="fx-btn fx-hover-shift">
              Start a project <span className="fx-shift" aria-hidden="true">→</span>
            </Link>
            <Link href="/services" className="fx-btn fx-btn--outline fx-hover-shift">
              What we do <span className="fx-shift" aria-hidden="true">→</span>
            </Link>
          </div>

          <ul className="fxh-services" aria-label="Services">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="fx-label fx-link">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <a href="#after-hero" className="fxh-scroll fx-label" aria-label="Scroll to content">
          <span>Scroll</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
