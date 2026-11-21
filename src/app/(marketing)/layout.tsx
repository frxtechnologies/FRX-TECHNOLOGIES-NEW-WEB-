import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { MotionReady } from "@/components/providers/motion-ready";
import { OffscreenPause } from "@/components/providers/offscreen-pause";
import { Navbar } from "@/components/chrome/navbar";
import { FxFooter } from "@/components/chrome/fx-footer";
import { WhatsAppButton } from "@/components/chrome/whatsapp-button";
import { FrxLoader } from "@/components/chrome/frx-loader";
import { PageTransition } from "@/components/chrome/page-transition";
import { CustomCursor } from "@/components/chrome/custom-cursor";
import { QuickAssistant } from "@/components/assistant/quick-assistant";
import { FxScope } from "@/components/motion/fx-scope";
import { GlowField } from "@/components/motion/glow-field";
import "@/components/motion/glow.css";
import { FxDefs } from "@/design-system/outline";
import { FxArtDefs } from "@/components/art/characters";
import { getServices, getSettings } from "@/lib/content/server";
import "@/components/sections/sections.css";
import "@/components/sections/pages.css";

/**
 * Content edits in /admin appear on the live site within a minute (ISR), and
 * immediately after the admin saves (the admin calls /api/revalidate).
 */
export const revalidate = 60;

/**
 * Every piece of the "premium marketing site" chrome lives here, scoped to the
 * public route group — not in the root layout — so /admin never pulls in the
 * smooth-scroll instance, loader, cursor or transitions.
 */
export default async function MarketingLayout({ children }: LayoutProps<"/">) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);

  return (
    <div className="fx-root">
      {/* Shared SVG definitions, mounted once: outline filters + character gradients. */}
      <FxDefs />
      <FxArtDefs />
      <MotionReady />
      <GlowField />
      <SmoothScroll />
      <OffscreenPause />
      <FrxLoader />
      <PageTransition />
      <CustomCursor />
      <Navbar />
      <FxScope>
        <main id="main">{children}</main>
      </FxScope>
      <FxFooter settings={settings} services={services} />
      <WhatsAppButton number={settings.contact.whatsappNumber} />
      <QuickAssistant />
    </div>
  );
}
