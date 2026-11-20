/**
 * FRX motion + responsive constants. CSS counterparts live in ../tokens.css
 * (durations in ms there, seconds here — keep them in sync).
 */

/** Seconds (GSAP). */
export const DURATION = {
  instant: 0.12,
  fast: 0.24,
  base: 0.48,
  slow: 0.8,
  cinematic: 1.2,
} as const;

/** GSAP ease names, mapped to the CSS curves in tokens.css. */
export const EASE = {
  /** default entrance: fast start, long settle (CSS --fx-ease-out) */
  out: "expo.out",
  /** softer entrance for small UI (CSS --fx-ease-signal) */
  outSoft: "power3.out",
  /** movements that start and end on screen (CSS --fx-ease-in-out) */
  inOut: "power3.inOut",
  /** scroll-linked motion must be linear or it fights the scrollbar */
  scrub: "none",
  /** tiny overshoot for pills and icons (CSS --fx-ease-spring) */
  spring: "back.out(1.5)",
} as const;

/** Per-unit stagger (seconds) for split text. */
export const STAGGER = {
  chars: 0.016,
  words: 0.06,
  lines: 0.1,
} as const;

/** Px. Used literally in CSS @media — custom properties can't be. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

/** Media queries for gsap.matchMedia(). */
export const MQ = {
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 0.02}px)`,
  aboveMobile: `(min-width: ${BREAKPOINTS.md}px)`,
  mobile: `(max-width: ${BREAKPOINTS.md - 0.02}px)`,
  reduce: "(prefers-reduced-motion: reduce)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;
