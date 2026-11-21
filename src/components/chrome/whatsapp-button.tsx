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

/** The WhatsApp glyph (Simple Icons, CC0): the familiar speech bubble with a handset. */
const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

/**
 * Floating WhatsApp contact button — the number is editable in admin → Contact & social.
 *
 * It sits in the BOTTOM-LEFT corner (Ask FRX owns the bottom-right), so the two never meet.
 *
 * Nothing happens on hover or focus. The button only does something when the visitor CLICKS or TAPS it:
 * it opens a small card where a robot leans out and waves, the button emits rings, and a clear
 * "Open WhatsApp" call-to-action appears. Clicking the button again, pressing Escape or clicking
 * elsewhere closes it. Mouse, touch and keyboard all behave the same, so nothing relies on hover.
 *
 * Sound is OFF by default and nothing ever plays on load, on hover or on its own. A visible "Ring sound"
 * switch inside the card turns it on — that tap is the explicit user interaction browsers require — and
 * the choice is remembered. With sound on, opening the card plays one short synthesised ring.
 */
export function WhatsAppButton({ number }: { number: string }) {
  const digits = number.replace(/D/g, "");
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const fab = useRef<HTMLButtonElement>(null);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      setSound(localStorage.getItem(SOUND_KEY) === "1");
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      fab.current?.focus();
    };
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

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && sound) ring(); // only ever as a direct result of the visitor's click/tap
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
    <div ref={wrap} className="fxwa" data-open={open}>
      <div id="fxwa-card" className="fxwa-card" role="region" aria-label="Contact FRX on WhatsApp" aria-hidden={!open}>
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

      <button
        ref={fab}
        type="button"
        className="fxwa-fab"
        aria-expanded={open}
        aria-controls="fxwa-card"
        aria-label={open ? "Close WhatsApp contact options" : "Contact FRX on WhatsApp"}
        onClick={toggle}
      >
        <span className="fxwa-ring" aria-hidden="true" />
        <span className="fxwa-ring fxwa-ring--b" aria-hidden="true" />
        <svg viewBox="0 0 24 24" className="fxwa-icon" aria-hidden="true" focusable="false">
          <path d={WA_PATH} fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
