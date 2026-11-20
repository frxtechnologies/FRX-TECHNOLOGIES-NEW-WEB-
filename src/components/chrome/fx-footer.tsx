import Link from "next/link";
import { FrxLogo } from "@/components/brand/frx-logo";
import { NAV_LINKS } from "@/lib/site";
import { SERVICE_LABEL, type Service } from "@/lib/services";
import { FooterBounce } from "./footer-bounce";
import type { Settings } from "@/lib/content/types";

const SOCIAL_LABEL: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X",
  github: "GitHub",
  youtube: "YouTube",
};

/**
 * Editorial footer. A giant BUILD. AUTOMATE. SCALE. wordmark, the full FRX
 * logo, navigation, every service, contact details and any social links the
 * owner has configured (empty ones are simply not shown). All of it is editable
 * in admin → Settings; none of it is hard-coded here.
 */
function SocialIcon({ name }: { name: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="fxo-soc-ic">
      {name === "instagram" && (
        <>
          <rect {...p} x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle {...p} cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </>
      )}
      {name === "linkedin" && (
        <>
          <rect {...p} x="3.5" y="3.5" width="17" height="17" rx="3" />
          <path {...p} d="M8 10.5V16M8 7.8v.1M11.5 16v-3.2a2.3 2.3 0 0 1 4.6 0V16M11.5 10.5V16" />
        </>
      )}
      {name !== "instagram" && name !== "linkedin" && <circle {...p} cx="12" cy="12" r="8" />}
    </svg>
  );
}

export function FxFooter({ settings, services }: { settings: Settings; services: Service[] }) {
  const { contact, social, footer } = settings;
  const socials = Object.entries(social).filter(([, url]) => url && /^https?:\/\//.test(url));
  const year = new Date().getFullYear();

  return (
    <footer className="fxo" aria-labelledby="fxo-title">
      <FooterBounce email={contact.email} />

      <div className="fx-container fxo-grid">
        <div className="fxo-brand">
          <h2 id="fxo-title" className="sr-only">
            FRX Technologies
          </h2>
          <FrxLogo className="fxo-logo" sizes="220px" />
          <p className="fx-body fxo-blurb">{footer.blurb}</p>
        </div>

        <nav aria-label="Footer" className="fxo-col">
          <p className="fx-label">Navigate</p>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="fx-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services" className="fxo-col">
          <p className="fx-label">Services</p>
          <ul>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="fx-link">
                  {SERVICE_LABEL[s.slug]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="fxo-col">
          <p className="fx-label">Contact</p>
          <ul>
            <li>
              <a className="fx-link" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </li>
            <li>
              <a className="fx-link" href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                {contact.phone}
              </a>
            </li>
            <li>
              <a className="fx-link" href={`https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                WhatsApp · {contact.whatsappDisplay}
              </a>
            </li>
          </ul>
          {socials.length > 0 && (
            <>
              <p className="fx-label fxo-social-h">Follow</p>
              <ul className="fxo-social">
                {socials.map(([k, url]) => (
                  <li key={k}>
                    <a className="fxo-soc" href={url} target="_blank" rel="noopener noreferrer" aria-label={`FRX Technologies on ${SOCIAL_LABEL[k] ?? k} (opens in a new tab)`}>
                      <SocialIcon name={k} />
                      <span className="fx-link">{SOCIAL_LABEL[k] ?? k}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="fx-container fxo-legal">
        <p className="fx-small">
          © {year} {footer.copyright}
        </p>
        <p className="fx-small fx-muted">Founded 2026 · Feroze Mohiuddin &amp; Raaef Usman</p>
      </div>
    </footer>
  );
}
