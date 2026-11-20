import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SERVICES, SERVICE_LABEL, getService } from "@/lib/services";
import { getServices } from "@/lib/content/server";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/shared/json-ld";
import { PageIntro } from "@/components/sections/page-intro";
import { ServiceArtView } from "@/components/art/registry";
import { ServicesArtLife } from "@/components/sections/services-art-life";
import { Squiggle } from "@/components/art/characters";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.slug}`,
  });
}

/**
 * One layout for all nine routes, with a different illustration, ground and copy
 * each, so they read as siblings rather than one template filled in nine times.
 * Copy is the in-code default merged with any admin override (name, tagline,
 * summary, capabilities, use cases) from the `services` table.
 */
export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const all = await getServices();
  const service = all.find((s) => s.slug === slug) ?? getService(slug);
  if (!service) notFound();

  const related = service.related
    .map((r) => all.find((s) => s.slug === r))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    url: `${SITE.url}/services/${service.slug}`,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    serviceType: service.name,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE.url}/services` },
      { "@type": "ListItem", position: 3, name: service.name, item: `${SITE.url}/services/${service.slug}` },
    ],
  };

  return (
    <ServicesArtLife>
      <nav aria-label="Breadcrumb" className="fx-container fxsd-crumbs fx-label">
        <Link href="/">Home</Link> / <Link href="/services">Services</Link> / <span aria-current="page">{service.name}</span>
      </nav>

      <PageIntro
        eyebrow={`${service.index} — ${service.name}`}
        title={service.title}
        lead={service.summary}
        art={
          <div className="fxsd-hero-art">
            <ServiceArtView art={service.art} className="fxsd-svg fxa-bob" />
            <Squiggle className="fxp-a fxp-a--squig" />
          </div>
        }
      >
        <p className="fx-h3 fxsd-tag" data-fx="fade-up">
          {service.tagline}
        </p>
        <Link href="/contact" className="fx-btn fx-hover-shift" data-fx="fade-up">
          Start a project <span className="fx-shift" aria-hidden="true">→</span>
        </Link>
      </PageIntro>

      <section className="fxsd-block" aria-labelledby="fxsd-problems">
        <div className="fx-container fxsd-two">
          <h2 id="fxsd-problems" className="fx-d3 fx-up" data-fx="reveal-lines">
            Does this sound familiar?
          </h2>
          <ul className="fxsd-list">
            {service.problems.map((p) => (
              <li key={p} className="fx-lead" data-fx="fade-up">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fxsd-block fxsd-block--tint" aria-labelledby="fxsd-uses">
        <div className="fx-container">
          <h2 id="fxsd-uses" className="fx-d2 fx-up" data-fx="reveal-lines">
            Where it helps
          </h2>
          <ul className="fxsd-uses">
            {service.useCases.map((u, i) => (
              <li key={u} data-fx="fade-up">
                <span className="fxsd-use-n fx-outline fx-outline--sm" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="fx-h3">{u}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fxsd-block" aria-labelledby="fxsd-approach">
        <div className="fx-container">
          <h2 id="fxsd-approach" className="fx-d2 fx-up" data-fx="reveal-lines">
            How we approach it
          </h2>
          <ol className="fxsd-steps">
            {service.approach.map((a, i) => (
              <li key={a.heading} data-fx="fade-up">
                <span className="fxsd-step-n fx-label">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="fx-h3">{a.heading}</h3>
                <p className="fx-body">{a.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="fxsd-block fxsd-block--ink" aria-labelledby="fxsd-caps">
        <div className="fx-container fxsd-two">
          <div>
            <h2 id="fxsd-caps" className="fx-d2 fx-up" data-fx="reveal-lines">
              What&apos;s included
            </h2>
          </div>
          <div>
            <ul className="fxsd-caps">
              {service.capabilities.map((c) => (
                <li key={c} className="fx-body" data-fx="fade-up">
                  {c}
                </li>
              ))}
            </ul>
            {service.technologies.length > 0 && (
              <div className="fxsd-tech">
                <p className="fx-label">Technologies we use for this</p>
                <ul>
                  {service.technologies.map((t) => (
                    <li key={t} className="fx-label">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="fxsd-block" aria-labelledby="fxsd-related">
          <div className="fx-container">
            <h2 id="fxsd-related" className="fx-d3 fx-up" data-fx="reveal-lines">
              Related services
            </h2>
            <div className="fxsd-related">
              {related.map((r) => (
                <Link key={r.slug} href={`/services/${r.slug}`} className="fxsd-rel" data-fx="fade-up">
                  <ServiceArtView art={r.art} className="fxsd-rel-art fxa-bob" />
                  <span className="fx-label">{r.index}</span>
                  <span className="fx-h2">{SERVICE_LABEL[r.slug]}</span>
                  <span className="fx-body fx-muted">{r.tagline}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="fxab-cta" aria-labelledby="fxsd-cta">
        <div className="fx-container">
          <h2 id="fxsd-cta" className="fx-d1 fx-up" data-fx="reveal-lines">
            Let&apos;s talk about yours.
          </h2>
          <p className="fx-lead" data-fx="fade-up">
            Tell us what you want to build and the problem behind it.
          </p>
          <Link href="/contact" className="fx-btn fx-btn--ink fx-hover-shift">
            Start a project <span className="fx-shift" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <JsonLd data={schema} />
      <JsonLd data={breadcrumbSchema} />
    </ServicesArtLife>
  );
}
