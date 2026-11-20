"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { FrxLogo } from "@/components/brand/frx-logo";

const WORDS = ["Build.", "Automate.", "Scale."] as const;

/**
 * The closing statement. Giant letters that behave like rubber: they drop in from
 * above with a true bounce (and squash on landing), then hop whenever the cursor
 * brushes them — or a finger taps them. The full white FRX logo lands below with
 * an elastic squash-and-stretch.
 *
 * It is real text (screen readers get "Build. Automate. Scale."; each letter is
 * aria-hidden decoration), visible without JavaScript, and under reduced motion the
 * letters are simply static. Touch devices get the hop on tap, never on hover.
 * Every tween animates transform only.
 */
export function FooterBounce({ email }: { email: string }) {
  const root = useRef<HTMLDivElement>(null);

  useMotion(
    {
      all: () => {
        const el = root.current;
        if (!el) return;
        const letters = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".fxo-l"));
        const logo = el.querySelector<HTMLElement>(".fxo-biglogo");

        gsap.set(letters, { yPercent: -170, opacity: 0, transformOrigin: "50% 100%" });
        if (logo) gsap.set(logo, { opacity: 0, scaleY: 0.5, scaleX: 1.14, transformOrigin: "50% 100%" });

        const squash = (l: HTMLElement) =>
          gsap
            .timeline({ overwrite: "auto" })
            .to(l, { yPercent: -22, scaleY: 1.1, scaleX: 0.94, duration: 0.17, ease: "power2.out" })
            .to(l, { yPercent: 0, scaleY: 0.82, scaleX: 1.1, duration: 0.14, ease: "power2.in" })
            .to(l, { scaleY: 1, scaleX: 1, duration: 0.9, ease: "elastic.out(1, 0.32)" });

        const st = gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          })
          .to(letters, { yPercent: 0, opacity: 1, duration: 1.15, ease: "bounce.out", stagger: { each: 0.045 } }, 0)
          .to(logo, { opacity: 1, scaleY: 1, scaleX: 1, duration: 1.5, ease: "elastic.out(1, 0.38)" }, 0.65);

        // hop on contact: pointer-enter works for a mouse and for a tap
        const cleanups: Array<() => void> = [];
        letters.forEach((l) => {
          const on = () => squash(l);
          l.addEventListener("pointerenter", on);
          cleanups.push(() => l.removeEventListener("pointerenter", on));
        });
        // tapping the logo makes the whole line jump in a wave
        const wave = () => letters.forEach((l, i) => gsap.delayedCall(i * 0.03, () => squash(l)));
        logo?.addEventListener("click", wave);

        return () => {
          st.scrollTrigger?.kill();
          st.kill();
          cleanups.forEach((f) => f());
          logo?.removeEventListener("click", wave);
          gsap.set([...letters, ...(logo ? [logo] : [])], { clearProps: "opacity,transform,translate,scale" });
        };
      },
    },
    root,
  );

  return (
    <div ref={root} className="fxo-close">
      <div className="fx-container fxo-cta">
        <p className="fx-label">Ready when you are</p>
        <p className="fxo-cta-h fx-d3 fx-up">Have something to build?</p>
        <div className="fxo-cta-actions">
          <Link href="/contact" className="fx-btn fx-hover-shift">
            Start a project <span className="fx-shift" aria-hidden="true">→</span>
          </Link>
          <a href={`mailto:${email}`} className="fxo-mail fx-h3">
            {email}
          </a>
        </div>
      </div>

      <div className="fxo-big" role="img" aria-label="Build. Automate. Scale.">
        {WORDS.map((w) => (
          <span key={w} className="fxo-word" aria-hidden="true">
            {w.split("").map((ch, i) => (
              <span key={i} className="fxo-l">
                {ch}
              </span>
            ))}
          </span>
        ))}
      </div>

      <div className="fx-container fxo-logoRow">
        <FrxLogo className="fxo-biglogo" sizes="(max-width: 640px) 70vw, 420px" />
      </div>
    </div>
  );
}
