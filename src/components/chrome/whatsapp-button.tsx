"use client";

import { useEffect, useRef, useState } from "react";
import "./fx-dock.css";

const SOUND_KEY = "frx-ring-sound";

/** A short classic two-tone telephone ring, synthesised on the spot (no audio file to load). */
function playRing(ctx: AudioContext) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);
  // two bursts of a 480 + 620 Hz pair, each with a soft attack and release
  for (const start of [0, 0.55]) {
    for (const f of [480, 620]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(master);
      o.start(now + start);
      o.stop(now + start + 0.42);
    }
    master.gain.setValueAtTime(0.0001, now + start);
    master.gain.exponentialRampToValueAtTime(0.09, now + start + 0.04);
    master.gain.setValueAtTime(0.09, now + start + 0.34);
    master.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.42);
  }
}

/** A small original robot who leans out to greet you. */
function MiniBot() {
  return (
    <svg viewBox="0 0 64 70" className="fxwa-bot" aria-hidden="true">
      <path d="M32 14V6" stroke="#0a0a0c" strokeWidth="3.5" strokeLinecap="round" />
      <circle className="fxwa-ant" cx="32" cy="5" r="4.2" fill="var(--fx-sub)" stroke="#0a0a0c" strokeWidth="2.6" />
      <rect x="8" y="14" width="48" height="36" rx="14" fill="var(--fx-blue)" stroke="#0a0a0c" strokeWidth="3.4" />
      <rect x="14" y="21" width="36" height="22" rx="10" fill="#0a0a0c" />
      <g className="fxwa-eyes" fill="#8fd0ff">
        <ellipse cx="24" cy="32" rx="3.4" ry="4.6" />
        <ellipse cx="40" cy="32" rx="3.4" ry="4.6" />
      </g>
      <path d="M27 38.5q5 3.5 10 0" stroke="#8fd0ff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <g className="fxwa-arm">
        <path d="M54 40c8 0 10-8 6-14" stroke="#0a0a0c" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <circle cx="59.5" cy="24.5" r="4.2" fill="#fff" stroke="#0a0a0c" strokeWidth="2.8" />
      </g>
    </svg>
  );
}

/**
 * Floating WhatsApp control — the number is editable in admin → Contact & social.
 *
 * Desktop: hovering (or focusing) the button opens an invitation card: a small robot
 * leans out and waves, the telephone handset rings (shaking, with ring arcs), and a
 * clear line invites the visitor to message FRX. Clicking the button opens WhatsApp.
 *
 * Touch: there is no hover, so the FIRST tap opens the same card and the card's
 * "Open WhatsApp" link (or a second tap on the button) goes through. Nothing
 * depends on hover.
 *
 * Sound is OFF by default and nothing ever plays on load. A visible "Ring sound"
 * switch inside the card turns it on — that tap is the explicit user interaction
 * browsers require — and the choice is remembered. With sound on, opening the card
 * plays one short synthesised ring; with it off (or if audio is unavailable) the
 * interaction is identical, just silent.
 *
 * Position: part of the bottom-right dock, directly above Ask FRX, so the two
 * controls cannot overlap; it steps aside while the assistant is open.
 */
export function WhatsAppButton({ number }: { number: string }) {
  const digits = number.replace(/\D/g, "");
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const touchOnly = useRef(false);

  useEffect(() => {
    touchOnly.current = window.matchMedia("(hover: none)").matches;
    try {
      setSound(localStorage.getItem(SOUND_KEY) === "1");
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const ring = () => {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      audio.current ??= new Ctx();
      if (audio.current.state === "suspended") void audio.current.resume();
      playRing(audio.current);
    } catch {
      /* silent fallback */
    }
  };

  const show = () => {
    if (open) return;
    setOpen(true);
    if (sound) ring();
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next) ring(); // an explicit tap — this is what allows audio, and confirms it works
  };

  if (!digits) return null;
  const href = `https://wa.me/${digits}`;

  return (
    <div
      ref={wrap}
      className="fxwa"
      data-open={open}
      onMouseEnter={() => !touchOnly.current && show()}
      onMouseLeave={() => !touchOnly.current && setOpen(false)}
    >
      <div className="fxwa-card" role="region" aria-label="Contact FRX on WhatsApp" aria-hidden={!open}>
        <MiniBot />
        <div className="fxwa-copy">
          <p className="fxwa-hi">Got a project in mind?</p>
          <p className="fxwa-sub">Message the FRX team on WhatsApp — we’re a tap away.</p>
          <a className="fxwa-go" href={href} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
            Open WhatsApp <span aria-hidden="true">→</span>
          </a>
          <button
            type="button"
            className="fxwa-snd"
            role="switch"
            aria-checked={sound}
            onClick={toggleSound}
            tabIndex={open ? 0 : -1}
          >
            <span className="fxwa-snd-ic" aria-hidden="true">
              {sound ? "🔔" : "🔕"}
            </span>
            Ring sound: <b>{sound ? "On" : "Off"}</b>
          </button>
        </div>
      </div>

      <a
        className="fxwa-fab"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with FRX Technologies on WhatsApp (opens in a new tab)"
        onFocus={show}
        onClick={(e) => {
          // On touch the first tap reveals the card; the second goes through to WhatsApp.
          if (touchOnly.current && !open) {
            e.preventDefault();
            show();
          }
        }}
      >
        <span className="fxwa-ring" aria-hidden="true" />
        <span className="fxwa-ring fxwa-ring--b" aria-hidden="true" />
        <svg viewBox="0 0 32 32" className="fxwa-phone" aria-hidden="true">
          <g className="fxwa-handset">
            <path
              d="M8.5 4.5 12 4l2.4 5.6-2.6 1.9a14.5 14.5 0 0 0 6.7 6.7l1.9-2.6L26 17.5l-.5 3.5a3 3 0 0 1-3 2.6A18.5 18.5 0 0 1 5.9 7.5a3 3 0 0 1 2.6-3z"
              fill="currentColor"
            />
          </g>
          <g className="fxwa-waves" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 6.5a7 7 0 0 1 6.5 6.5" />
            <path d="M19 2.2a11.3 11.3 0 0 1 10.8 10.8" />
          </g>
        </svg>
      </a>
    </div>
  );
}
