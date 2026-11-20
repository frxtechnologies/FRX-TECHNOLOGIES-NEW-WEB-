"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { FrxLogo } from "@/components/brand/frx-logo";
import { useIntro } from "@/components/providers/intro-provider";
import { useTheme } from "@/components/providers/theme-provider";
import "./frx-loader.css";

/**
 * The FRX intro — plays on EVERY full page load (first visit, refresh, deep
 * link). In-app navigation never re-mounts it: the marketing layout persists
 * across client-side route changes, so nobody sits through it to reach a
 * services page.
 *
 *   0.00  paper stage · counter runs 000→100 · the lockup is wiped in along its
 *         own italic slant (the clip edge is the same angle as the letterforms)
 *   1.15  blue curtain rises from below, slanted, carrying a monochrome white
 *         lockup — the page behind it is released while it is fully covered
 *   1.85  the curtain lifts away upward; the hero starts its entry as it goes
 *
 * ~2.4s. Every exit path releases the guard and calls markReady(): the hero's
 * entry is gated on it, and a hero that waits forever stays inside its mask.
 * A hard failsafe finishes the intro even if GSAP never runs.
 */
export function FrxLoader() {
  const [phase, setPhase] = useState<"deciding" | "playing" | "done">("deciding");
  const root = useRef<HTMLDivElement>(null);
  const { markReady } = useIntro();
  const { releaseIntroGuard } = useTheme();

  // Latest callbacks live in a ref so the timeline effect below depends on
  // `phase` alone. Listing them as dependencies is what made the intro replay:
  // markReady() flips shared state, which re-ran the effect mid-timeline.
  const cb = useRef({ markReady, releaseIntroGuard });
  cb.current = { markReady, releaseIntroGuard };

  const finish = useCallback(() => {
    document.documentElement.style.overflow = "";
    cb.current.releaseIntroGuard();
    setPhase("done");
    cb.current.markReady();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Nothing moves. The guard is lifted and the hero is told it may enter.
      cb.current.releaseIntroGuard();
      cb.current.markReady();
      setPhase("done");
      return;
    }
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const el = root.current;
    if (!el) return;

    document.documentElement.style.overflow = "hidden";
    const failsafe = window.setTimeout(finish, 6000);

    const counter = { v: 0 };
    const num = el.querySelector<HTMLElement>(".ld-num");
    const words = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".ld-words li"));

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(failsafe);
          finish();
        },
      });

      tl.set(".ld-logo", { "--wipe": 0 })
        .set(".ld-blue", { yPercent: 100 })
        .set(".ld-blue-logo", { opacity: 0, y: 24, scale: 0.94 })
        .set(".ld-num-wrap", { yPercent: 0 })

        // 1 — the counter runs; the lockup is wiped in on its slant
        .to(
          counter,
          {
            v: 100,
            duration: 1.05,
            ease: "power2.inOut",
            onUpdate: () => {
              if (num) num.textContent = String(Math.round(counter.v)).padStart(3, "0");
              const i = counter.v < 34 ? 0 : counter.v < 67 ? 1 : 2;
              words.forEach((w, k) => w.classList.toggle("is-on", k === i));
            },
          },
          0,
        )
        .to(".ld-logo", { "--wipe": 1, duration: 1.05, ease: "power2.inOut" }, 0)
        .to(".ld-rule i", { scaleX: 1, duration: 1.05, ease: "power2.inOut" }, 0)

        // 2 — readout lifts out, the lockup settles
        .to(".ld-num-wrap, .ld-words, .ld-meta", { yPercent: -120, opacity: 0, duration: 0.4, ease: "power3.in" }, 1.05)
        .fromTo(".ld-logo", { scale: 1.02 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 1.05)

        // 3 — blue curtain rises, slanted, with the white lockup inside
        .to(".ld-blue", { yPercent: 0, duration: 0.62, ease: "expo.inOut" }, 1.12)
        .to(".ld-blue-logo", { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "expo.out" }, 1.5)

        // 4 — fully covered: the real page is released underneath
        .add(() => {
          document.documentElement.style.overflow = "";
          cb.current.releaseIntroGuard();
          gsap.set(".ld-paper", { autoAlpha: 0 });
        }, 1.78)

        // 5 — curtain lifts away; the hero's entry starts as it clears
        .to(".ld-blue-logo", { y: -18, opacity: 0, duration: 0.3, ease: "power2.in" }, 1.92)
        .add(() => cb.current.markReady(), 1.98)
        .to(".ld-blue", { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, 1.98);
    }, el);

    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, [phase, finish]);

  // "deciding" renders nothing rather than guessing — showing either branch
  // first would flash the wrong one for a frame. The first-paint guard in
  // globals.css keeps the page hidden until this mounts.
  if (phase !== "playing") return null;

  return (
    <div ref={root} className="intro-shell ld" aria-hidden="true">
      <div className="ld-paper">
        <ul className="ld-words">
          <li className="is-on">Build.</li>
          <li>Automate.</li>
          <li>Scale.</li>
        </ul>

        <div className="ld-center">
          <FrxLogo className="ld-logo" priority sizes="(max-width: 640px) 70vw, 30rem" />
        </div>

        <div className="ld-num-wrap">
          <span className="ld-num">000</span>
          <span className="ld-pct">%</span>
        </div>

        <p className="ld-meta">FRX Technologies</p>

        <div className="ld-rule">
          <i />
        </div>
      </div>

      <div className="ld-blue">
        <FrxLogo className="ld-blue-logo" priority sizes="(max-width: 640px) 70vw, 30rem" />
      </div>
    </div>
  );
}
