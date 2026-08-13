import { SOCIAL } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { PageHero } from "@/components/shared/page-hero";
import { ProjectForm } from "@/components/contact/project-form";
import { InstagramIcon, LinkedInIcon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Tell FRX Technologies what you're trying to build and the problem you're trying to solve.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        lines={["Let's build", "something useful."]}
        body="Tell us what you're trying to build, the problem behind it, and anything you already know about the requirements. We'll come back with an approach."
      />

      <section className="section">
        <div className="container grid gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <ProjectForm />

          <aside className="flex flex-col gap-[clamp(2rem,4vw,3rem)]">
            <div className="flex flex-col gap-4">
              <p className="t-eyebrow">What we&apos;ll ask next</p>
              <ul className="flex flex-col gap-3 text-step-sm leading-relaxed text-[var(--text-muted)]">
                <li className="flex gap-3">
                  <span className="signal-tick mt-[0.7em] shrink-0" />
                  What does the process look like today, including the manual parts.
                </li>
                <li className="flex gap-3">
                  <span className="signal-tick mt-[0.7em] shrink-0" />
                  Who uses it, and how often.
                </li>
                <li className="flex gap-3">
                  <span className="signal-tick mt-[0.7em] shrink-0" />
                  What has to be true for this to count as working.
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <p className="t-eyebrow">Services</p>
              <ul className="flex flex-col gap-2">
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <a
                      href={`/services/${s.slug}`}
                      className="frx-foot-link text-step-sm"
                    >
                      {s.name}
                      <span className="frx-foot-arrow">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <p className="t-eyebrow">Elsewhere</p>
              <div className="flex flex-col gap-2">
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="frx-foot-link text-step-sm"
                >
                  <InstagramIcon className="h-4 w-4" />
                  Instagram
                  <span className="frx-foot-arrow">↗</span>
                </a>
                <a
                  href={SOCIAL.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="frx-foot-link text-step-sm"
                >
                  <LinkedInIcon className="h-4 w-4" />
                  LinkedIn
                  <span className="frx-foot-arrow">↗</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
