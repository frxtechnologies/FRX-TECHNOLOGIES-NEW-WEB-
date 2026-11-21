"use client";

import Link from "next/link";
import { Fragment, useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useIntro } from "@/components/providers/intro-provider";
import type { HeroContent } from "@/lib/content/types";
import { BlockStack, BotBuddy, LoopArrow, MarkerUnderline, Squiggle, WindowBuddy } from "@/components/art/characters";
import { PanelChart, PanelCode, PanelToggles } from "@/components/art/scenes";
import { FxHub } from "@/components/art/hub";
import "./fx-hero.css";
import "./fx-hero-extra.css";
import "./fx-hub.css";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

export type HeroProps = {
  content: Pick<HeroContent, "supportingHeadline" | "description">;
  /** Resolved public URLs of uploaded artwork. A set value replaces the SVG character. */
  images: { window: string | null; bot: string | null; blocks: string | null };
};

/** An uploaded image fills an art slot; otherwise the built-in illustration is used. */
function Slot({ src, fallback }: { src: string | null; fallback: React.ReactNode }) {
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" className="fxh-art fxh-float" /> : <>{fallback}</>;
}

/**
 * The supporting headline, split into words so each can rise through its own mask (see the hero timeline).
 * The words stay real inline text (spaces included), so it reads normally to screen readers and with
 * JavaScript off. One key word (the admin's wording is respected: "systems" if present, otherwise the longest)
 * gets a blue underline that draws in once the words have landed.
 */
function RevealHeadline({ text }: { text: string }) {
  const words = text.split(" ").filter(Boolean);
  const bare = (w: string) => w.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  let key = words.findIndex((w) => bare(w) === "systems");
  if (key < 0) key = words.reduce((best, w, i) => (bare(w).length > bare(words[best]).length ? i : best), 0);
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="fxh-w">
            <span className="fxh-w-in">{w}</span>
            {i === key ? <span className="fxh-w-ul" aria-hidden="true" /> : null}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Copy markup used by the admin-editable description: lines become paragraphs and
 * **double-asterisk** phrases become highlighted marks that are revealed by motion.
 */
function Copy({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line, i) => (
          <p key={i} className={i === 0 ? "fxh-p fxh-p--lead" : "fxh-p"}>
            {line.split("**").map((part, j) =>
              j % 2 ? (
                <mark key={j} className="fxh-mark">
                  {part}
                </mark>
              ) : (
                <Fragment key={j}>{part}</Fragment>
              ),
            )}
          </p>
        ))}
    </>
  );
}

/**
 * The homepage hero.
 *
 * BUILD. AUTOMATE. SCALE. set in Bricolage at the largest size the viewport can
 * hold, sharing rows with original characters, floating interface panels and
 * hand-drawn marks. Layering is deliberate:
 *   .fxh-zone  = the art zone (title + panels). Panels live INSIDE it, so they can
 *                never reach the copy block below, which sits above it (z-index).
 *   .fxh-foot  = copy + actions, always painted on top.
 *
 * Motion layers (each on its own element so transforms never fight):
 *   entry   .fxh-char          scale-in after the loader clears
 *   pointer .fxh-par           depth parallax toward the cursor
 *   idle    .fxh-float         slow bob; arm waves, cog turns, antenna pings
 *   gaze    .fxa-pupil         eyes follow the pointer
 *   scroll  .fxh-row           rows drift apart in opposite directions
 */
export function FxHero({ content, images }: HeroProps) {
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
        gsap.set(q(".fxh-mark"), { backgroundSize: "0% 100%" });
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(q(".fxh-word"), { yPercent: 118 }, { yPercent: 0, duration: 1.25, stagger: 0.11 })
          .from(q(".fxh-eyebrow"), { opacity: 0, y: 14, duration: 0.8 }, 0.1)
          .fromTo(
            q(".fxh-char"),
            { scale: 0, rotate: -12, transformOrigin: "50% 100%" },
            { scale: 1, rotate: 0, duration: 1, ease: "back.out(1.7)", stagger: 0.12 },
            0.38,
          )
          // the pale-yellow marker swipes in behind SCALE
          .fromTo(q(".fxh-marker"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 0.95)
          .fromTo(
            q("[data-draw]"),
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 0.95, ease: "power2.inOut", stagger: 0.12 },
            0.75,
          )
          // the supporting headline: each word rises through its own mask, then a blue underline draws
          .fromTo(q(".fxh-w-in"), { yPercent: 115 }, { yPercent: 0, duration: 0.85, ease: "expo.out", stagger: 0.07 }, 0.62)
          .fromTo(q(".fxh-w-ul"), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, 1.3)
          .from(q(".fxh-p"), { opacity: 0, y: 18, duration: 0.8, stagger: 0.1 }, 0.85)
          // highlighted phrases are "underlined" in one after another
          .to(q(".fxh-mark"), { backgroundSize: "100% 100%", duration: 0.7, ease: "power2.inOut", stagger: 0.16 }, 1.3)
          .from(q(".fxh-ctas > *"), { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 }, 1.0);
      },
      reduced: () => {
        const el = root.current;
        if (!el) return;
        gsap.set(el.querySelectorAll("[data-hide]"), { visibility: "visible" });
        gsap.set(el.querySelectorAll(".fxh-mark"), { backgroundSize: "100% 100%" });
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

        q(".fxh-float").forEach((node, i) => {
          gsap.to(node, {
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

        q(".fxa-eye").forEach((eye, i) => {
          const blink = () =>
            gsap
              .timeline({ delay: 2.4 + Math.random() * 3.2 + i * 0.2, onComplete: blink })
              .to(eye, { scaleY: 0.08, duration: 0.07, ease: "power2.in" })
              .to(eye, { scaleY: 1, duration: 0.12, ease: "power2.out" });
          blink();
        });

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
            const reach = Math.min(d / 260, 1) * 6;
            gx[i](Math.round((dx / d) * reach * 10) / 10);
            gy[i](Math.round((dy / d) * reach * 10) / 10);
          });
        };

        if (fine) {
          const onMove = (e: PointerEvent) => {
            look(e.clientX, e.clientY);
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            pars.forEach((p, i) => {
              const depth = Number(p.dataset.depth ?? 1);
              px[i](-nx * 14 * depth);
              py[i](-ny * 8 * depth);
            });
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          return () => window.removeEventListener("pointermove", onMove);
        }

        // touch: no pointer to follow — a slow idle glance instead
        const t = { a: 0 };
        const glance = gsap.to(t, {
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
        return () => glance.kill();
      },
    },
    root,
  );

  /* ---- scroll: rows drift apart, the stage lifts away ----------------------- */
  useMotion(
    {
      aboveMobile: () => {
        const el = root.current;
        if (!el) return;
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.7 } })
          .to(
            ".fxh-row",
            { x: (_i, t: HTMLElement) => Number(t.dataset.dir) * window.innerWidth * 0.14, ease: "none" },
            0,
          )
          .to(".fxh-panels", { yPercent: -16, ease: "none" }, 0)
          .to(".fxh-foot", { opacity: 0, y: -30, ease: "none" }, 0.1);
      },
    },
    root,
  );

  return (
    <section ref={root} className="fxh" data-glow aria-labelledby="fxh-title">
      <div className="fxh-stage fx-container">
        <p className="fxh-eyebrow fx-label" data-hide>
          <span className="fxh-dot" aria-hidden="true" />
          FRX Technologies<span className="fxh-eyebrow-extra"> · software &amp; technology</span>
        </p>

        <div className="fxh-zone">
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
                  <Slot src={images.window} fallback={<WindowBuddy className="fxh-art fxh-float" />} />
                </span>
              </span>
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
                  <Slot src={images.bot} fallback={<BotBuddy className="fxh-art fxh-float" />} />
                </span>
              </span>
            </span>

            {/* ROW 3 — SCALE. with a marker swipe + hand-drawn underline, and the blocks */}
            <span className="fxh-row" data-dir="-1" aria-hidden="true">
              <span className="fxh-wordwrap">
                <span className="fxh-marker" />
                <span className="fxh-mask">
                  <span className="fxh-word" data-hide>
                    Scale.
                  </span>
                </span>
                <MarkerUnderline className="fxh-doodle fxh-doodle--mark" />
              </span>
              <span className="fxh-char fxh-char--blocks" data-hide>
                <span className="fxh-par" data-depth="1.5">
                  <Slot src={images.blocks} fallback={<BlockStack className="fxh-art fxh-float" />} />
                </span>
              </span>
            </span>
          </h1>

          {/* Floating interface panels (desktop only) — inside the art zone, so they cannot reach the copy. */}
          <div className="fxh-panels" aria-hidden="true">
            <span className="fxh-char fxh-panel fxh-panel--code" data-hide>
              <span className="fxh-par" data-depth="2">
                <PanelCode className="fxh-art fxh-float" />
              </span>
            </span>
            <span className="fxh-char fxh-panel fxh-panel--chart" data-hide>
              <span className="fxh-par" data-depth="1.6">
                <PanelChart className="fxh-art fxh-float" />
              </span>
            </span>
            <span className="fxh-char fxh-panel fxh-panel--toggles" data-hide>
              <span className="fxh-par" data-depth="1">
                <PanelToggles className="fxh-art fxh-float" />
              </span>
            </span>
          </div>
        </div>

        <div className="fxh-foot">
          <div className="fxh-copy">
            {/* Phone-only twin of the bot: it lives beside the headline where a phone has free space. */}
            <span className="fxh-char fxh-char--bot-m" aria-hidden="true" data-hide>
              <span className="fxh-par" data-depth="0.6">
                <Slot src={images.bot} fallback={<BotBuddy className="fxh-art fxh-float" />} />
              </span>
            </span>
            <h2 className="fxh-sub fx-h2 fx-up">
              <RevealHeadline text={content.supportingHeadline} />
            </h2>
            <div className="fxh-body">
              <Copy text={content.description} />
            </div>
            <div className="fxh-ctas">
              <Link href="/contact" className="fx-btn fx-hover-shift">
                Start a project <span className="fx-shift" aria-hidden="true">→</span>
              </Link>
              <Link href="/services" className="fx-btn fx-btn--outline fx-hover-shift">
                What we do <span className="fx-shift" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

        </div>

        {/* The large systems illustration: lower-right on desktop, under the copy on smaller screens. */}
        <span className="fxh-char fxh-hub" aria-hidden="true" data-hide>
          <span className="fxh-par" data-depth="0.9">
            <FxHub />
          </span>
        </span>
      </div>
    </section>
  );
}
