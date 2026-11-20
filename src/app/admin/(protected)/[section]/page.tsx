import { notFound } from "next/navigation";
import { ResourceManager } from "@/components/admin/resource-manager";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { RESOURCES, SETTINGS_PAGES } from "@/components/admin/registry";

export const metadata = { robots: { index: false, follow: false } };

/**
 * One route for every registry-driven admin screen: collection managers
 * (projects, technologies, testimonials, faq, affiliations, services) and
 * settings pages (homepage, about, contact, footer). Static routes —
 * inquiries, reviews, founders, assistant — take precedence over this one.
 * The admin gate is the protected layout above; the real boundary is RLS.
 */
export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;

  if (RESOURCES[section]) return <ResourceManager config={RESOURCES[section]} />;

  const page = SETTINGS_PAGES[section];
  if (page) {
    return (
      <>
        <header className="admin-header">
          <div>
            <h1 className="admin-title">{page.title}</h1>
            <p className="rm-intro">{page.intro}</p>
          </div>
        </header>
        <div className="rm-stack">
          {page.blocks.map((b) => (
            <SettingsEditor key={b.key} block={b} />
          ))}
        </div>
      </>
    );
  }

  notFound();
}
