import type { Metadata } from "next";
import { FxHero } from "@/components/home/fx-hero";
import { FxMarquee } from "@/components/home/fx-marquee";
import { AboutPreview } from "@/components/sections/about-preview";
import { SelectedWork } from "@/components/sections/selected-work";
import { ServicesPinned } from "@/components/sections/services-pinned";
import { Technologies } from "@/components/sections/technologies";
import { Testimonials, type TestimonialItem } from "@/components/sections/testimonials";
import { ReelSection } from "@/components/sections/reel-section";
import { SOCIAL } from "@/lib/site";
import { Faq } from "@/components/sections/faq";
import { LeaveReview } from "@/components/sections/leave-review";
import { ContactSection } from "@/components/sections/contact-section";
import { JsonLd } from "@/components/shared/json-ld";
import { mediaUrl } from "@/lib/content/media";
import {
  getAffiliations,
  getApprovedReviews,
  getFaqs,
  getProjects,
  getServices,
  getSettings,
  getTechnologies,
  getTestimonials,
} from "@/lib/content/server";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The homepage, in order:
 *   A hero · B statement strip · C about · D selected work · E services ·
 *   F technologies · G testimonials · H founders · I FAQ · J leave a review · K contact
 * (the footer and the floating WhatsApp button live in the marketing layout).
 *
 * Every section reads editable content (Supabase → admin) with in-code defaults,
 * and nothing is invented: the testimonials section appears only once real,
 * approved testimonials or reviews exist.
 */
export default async function HomePage() {
  const [settings, projects, services, techs, affiliations, faqs, testimonials, reviews] =
    await Promise.all([
      getSettings(),
      getProjects(),
      getServices(),
      getTechnologies(),
      getAffiliations(),
      getFaqs(),
      getTestimonials(),
      getApprovedReviews(),
    ]);

  const quotes: TestimonialItem[] = [
    ...testimonials.map((t) => ({
      id: t.id,
      name: t.name,
      designation: t.designation,
      company: t.company,
      text: t.text,
      portrait: t.portrait,
    })),
    ...reviews.map((r) => ({
      id: r.id,
      name: r.name,
      designation: "",
      company: r.company,
      text: r.text,
      portrait: null,
      rating: r.rating,
    })),
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <FxHero
        content={settings.hero}
        images={{
          window: mediaUrl(settings.hero.imageWindow),
          bot: mediaUrl(settings.hero.imageBot),
          blocks: mediaUrl(settings.hero.imageBlocks),
        }}
      />
      <FxMarquee />
      <AboutPreview text={settings.about.preview} />
      <ServicesPinned services={services} />
      <Technologies items={techs} affiliations={affiliations} />
      <Testimonials items={quotes} />
      <SelectedWork projects={projects} />
      <ReelSection
        url={settings.media.reelUrl}
        heading={settings.media.reelHeading}
        text={settings.media.reelText}
        profileUrl={settings.social.instagram || SOCIAL.instagram}
      />
      <Faq faqs={faqs} />
      <LeaveReview />
      <ContactSection contact={settings.contact} />
      <JsonLd data={faqSchema} />
    </>
  );
}
