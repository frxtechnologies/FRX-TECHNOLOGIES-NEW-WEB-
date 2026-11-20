import Link from "next/link";
import { PageJsonLd } from "@/components/shared/page-jsonld";
import { pageMetadata } from "@/lib/metadata";
import { getAffiliations, getFounders, getSettings, getTechnologies } from "@/lib/content/server";
import { pairs, paragraphs } from "@/lib/content/parse";
import { PageIntro } from "@/components/sections/page-intro";
import { AboutPath } from "@/components/sections/about-path";
import { ScrollWords } from "@/components/motion/scroll-words";
import { FoundersSection } from "@/components/sections/founders-section";
import { Technologies } from "@/components/sections/technologies";
import { BlockStack, BotBuddy, CursorBuddy, WindowBuddy } from "@/components/art/characters";
import { LaptopBuddy, PanelChart, PanelCode } from "@/components/art/scenes";
import { JsonLd } from "@/components/shared/json-ld";
import { SITE } from "@/lib/site";
import type { ReactNode } from "react";

export const metadata = pageMetadata({
  title: "About",
  description:
    "FRX Technologies is a software and technology company founded in 2026 by Feroze Mohiuddin and Raaef Usman, building custom software, AI automation, web experiences and digital products.",
  path: "/about",
});

const DIFF_ART: ReactNode[] = [
  <BlockStack key="a" className="fxab-art" />,
  <WindowBuddy key="b" className="fxab-art" />,
  <BotBuddy key="c" className="fxab-art" />,
  <CursorBuddy key="d" className="fxab-art" />,
];

export default async function AboutPage() {
  const [settings, founders, techs, affiliations] = await Promise.all([
    getSettings(),
    getFounders(),
    getTechnologies(),
    getAffiliations(),
  ]);
  const { about } = settings;
  const story = paragraphs(about.story);
  const values = pairs(about.values);
  const different = pairs(about.different);

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About FRX Technologies",
    url: `${SITE.url}/about`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name,
      foundingDate: "2026",
      founder: founders.map((f) => ({ "@type": "Person", name: f.name, jobTitle: f.role })),
    },
  };

  return (
    <>
      <PageIntro
        eyebrow="About FRX"
        title={about.lead}
        lead="Founded in 2026 by Feroze Mohiuddin and Raaef Usman."
        art={
          <>
            <LaptopBuddy className="fxp-a fxp-a--laptop fxa-bob" />
            <BotBuddy className="fxp-a fxp-a--bot fxa-bob" />
            <PanelCode className="fxp-a fxp-a--panel1 fxa-bob" />
            <PanelChart className="fxp-a fxp-a--panel2 fxa-bob" />
          </>
        }
      />

      <div className="fxab">
        <AboutPath />

        <section className="fx-container fxab-story" aria-labelledby="fxab-story-h">
          <h2 id="fxab-story-h" className="fx-label fxab-kicker">
            Our story
          </h2>
          <div className="fxab-story-body">
            {story.map((p, i) => (
              <p key={i} className={i === 0 ? "fx-h1 fxab-big" : "fx-lead"} data-fx="fade-up">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section className="fxab-statement" aria-label="Our statement">
          <div className="fx-container">
            <ScrollWords as="p" className="fxab-statement-text fx-d2" text={about.statement} />
          </div>
        </section>

        <section className="fx-container fxab-rules" aria-labelledby="fxab-rules-h">
          <header className="fxab-rules-head">
            <h2 id="fxab-rules-h" className="fx-d1 fx-up" data-fx="reveal-lines">
              How we work
            </h2>
            <p className="fx-lead" data-fx="fade-up">
              The rules we build by.
            </p>
          </header>
          <ol className="fxab-rules-list">
            {values.map((v, i) => (
              <li key={v.title} className="fxab-rule" data-fx="fade-up">
                <span className="fxab-rule-n fx-outline fx-outline--lg" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="fx-d3 fx-up">{v.title}</h3>
                  {v.body ? <p className="fx-body">{v.body}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="fx-container fxab-diff" aria-labelledby="fxab-diff-h">
          <header className="fxab-diff-head">
            <h2 id="fxab-diff-h" className="fx-d1 fx-up" data-fx="reveal-lines">
              What makes FRX different
            </h2>
          </header>
          <div className="fxab-diff-grid">
            {different.map((d, i) => (
              <article key={d.title} className="fxab-diff-card" data-tone={["tint", "paper", "ink", "blue"][i % 4]} data-fx="fade-up">
                <div className="fxab-diff-art" aria-hidden="true">
                  {DIFF_ART[i % DIFF_ART.length]}
                </div>
                <h3 className="fx-h2">{d.title}</h3>
                {d.body ? <p className="fx-body">{d.body}</p> : null}
              </article>
            ))}
          </div>
        </section>
      </div>

      <FoundersSection founders={founders} />
      <Technologies items={techs} affiliations={affiliations} />

      <section className="fxab-cta" aria-labelledby="fxab-cta-h">
        <div className="fx-container">
          <h2 id="fxab-cta-h" className="fx-d1 fx-up" data-fx="reveal-lines">
            Have something to build?
          </h2>
          <p className="fx-lead" data-fx="fade-up">
            Tell us what you are trying to make work harder.
          </p>
          <Link href="/contact" className="fx-btn fx-btn--ink fx-hover-shift" data-fx="fade-up">
            Start a project <span className="fx-shift" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <PageJsonLd path="/about" name="About" description="FRX Technologies is a software and technology company founded in 2026 by Feroze Mohiuddin and Raaef Usman." />
      <JsonLd data={aboutSchema} />
    </>
  );
}
