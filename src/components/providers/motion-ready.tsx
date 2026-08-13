"use client";

import { useScrollTriggerRefresh } from "@/lib/gsap";

/**
 * ScrollTrigger caches every start/end position at setup. Web fonts and images
 * that arrive afterwards change the document height and silently invalidate all
 * of them, which is what makes pinned scenes end in the wrong place. This
 * re-measures once both have settled.
 *
 * (The `js-motion` class that gates pre-animation states is set in the blocking
 * head script instead, so it lands before first paint.)
 */
export function MotionReady() {
  useScrollTriggerRefresh();
  return null;
}
