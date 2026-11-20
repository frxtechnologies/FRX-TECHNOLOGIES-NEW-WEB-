"use client";

import { useLayoutEffect } from "react";

/**
 * The root pre-paint script hides content behind `data-intro-light` until
 * FrxLoader clears it; this route has no loader, so it clears the flag itself.
 * Review-page only — goes away with the folder.
 */
export function ClearIntroFlag() {
  useLayoutEffect(() => {
    document.documentElement.removeAttribute("data-intro-light");
  }, []);
  return null;
}
