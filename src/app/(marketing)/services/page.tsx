import Link from "next/link";
import { PageJsonLd } from "@/components/shared/page-jsonld";
import { pageMetadata } from "@/lib/metadata";
import { PROCESS, SERVICE_LABEL } from "@/lib/services";
import { getServices } from "@/lib/content/server";
import { PageIntro } from "@/components/sections/page-intro";
import { ServiceArtView } from "@/components/art/registry";
import { ServicesArtLife } from "@/components/sections/services-art-life";
import { JsonLd } from "@/components/shared/json-ld";
import { SITE } from "@/lib/site";
import { Squiggle } from "@/components/art/characters";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Custom software, AI automation, web and mobile applications, business systems, AI assistants, UI/UX and analytics from FRX Technologies.",
  path: "/services",
});

const TONES = ["tint", "paper", "ink", "blue"] as const;

export default async function ServicesPage() {
  const services = await getServices();

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: SERVICE_LABEL[s.slug],
      url: `${SITE.url}/services/${s.slug}`,
    })),
  };

  return (
    <>
      <PageIntro
        eyebrow="Services"
        title="What we build"
        lead="Custom software, intelligent automation and digital products — nine ways we help businesses move forward."
        art={
          <>
            <Squiggle className="fxp-a fxp-a--squig" />
          </>
        }
      />

      <ServicesArtLife>
        <section className="fxsv" aria-label="All services">
          {services.map((s, i) => (
            <article key={s.slug} className="fxsv-row" data-tone={TONES[i % TONES.length]} id={s.slug}>
              <div className="fx-container fxsv-in">
                <div className="fxsv-copy">
                  <p className="fx-label fxsv-idx">{s.index}</p>
                  <h2 className="fx-d2 fx-up" data-fx="reveal-lines">
                    {SERVICE_LABEL[s.slug]}
                  </h2>
                  <p className="fx-h3 fxsv-tag" data-fx="fade-up">
                    {s.tagline}
                  </p>
                  <p className="fx-body fxsv-sum" data-fx="fade-up">
                    {s.summary}
                  </p>
                  <ul className="fxsv-caps" aria-label={`${s.name} capabilities`}>
                    {s.capabilities.slice(0, 4).map((c) => (
                      <li key={c} className="fx-small">
                        {c}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/services/${s.slug}`} className="fx-btn fx-btn--ink fx-hover-shift">
                    Explore {s.name} <span className="fx-shift" aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className="fxsv-art" aria-hidden="true" data-fx="fade-up">
                  <ServiceArtView art={s.art} className="fxsv-svg fxa-bob" />
                </div>
              </div>
            </article>
          ))}
        </section>
      </ServicesArtLife>

      <section className="fxsv-process" aria-labelledby="fxsv-process-h">
        <div className="fx-container">
          <h2 id="fxsv-process-h" className="fx-d1 fx-up" data-fx="reveal-lines">
            How a project runs
          </h2>
          <ol className="fxsv-steps">
            {PROCESS.map((p) => (
              <li key={p.index} data-fx="fade-up">
                <span className="fxsv-step-n fx-outline fx-outline--sm" aria-hidden="true">
                  {p.index}
                </span>
                <h3 className="fx-h3">{p.title}</h3>
                <p className="fx-body">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="fxab-cta" aria-labelledby="fxsv-cta-h">
        <div className="fx-container">
          <h2 id="fxsv-cta-h" className="fx-d1 fx-up" data-fx="reveal-lines">
            Not sure which one you need?
          </h2>
          <p className="fx-lead" data-fx="fade-up">
            Describe the problem. We will tell you what we would build.
          </p>
          <Link href="/contact" className="fx-btn fx-btn--ink fx-hover-shift">
            Start a project <span className="fx-shift" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <PageJsonLd path="/services" name="Services" description="Custom software, AI automation, web and mobile applications, business systems, AI assistants, UI/UX and analytics." />
      <JsonLd data={schema} />
    </>
  );
}
