import Link from "next/link";
import { NAV_LINKS, SITE, SOCIAL } from "@/lib/site";
import { FrxLogo } from "@/components/brand/frx-logo";
import { SERVICES } from "@/lib/services";
import { ActionButton } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { InstagramIcon, LinkedInIcon } from "@/components/ui/icons";
import { RevealLines } from "@/components/ui/reveal";

/**
 * The footer closes the site's visual story rather than listing links in four
 * columns. The wordmark runs off both edges along the bottom, cropped by the
 * viewport — the last thing on the page is the brand at full scale.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-clip border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="signal-grid opacity-60" aria-hidden="true" />

      <div className="container relative pt-[clamp(4rem,9vw,8rem)]">
        {/* -- closing call ------------------------------------------------ */}
        <div className="flex flex-col gap-8 border-b border-[var(--border)] pb-[clamp(3rem,6vw,5.5rem)] lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="t-eyebrow mb-5">Next step</p>
            <RevealLines
              as="h2"
              className="t-h2 max-w-[16ch]"
              lines={[
                "Have something",
                <span key="build">
                  worth <span className="accent">building</span>?
                </span>,
              ]}
            />
          </div>

          <Magnetic>
            <ActionButton href="/contact" className="text-step-md">
              Start a Project
            </ActionButton>
          </Magnetic>
        </div>

        {/* -- directory --------------------------------------------------- */}
        <div className="grid gap-x-8 gap-y-12 py-[clamp(3rem,6vw,5rem)] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-6">
            <Link href="/" aria-label="FRX Technologies — home" className="block w-[clamp(150px,16vw,200px)]">
              <FrxLogo sizes="200px" />
            </Link>
            <p className="max-w-[34ch] text-step-xs text-[var(--text-muted)]">
              {SITE.statement}
            </p>
          </div>

          <FooterColumn title="Site">
            {NAV_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Services">
            {SERVICES.map((s) => (
              <FooterLink key={s.slug} href={`/services/${s.slug}`}>
                {s.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Follow">
            <FooterLink href={SOCIAL.instagram} external>
              <InstagramIcon className="h-3.5 w-3.5" />
              Instagram
            </FooterLink>
            <FooterLink href={SOCIAL.linkedin} external>
              <LinkedInIcon className="h-3.5 w-3.5" />
              LinkedIn
            </FooterLink>
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] py-6 text-step-xs text-[var(--text-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}
          </p>
          <p className="t-index">{SITE.philosophy}</p>
        </div>
      </div>

      {/* -- the wordmark, cropped by the viewport ------------------------- */}
      <div
        className="relative -mb-[2vw] select-none px-[var(--gutter)] pb-2"
        aria-hidden="true"
      >
        <span className="frx-footer-mark block leading-[0.72] font-extrabold tracking-[-0.055em] whitespace-nowrap">
          FRX TECHNOLOGIES
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="t-eyebrow">{title}</h2>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "frx-foot-link inline-flex items-center gap-2 text-step-sm text-[var(--text-muted)]";
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
          <span className="frx-foot-arrow">↗</span>
        </a>
      ) : (
        <Link href={href} className={cls}>
          {children}
          <span className="frx-foot-arrow">→</span>
        </Link>
      )}
    </li>
  );
}
