import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/design-system/tokens.css";
import "@/design-system/type.css";
import "@/design-system/motion/fx.css";
import "./showcase.css";
import { fxFontClasses } from "@/design-system/fonts";
import { MotionReady } from "@/components/providers/motion-ready";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { ClearIntroFlag } from "./clear-intro-flag";

/**
 * FRX design-system showcase — isolated review page.
 *
 * The system itself lives in src/design-system/ (tokens, type, motion). This
 * folder (src/app/design-system/) is only the page that presents it, so it can
 * be deleted without touching the system. Nothing here is linked from the
 * site, it is noindex, and it is not in the sitemap.
 */
export const metadata: Metadata = {
  title: "FRX design system (review)",
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  // Internal development reference only — not part of the production website.
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className={fxFontClasses}>
      <ClearIntroFlag />
      <MotionReady />
      <SmoothScroll />
      {children}
    </div>
  );
}
