import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { MotionReady } from "@/components/providers/motion-ready";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { FrxLoader } from "@/components/chrome/frx-loader";
import { PageTransition } from "@/components/chrome/page-transition";
import { CustomCursor } from "@/components/chrome/custom-cursor";
import { QuickAssistant } from "@/components/assistant/quick-assistant";
import { FxDefs } from "@/design-system/outline";
import { FxArtDefs } from "@/components/art/characters";

/**
 * Every piece of the "premium marketing site" chrome lives here, scoped to
 * the public route group — not in the root layout.
 *
 * It used to be in the root layout, which meant /admin got all of it too:
 * a full Lenis smooth-scroll instance with its own rAF loop, the branded
 * loader's sessionStorage check, the page-transition blade's GSAP timeline,
 * the custom cursor's pointer tracking, and the marketing Navbar/Footer/
 * QuickAssistant sitting behind (and visually clashing with) the admin UI.
 * None of that serves a dashboard. This is the actual fix, not a pathname
 * check sprinkled into seven components — the route group makes it
 * structurally impossible for admin pages to pull this in again by accident.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="fx-root">
      {/* Shared SVG definitions, mounted once: outline filters + character gradients. */}
      <FxDefs />
      <FxArtDefs />
      <MotionReady />
      <SmoothScroll />
      <FrxLoader />
      <PageTransition />
      <CustomCursor />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <QuickAssistant />
    </div>
  );
}
