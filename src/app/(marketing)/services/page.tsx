import Link from "next/link";

import { SERVICES, BUILD_CATEGORIES } from "@/lib/services";
import { TECH_CATEGORIES } from "@/lib/technologies";
import { PageHero } from "@/components/shared/page-hero";
import { ContactCta } from "@/components/shared/contact-cta";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { ArrowIcon } from "@/components/ui/icons";
import { JsonLd } from "@/components/shared/json-ld";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Digital products, intelligent automation and custom systems designed around the way your business actually works.",
  path: "/services",
});

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: SERVICES.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.title,
      description: s.summary,
      url: `${SITE.url}/services/${s.slug}`,
      provider: { "@type": "Organization", name: SITE.name },
    },
  })),
};

/**
 * The services index. Reads as an exploration of capability rather than a
 * repeat of the homepage: each service gets a full band with its own capability
 * list, so the page has depth a row list wouldn't give it.
 */
export default function ServicesPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />

      <PageHero
        eyebrow="Services"
        index={`${SERVICES.length} disciplines`}
        lines={["What we build."]}
        body="Digital products, intelligent automation and custom systems designed around the way your business actually works."
      />

      <div>
        {SERVICES.map((service, i) => (
          <section
            key={service.slug}
            className="service-band"
            data-alt={i % 2 === 1}
            aria-labelledby={`svc-${service.slug}`}
          >
            <div className="container grid gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex flex-col gap-6">
                <p className="t-index text-step-xs text-[var(--accent-text)]">
                  {service.index}
                </p>

                <RevealLines
                  as="h2"
                  className="t-h3 max-w-[14ch]"
                  lines={[service.title]}
                />

                <Reveal delay={0.08}>
                  <p className="max-w-[46ch] text-step-md leading-relaxed text-[var(--text-muted)]">
                    {service.summary}
                  </p>
                </Reveal>

                <Reveal delay={0.14}>
                  <Link href={`/services/${service.slug}`} className="service-band-link">
                    <span>Explore {service.name}</span>
                    <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>
                </Reveal>
              </div>

              <Reveal className="flex flex-col gap-5" delay={0.1}>
                <p className="t-eyebrow">Includes</p>
                <ul className="flex flex-col">
                  {service.capabilities.map((c) => (
                    <li key={c} className="service-band-item">
                      <span className="service-band-dot" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        ))}
      </div>

      {/* Capability categories — what these services get used to create. */}
      <section className="section">
        <div className="container">
          <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6">
            <p className="t-eyebrow">Applied</p>
            <RevealLines
              as="h2"
              className="t-h2 max-w-[18ch]"
              lines={["The systems these", "usually become."]}
            />
          </div>

          <ul className="build-grid">
            {BUILD_CATEGORIES.map((cat, i) => (
              <Reveal as="li" key={cat.title} className="build-cell" delay={i * 0.04}>
                <span className="t-index build-cell-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="build-cell-title">{cat.title}</h3>
                <p className="build-cell-body">{cat.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Condensed stack. The animated version lives on the homepage; here it's
          a reference table, because that's what someone on this page wants. */}
      <section className="section bg-[var(--bg-elevated)]">
        <div className="container">
          <div className="mb-[clamp(2rem,4vw,3rem)] flex flex-col gap-5">
            <p className="t-eyebrow">Stack</p>
            <h2 className="t-h3 max-w-[20ch]">
              Chosen per project, not per <span className="accent">habit</span>.
            </h2>
          </div>

          <dl className="tech-table">
            {TECH_CATEGORIES.map((cat) => (
              <Reveal key={cat.key} className="tech-table-row">
                <dt className="tech-table-label">{cat.label}</dt>
                <dd className="tech-table-items">
                  {cat.items.map((item) => (
                    <span key={item} className="tech-chip">
                      {item}
                    </span>
                  ))}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <ContactCta
        eyebrow="Next step"
        lines={["Which one of", "these is yours?"]}
        body="Describe the problem rather than the solution — the right service usually falls out of the conversation."
      />
    </>
  );
}
