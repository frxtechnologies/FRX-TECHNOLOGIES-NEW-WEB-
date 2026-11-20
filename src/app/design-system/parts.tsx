"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { fxWipe } from "@/design-system/motion/fx";
import { DURATION } from "@/design-system/motion/tokens";

/* ---- type scale: measures the REAL rendered size at the current viewport -- */
export type ScaleRow = {
  cls: string;
  token: string;
  role: string;
  face: string;
  sample: string;
  clamp: string;
  lh: string;
  ls: string;
};

export function TypeScale({ rows }: { rows: ScaleRow[] }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [px, setPx] = useState<number[]>([]);

  useEffect(() => {
    const measure = () =>
      setPx(refs.current.map((el) => (el ? parseFloat(getComputedStyle(el).fontSize) : 0)));
    measure();
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="sc-scale" role="table" aria-label="Typography scale">
      {rows.map((r, i) => (
        <div className="sc-scale-row" role="row" key={r.cls}>
          <div className="sc-scale-meta" role="cell">
            <p className="fx-label">.{r.cls}</p>
            <p className="fx-small fx-muted">{r.role}</p>
            <p className="fx-micro fx-faint">
              {r.face}
              <br />
              {r.clamp}
              <br />
              line-height {r.lh} · tracking {r.ls}
            </p>
            <p className="fx-micro sc-px" aria-label="Rendered size">
              {px[i] ? `${Math.round(px[i])}px now` : "…"}
            </p>
          </div>
          <div className="sc-scale-sample" role="cell">
            <span
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`${r.cls} ${r.cls.startsWith("fx-mega") || r.cls.startsWith("fx-d") ? "fx-up" : ""}`}
            >
              {r.sample}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- motion: duration + easing visualiser --------------------------------- */
const DURS = [
  ["instant", DURATION.instant],
  ["fast", DURATION.fast],
  ["base", DURATION.base],
  ["slow", DURATION.slow],
  ["cinematic", DURATION.cinematic],
] as const;

export function DurationDemo() {
  const track = useRef<HTMLDivElement>(null);

  const play = () => {
    const el = track.current;
    if (!el) return;
    const dots = el.querySelectorAll<HTMLElement>(".sc-dur-dot");
    gsap.killTweensOf(dots);
    gsap.set(dots, { xPercent: 0 });
    DURS.forEach(([, d], i) => {
      gsap.to(dots[i], { xPercent: 2200, duration: d * 2, ease: "expo.out" });
    });
  };

  return (
    <div className="sc-dur" ref={track}>
      <button type="button" className="fx-btn fx-btn--outline" onClick={play}>
        Play durations <span className="fx-shift" aria-hidden="true">→</span>
      </button>
      <ul>
        {DURS.map(([name, d]) => (
          <li key={name}>
            <span className="fx-label sc-dur-name">{name}</span>
            <span className="fx-micro fx-faint">{d * 1000}ms</span>
            <span className="sc-dur-lane">
              <i className="sc-dur-dot" />
            </span>
          </li>
        ))}
      </ul>
      <p className="fx-micro fx-faint">
        Demo plays each at 2× so the difference is visible; real UI uses the values shown.
      </p>
    </div>
  );
}

/* ---- motion: page-wipe recipe --------------------------------------------- */
export function WipeDemo() {
  const blade = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [page, setPage] = useState(1);

  return (
    <div className="sc-wipe">
      <div ref={blade} className="sc-wipe-blade" aria-hidden="true" />
      <p className="fx-d3 fx-up" aria-live="polite">
        <span ref={label}>Page {page}</span>
      </p>
      <button
        type="button"
        className="fx-btn fx-btn--ink"
        onClick={() => {
          if (blade.current) fxWipe(blade.current, () => setPage((p) => (p === 1 ? 2 : 1)));
        }}
      >
        Navigate <span className="fx-shift" aria-hidden="true">→</span>
      </button>
    </div>
  );
}
