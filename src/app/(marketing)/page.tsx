import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { Rails } from "@/components/home/rails";
import { IntroStatement } from "@/components/home/intro-statement";
import { ServiceIndex } from "@/components/home/service-index";
import { HorizontalJourney } from "@/components/home/horizontal-journey";
import { GrowthFeature } from "@/components/home/growth-feature";
import { Process } from "@/components/home/process";
import { TechnologyScene } from "@/components/home/technology-scene";
import { AutomationScene } from "@/components/home/automation-scene";
import { BuildCategories } from "@/components/home/build-categories";
import { Founders } from "@/components/home/founders";
import { ReelSection } from "@/components/home/reel-section";
import { ContactCta } from "@/components/shared/contact-cta";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The homepage narrative, in order:
 * hero → rails → statement + counters → services index → horizontal journey →
 * automation argument → automation mechanism → process → stack → what we build →
 * founders → reel → closing CTA.
 *
 * The order is chosen so surfaces alternate — light, elevated, black, blue —
 * and each section hands off to a different ground than it started on.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Rails />
      <IntroStatement />
      <ServiceIndex />
      <HorizontalJourney />
      <GrowthFeature />
      <AutomationScene />
      <Process />
      <TechnologyScene />
      <BuildCategories />
      <Founders />
      <ReelSection />
      <ContactCta />
    </>
  );
}
