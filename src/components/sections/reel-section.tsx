"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const SCRIPT = "https://www.instagram.com/embed.js";

/** Accepts either form of the reel address and returns the canonical embed permalink. */
function permalink(url: string) {
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?(reel|p)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/` : null;
}

/**
 * The FRX Instagram Reel, using Instagram's own embed (not a fake player).
 *
 *  - The embed script is NOT in the page bundle: it is fetched only when this
 *    section is within ~500px of the viewport, so no other page and no first
 *    paint pays for it.
 *  - Nothing autoplays with sound; the visitor uses Instagram's own controls
 *    (including unmute) inside the embed.
 *  - If the embed has not appeared within 9s (blocked, offline, privacy tools) the
 *    section keeps a designed card that opens the reel on Instagram.
 *  - The frame reserves its aspect ratio up front, so nothing shifts when it loads.
 */
export function ReelSection({
  url,
  heading,
  text,
  profileUrl,
}: {
  url: string;
  heading: string;
  text: string;
  profileUrl: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const link = permalink(url);

  useEffect(() => {
    const el = host.current;
    if (!el || !link) return;
    let timer = 0;
    let obs: MutationObserver | undefined;

    const start = () => {
      setState("loading");
      obs = new MutationObserver(() => {
        if (el.querySelector("iframe")) {
          setState("ready");
          window.clearTimeout(timer);
          obs?.disconnect();
        }
      });
      obs.observe(el, { childList: true, subtree: true });
      timer = window.setTimeout(() => !el.querySelector("iframe") && setState("failed"), 9000);

      if (window.instgrm) {
        window.instgrm.Embeds.process();
      } else if (!document.querySelector(`script[src="${SCRIPT}"]`)) {
        const s = document.createElement("script");
        s.src = SCRIPT;
        s.async = true;
        s.onload = () => window.instgrm?.Embeds.process();
        s.onerror = () => setState("failed");
        document.body.appendChild(s);
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      obs?.disconnect();
      window.clearTimeout(timer);
    };
  }, [link]);

  if (!link) return null;

  return (
    <section className="fxreel" data-glow id="reel" aria-labelledby="fxreel-title">
      <div className="fx-container fxreel-wrap">
        <div className="fxreel-copy">
          <p className="fx-label fxreel-eyebrow">
            <span className="fxa-tick" aria-hidden="true" />
            From our Instagram
          </p>
          <h2 id="fxreel-title" className="fxreel-h fx-d1 fx-up" data-fx="reveal-lines">
            {heading}
          </h2>
          <p className="fx-lead fxreel-lead" data-fx="fade-up">
            {text}
          </p>
          <div className="fxreel-actions" data-fx="fade-up">
            <a className="fx-btn fx-hover-shift" href={link} target="_blank" rel="noopener noreferrer">
              Watch on Instagram <span className="fx-shift" aria-hidden="true">→</span>
            </a>
            <a className="fx-btn fx-btn--outline fx-hover-shift" href={profileUrl} target="_blank" rel="noopener noreferrer">
              Follow @frx.technologies <span className="fx-shift" aria-hidden="true">→</span>
            </a>
          </div>
          <p className="fx-small fx-muted">Sound is off until you turn it on in the player.</p>
        </div>

        <div className="fxreel-stage" data-state={state}>
          <div className="fxreel-frame" ref={host}>
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={link}
              data-instgrm-version="14"
              data-instgrm-captioned
              style={{ background: "#fff", border: 0, margin: 0, maxWidth: 540, minWidth: 280, width: "100%" }}
            >
              <a href={link} target="_blank" rel="noopener noreferrer">
                View this reel on Instagram
              </a>
            </blockquote>
          </div>

          {state !== "ready" && (
            <div className="fxreel-card" role={state === "failed" ? "status" : undefined}>
              <span className="fxreel-play" aria-hidden="true" />
              <p className="fx-h3">{state === "failed" ? "The player couldn’t load here." : "Loading the reel…"}</p>
              {state === "failed" && (
                <a className="fx-btn fx-btn--ink" href={link} target="_blank" rel="noopener noreferrer">
                  Open the reel on Instagram <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
