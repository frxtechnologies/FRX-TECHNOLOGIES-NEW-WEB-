import { pageMetadata } from "@/lib/metadata";
import { PageJsonLd } from "@/components/shared/page-jsonld";
import { getSettings } from "@/lib/content/server";
import { ContactSection } from "@/components/sections/contact-section";
import { JsonLd } from "@/components/shared/json-ld";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Tell FRX Technologies what you want to build. Email, phone, WhatsApp or the project enquiry form.",
  path: "/contact",
});

const NEXT = [
  ["We read it", "Every enquiry is read by the founders."],
  ["We reply by email", "To talk through what you want to build and the problem behind it."],
  ["We shape the scope", "Together, before anything is proposed."],
] as const;

export default async function ContactPage() {
  const { contact } = await getSettings();
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact FRX Technologies",
    url: `${SITE.url}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name,
      email: contact.email,
      telephone: contact.phone,
    },
  };
  return (
    <>
      <div className="fxc-top">
        <ContactSection contact={contact} asPage />
      </div>
      <section className="fxab-cta fxc-next" aria-labelledby="fxc-next-h">
        <div className="fx-container">
          <h2 id="fxc-next-h" className="fx-d3 fx-up" data-fx="reveal-lines">
            What happens next
          </h2>
          <ol className="fxsv-steps">
            {NEXT.map(([t, b], i) => (
              <li key={t} data-fx="fade-up">
                <span className="fxsv-step-n fx-outline fx-outline--sm" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="fx-h3">{t}</h3>
                <p className="fx-body">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <PageJsonLd path="/contact" name="Contact" description="Contact FRX Technologies by email, phone, WhatsApp or the project enquiry form." />
      <JsonLd data={schema} />
    </>
  );
}
