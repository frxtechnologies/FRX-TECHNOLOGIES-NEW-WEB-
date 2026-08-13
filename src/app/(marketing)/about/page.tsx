import { BELIEFS } from "@/lib/services";
import { TECH_CATEGORIES } from "@/lib/technologies";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/shared/page-hero";
import { ContactCta } from "@/components/shared/contact-cta";
import { Founders } from "@/components/home/founders";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About",
  description:
    "FRX Technologies combines software engineering, AI, automation and product design to build technology around real operational requirements.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About FRX"
        lines={["Technology should solve", "the business,", "not complicate it."]}
        body="FRX Technologies combines software engineering, artificial intelligence, automation and product design to build systems around how a business actually operates."
        variant="wide"
      />

      {/* -- philosophy ---------------------------------------------------- */}
      <section className="section">
        <div className="container grid gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <p className="t-eyebrow">Philosophy</p>

          <div className="flex flex-col gap-8">
            <RevealLines
              as="h2"
              className="t-h3 max-w-[24ch]"
              lines={[
                "Most software fails for the",
                <span key="p2">
                  same reason: it was built to be{" "}
                  <span className="accent">sold</span>, not used.
                </span>,
              ]}
            />

            <Reveal className="flex max-w-[58ch] flex-col gap-5 text-step-md leading-relaxed text-[var(--text-muted)]">
              <p>
                Generic platforms are shaped around the average of every business that
                might buy them. That average doesn&apos;t exist. What exists is a specific
                team with a specific process, and the gap between the two is where the
                spreadsheets, the workarounds and the manual re-entry come from.
              </p>
              <p>
                FRX starts from the requirement instead. We map how the work actually
                moves — who touches what, in what order, and where it stalls — then build
                technology around that. Sometimes that&apos;s a website. Sometimes it&apos;s
                an automation that quietly removes four hours a week. Sometimes it&apos;s a
                full system. The stack follows the problem, never the other way around.
              </p>
              <p className="text-[var(--text)]">{SITE.philosophy}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -- beliefs ------------------------------------------------------- */}
      <section className="section bg-[var(--bg-elevated)]">
        <div className="container">
          <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-5">
            <p className="t-eyebrow">What we believe</p>
            <RevealLines
              as="h2"
              className="t-h2 max-w-[18ch]"
              lines={["Five rules we", "actually follow."]}
            />
          </div>

          <ul className="belief-list">
            {BELIEFS.map((b, i) => (
              <Reveal as="li" key={b.title} className="belief-row" delay={i * 0.05}>
                <span className="t-index belief-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="belief-title">{b.title}</h3>
                <p className="belief-body">{b.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Founders />

      {/* -- capabilities, condensed --------------------------------------- */}
      <section className="section bg-[var(--bg-elevated)]">
        <div className="container">
          <div className="mb-[clamp(2rem,4vw,3rem)] flex flex-col gap-5">
            <p className="t-eyebrow">Capabilities</p>
            <h2 className="t-h3 max-w-[20ch]">
              What we work <span className="accent">across</span>.
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
        eyebrow="Work with FRX"
        lines={["Have something", "worth building?"]}
        body="If you've read this far, you probably have a specific problem in mind. Tell us about it."
      />
    </>
  );
}
