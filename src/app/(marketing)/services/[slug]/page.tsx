import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SERVICES, PROCESS, getService } from "@/lib/services";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/shared/page-hero";
import { ContactCta } from "@/components/shared/contact-cta";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { ArrowIcon } from "@/components/ui/icons";
import { JsonLd } from "@/components/shared/json-ld";
import { pageMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
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
 * Shared service detail layout. The structure is common across all four routes,
 * but the abstract background scene, the accent index and the copy differ, so
 * they read as siblings rather than as one template filled in four times.
 */
export default async function ServiceDetailPage({
  params,
}: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = service.related
    .map((s) => getService(s))
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
      {
        "@type": "ListItem",
        position: 3,
        name: service.name,
        item: `${SITE.url}/services/${service.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="service-detail" data-scene={service.scene}>
        <PageHero
          eyebrow={service.name}
          index={`${service.index} / ${String(SERVICES.length).padStart(2, "0")}`}
          lines={[service.tagline]}
          body={service.summary}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: service.name },
          ]}
        />

        {/* -- the problems this exists to solve ------------------------- */}
        <section className="section">
          <div className="container grid gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col gap-5">
              <p className="t-eyebrow">Usually starts with</p>
              <RevealLines
                as="h2"
                className="t-h3 max-w-[14ch]"
                lines={["The symptoms", "we hear first."]}
              />
            </div>

            <ul className="flex flex-col border-t border-[var(--border)]">
              {service.problems.map((p, i) => (
                <Reveal as="li" key={p} className="problem-row" delay={i * 0.05}>
                  <span className="t-index problem-row-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="problem-row-text">&ldquo;{p}&rdquo;</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* -- how FRX approaches it ------------------------------------- */}
        <section className="section bg-[var(--bg-elevated)]">
          <div className="container">
            <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-5">
              <p className="t-eyebrow">Approach</p>
              <RevealLines
                as="h2"
                className="t-h2 max-w-[16ch]"
                lines={["How we get", "from there to working."]}
              />
            </div>

            <ol className="approach-grid">
              {service.approach.map((step, i) => (
                <Reveal as="li" key={step.heading} className="approach-cell" delay={i * 0.05}>
                  <span className="t-index approach-cell-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="approach-cell-title">{step.heading}</h3>
                  <p className="approach-cell-body">{step.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* -- capabilities + technologies ------------------------------- */}
        <section className="section">
          <div className="container grid gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="flex flex-col gap-6">
              <p className="t-eyebrow">Capability breakdown</p>
              <ul className="flex flex-col border-t border-[var(--border)]">
                {service.capabilities.map((c) => (
                  <li key={c} className="service-band-item">
                    <span className="service-band-dot" aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <p className="t-eyebrow">Typically built with</p>
              <div className="flex flex-wrap gap-2">
                {service.technologies.map((t) => (
                  <span key={t} className="tech-chip">
                    {t}
                  </span>
                ))}
              </div>

              <p className="mt-2 max-w-[38ch] text-step-xs leading-relaxed text-[var(--text-faint)]">
                The final stack is decided per project. This is the set FRX reaches for
                on work of this kind.
              </p>
            </div>
          </div>
        </section>

        {/* -- process, condensed ---------------------------------------- */}
        <section className="section bg-[var(--bg-sunken)]">
          <div className="container">
            <div className="mb-[clamp(2rem,4vw,3rem)] flex flex-col gap-5">
              <p className="t-eyebrow">Process</p>
              <h2 className="t-h3 max-w-[18ch]">Same six stages, every project.</h2>
            </div>

            <ol className="process-strip">
              {PROCESS.map((p) => (
                <li key={p.index} className="process-strip-cell">
                  <span className="t-index process-strip-index">{p.index}</span>
                  <span className="process-strip-title">{p.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* -- related --------------------------------------------------- */}
        <section className="section">
          <div className="container">
            <p className="t-eyebrow mb-8">Related services</p>
            <ul className="grid gap-px border-y border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug} className="bg-[var(--bg)]">
                  <Link href={`/services/${r.slug}`} className="related-card">
                    <span className="t-index text-[var(--accent-text)]">{r.index}</span>
                    <span className="related-card-title">{r.title}</span>
                    <span className="related-card-body">{r.summary}</span>
                    <span className="related-card-arrow" aria-hidden="true">
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ContactCta
          eyebrow={service.name}
          lines={["Have something", "worth building?"]}
          body={`Tell us what you're trying to solve. If ${service.name.toLowerCase()} is the right answer, we'll say so — and if it isn't, we'll say that too.`}
        />
      </div>
    </>
  );
}
