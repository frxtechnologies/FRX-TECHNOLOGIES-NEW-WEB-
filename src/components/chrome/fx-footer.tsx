import Link from "next/link";
import { FrxLogo } from "@/components/brand/frx-logo";
import { NAV_LINKS } from "@/lib/site";
import { SERVICE_LABEL, type Service } from "@/lib/services";
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
export function FxFooter({ settings, services }: { settings: Settings; services: Service[] }) {
  const { contact, social, footer } = settings;
  const socials = Object.entries(social).filter(([, url]) => url && /^https?:\/\//.test(url));
  const year = new Date().getFullYear();

  return (
    <footer className="fxo" aria-labelledby="fxo-title">
      <div className="fxo-big" aria-hidden="true">
        <span>Build.</span>
        <span>Automate.</span>
        <span className="fx-outline fx-outline--lg">Scale.</span>
      </div>

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
                    <a className="fx-link" href={url} target="_blank" rel="noopener noreferrer">
                      {SOCIAL_LABEL[k] ?? k}
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
