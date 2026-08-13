"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { FrxLogo } from "@/components/brand/frx-logo";
import { useIntro } from "@/components/providers/intro-provider";
import { INTRO_KEY as SESSION_KEY, useTheme } from "@/components/providers/theme-provider";

/**
 * The FRX intro.
 *
 * A blue signal travels left to right, wiping the official logo into view
 * behind its leading edge, then the layer splits horizontally and lifts to hand
 * off to the hero. Roughly 1.8s.
 *
 * Plays once per session — internal navigation and same-tab reloads skip it.
 * Nobody should sit through a brand animation to reach a services page.
 *
 * Every exit path calls `markReady()`, including the skip path and the
 * reduced-motion path, because the hero's own entry is gated on it.
 */
export function FrxLoader() {
  const [phase, setPhase] = useState<"deciding" | "playing" | "done">("deciding");
  const root = useRef<HTMLDivElement>(null);
  const { markReady } = useIntro();
  const { runIntroTransform } = useTheme();

  const finish = useCallback(() => {
    // The session key is written here rather than when the intro starts. Marking
    // it up front meant React's development double-mount saw "already played" on
    // the second pass and skipped straight to the site — so the intro never ran
    // in dev, and the light→dark resolve tied to it never fired either.
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* storage blocked — the intro replays, which is harmless */
    }

    // Every exit path resolves the theme, including the skip. Otherwise a
    // visitor who lands mid-session is left on the intro's light frame with no
    // loader on screen to explain it. It is a no-op once already resolved.
    runIntroTransform();

    setPhase("done");
    markReady();
  }, [markReady, runIntroTransform]);

  useEffect(() => {
    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      played = false;
    }

    if (played) {
      finish();
      return;
    }

    setPhase("playing");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Still called so the one-shot flag is cleared; it returns early under
      // reduced motion rather than crossfading the whole page.
      runIntroTransform();
      const t = window.setTimeout(finish, 400);
      return () => window.clearTimeout(t);
    }
  }, [finish, runIntroTransform]);

  useEffect(() => {
    if (phase !== "playing") return;
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish });

      tl.set(".intro-mark", { clipPath: "inset(-6% 100% -6% 0)" })
        .set(".intro-signal", { xPercent: 0, opacity: 0 })
        .set(".intro-rule", { scaleX: 0, transformOrigin: "left center" })

        // 1 — the progress line extends beneath the mark
        .to(".intro-rule", { scaleX: 1, duration: 0.72, ease: "power2.inOut" })

        // 2 — the signal sweeps across, wiping the mark into view behind it
        .to(".intro-signal", { opacity: 1, duration: 0.12 }, 0.06)
        .to(".intro-signal", { xPercent: 100, duration: 0.66, ease: "power2.inOut" }, 0.06)
        .to(
          ".intro-mark",
          { clipPath: "inset(-6% 0% -6% 0)", duration: 0.66, ease: "power2.inOut" },
          0.06,
        )

        // 3 — the signal clears the right edge, the mark resolves
        .to(".intro-signal", { opacity: 0, duration: 0.22, ease: "power2.in" }, 0.66)
        .fromTo(".intro-mark", { scale: 1.03 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0.68)

        // 4 — the site resolves from white into black behind the layer, so the
        // colour change is already underway when the split reveals the hero
        .add(runIntroTransform, 1.0)

        // 5 — the layer splits and the hero is underneath
        .to(".intro-content", { opacity: 0, y: -12, duration: 0.3, ease: "power2.in" }, 1.1)
        .to(".intro-half", { scaleY: 0, duration: 0.66, ease: "expo.inOut", stagger: 0.05 }, 1.16);
    }, el);

    return () => ctx.revert();
  }, [phase, finish, runIntroTransform]);

  // "deciding" renders nothing rather than guessing — showing either branch
  // first would flash the wrong one for a frame.
  if (phase !== "playing") return null;

  return (
    <div
      ref={root}
      className="intro-shell fixed inset-0 grid place-items-center"
      style={{ zIndex: "var(--z-loader)" }}
      aria-hidden="true"
    >
      {/* Two halves that split apart to reveal the page. */}
      <div className="absolute inset-0 grid grid-rows-2">
        <div className="intro-half bg-[var(--bg)]" style={{ transformOrigin: "top center" }} />
        <div className="intro-half bg-[var(--bg)]" style={{ transformOrigin: "bottom center" }} />
      </div>

      <div className="intro-content relative flex w-full max-w-[min(28rem,68vw)] flex-col items-center gap-7">
        <div className="relative w-full">
          <FrxLogo className="intro-mark w-full origin-center" priority sizes="(max-width: 640px) 68vw, 28rem" />

          {/* The leading edge of the signal — a thin blue blade with a glow.
              Reads on white and on black without any blend mode. */}
          <div className="intro-signal pointer-events-none absolute inset-y-[-14%] left-0 w-px">
            <div
              className="absolute inset-y-0 -left-px w-[2px]"
              style={{
                background:
                  "linear-gradient(180deg, transparent, var(--frx-blue-bright) 18%, var(--frx-blue) 82%, transparent)",
                boxShadow: "0 0 22px 3px var(--frx-blue-glow)",
              }}
            />
          </div>
        </div>

        <div className="relative h-px w-full overflow-hidden bg-[var(--border)]">
          <span className="intro-rule signal-rule absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
