"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useFx } from "@/design-system/motion/fx";

/**
 * Mounts the data-fx motion controller once for a whole page.
 *
 * Server-rendered sections mark elements with `data-fx="reveal-lines"`,
 * `fade-up`, `image-reveal`, `parallax`, `color-scroll`, `pin` or `horizontal`
 * (see design-system/motion/fx.ts for the full list) and this wrapper brings
 * them to life — so only genuinely interactive sections need to be client
 * components. Everything is built inside gsap.matchMedia, so a resize or a
 * reduced-motion change reverts and rebuilds cleanly.
 */
export function FxScope({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // The layout (and this scope) persists across client-side navigations, so the
  // controller is rebuilt per route; otherwise a new page's data-fx elements
  // would never wake up.
  const pathname = usePathname();
  useFx(ref, [pathname]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
