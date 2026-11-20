"use client";

import type { RefObject } from "react";
import { gsap, useMotion } from "@/lib/gsap";

/**
 * Brings the illustration kit to life inside `scope`: arms wave, cogs turn,
 * antennas ping, eyes blink and (fine pointers) follow the cursor. Works on any
 * element carrying the `.fxa-*` classes from components/art, so scenes on the
 * services, FAQ, empty states and service pages all behave like the hero.
 *
 * Everything is created inside gsap.matchMedia: reduced-motion visitors get
 * static artwork, and the loops are reverted on unmount/resize.
 */
export function useArtLife(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useMotion(
    {
      all: () => {
        const el = scope.current;
        if (!el) return;
        const q = <T extends Element>(s: string) => gsap.utils.toArray<T>(el.querySelectorAll(s));
        const origin = (n: Element) => (n as HTMLElement).dataset.origin;

        q(".fxa-wave").forEach((a) =>
          gsap.fromTo(
            a,
            { rotate: -10, svgOrigin: origin(a) },
            { rotate: 14, svgOrigin: origin(a), duration: 0.6, ease: "sine.inOut", repeat: -1, yoyo: true },
          ),
        );
        q(".fxa-cog").forEach((c) =>
          gsap.to(c, { rotate: 360, svgOrigin: origin(c), duration: 9, ease: "none", repeat: -1 }),
        );
        q(".fxa-ping").forEach((p) =>
          gsap.to(p, { scale: 1.3, svgOrigin: origin(p), duration: 0.7, ease: "sine.inOut", repeat: -1, yoyo: true }),
        );
        q(".fxa-bob").forEach((b, i) =>
          gsap.to(b, {
            y: -10 - (i % 3) * 3,
            rotate: i % 2 ? 1.2 : -1.2,
            duration: 2.4 + i * 0.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "50% 100%",
          }),
        );
        q(".fxa-eye").forEach((eye, i) => {
          const blink = () =>
            gsap
              .timeline({ delay: 2.6 + Math.random() * 3 + i * 0.15, onComplete: blink })
              .to(eye, { scaleY: 0.08, duration: 0.07, ease: "power2.in" })
              .to(eye, { scaleY: 1, duration: 0.12, ease: "power2.out" });
          blink();
        });

        const pupils = q<SVGElement>(".fxa-pupil");
        if (!pupils.length) return;
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const gx = pupils.map((p) => gsap.quickTo(p, "x", { duration: 0.35, ease: "power3.out" }));
        const gy = pupils.map((p) => gsap.quickTo(p, "y", { duration: 0.35, ease: "power3.out" }));
        if (!fine) return;

        const onMove = (e: PointerEvent) => {
          pupils.forEach((p, i) => {
            const box = (p.parentElement as unknown as SVGGraphicsElement).getBoundingClientRect();
            if (box.width === 0) return;
            const dx = e.clientX - (box.left + box.width / 2);
            const dy = e.clientY - (box.top + box.height / 2);
            const d = Math.hypot(dx, dy) || 1;
            const reach = Math.min(d / 260, 1) * 5;
            gx[i](Math.round((dx / d) * reach * 10) / 10);
            gy[i](Math.round((dy / d) * reach * 10) / 10);
          });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      },
    },
    scope,
    deps,
  );
}
