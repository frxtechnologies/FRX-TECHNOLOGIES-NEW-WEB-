import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { ActionButton } from "@/components/ui/button";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { MotionReady } from "@/components/providers/motion-ready";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { FrxLoader } from "@/components/chrome/frx-loader";
import { PageTransition } from "@/components/chrome/page-transition";
import { CustomCursor } from "@/components/chrome/custom-cursor";
import { QuickAssistant } from "@/components/assistant/quick-assistant";

export const metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

/**
 * `not-found.tsx` at this level is what Next.js falls back to for a URL that
 * doesn't match any route at all — not a redirect, a genuine boundary the
 * framework picks on its own. That means it sits outside the `(marketing)`
 * route group's layout, so it doesn't inherit the marketing chrome the way
 * every real page does. It renders that chrome itself instead, so a mistyped
 * URL still looks and behaves like the rest of the site rather than like a
 * bare error page.
 */
export default function NotFound() {
  return (
    <>
      <MotionReady />
      <SmoothScroll />
      <FrxLoader />
      <PageTransition />
      <CustomCursor />
      <Navbar />
      <main id="main">
        <section className="relative flex min-h-[100svh] flex-col justify-center overflow-clip pt-[var(--nav-h)]">
          <span className="page-hero-light" aria-hidden="true" />

          <div className="container relative flex flex-col gap-8">
            <p className="t-eyebrow flex items-center gap-3">
              <span className="signal-tick" />
              Error 404
            </p>

            <p className="t-mega leading-[0.82] font-semibold">404</p>

            <h1 className="t-h3 max-w-[16ch]">This route doesn&apos;t exist.</h1>

            <p className="t-lead max-w-[44ch]">
              The address is wrong, or the page moved. Everything FRX actually publishes is
              one click away.
            </p>

            <div className="flex flex-wrap gap-3">
              <ActionButton href="/">Return home</ActionButton>
              <ActionButton href="/contact" variant="outline">
                Start a Project
              </ActionButton>
            </div>

            <nav
              aria-label="Services"
              className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-6"
            >
              <p className="t-eyebrow">Or go straight to</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="frx-foot-link">
                      {s.name}
                      <span className="frx-foot-arrow">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>
      </main>
      <Footer />
      <QuickAssistant />
    </>
  );
}
