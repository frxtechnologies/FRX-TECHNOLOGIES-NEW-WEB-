import { JsonLd } from "./json-ld";
import { SITE } from "@/lib/site";

/**
 * WebPage + BreadcrumbList structured data for a page, built only from facts the
 * site already states (its name, URL, the page's own title/description). Nothing
 * here claims awards, ratings, addresses or affiliations.
 */
export function PageJsonLd({
  path,
  name,
  description,
  trail = [],
}: {
  path: string;
  name: string;
  description: string;
  /** Intermediate crumbs between Home and this page. */
  trail?: { name: string; path: string }[];
}) {
  const url = `${SITE.url}${path}`;
  const crumbs = [{ name: "Home", path: "" }, ...trail, ...(path ? [{ name, path }] : [])];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: path ? `${name} | ${SITE.name}` : SITE.title,
          description,
          isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
          inLanguage: "en",
        }}
      />
      {crumbs.length > 1 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.name,
              item: `${SITE.url}${c.path}`,
            })),
          }}
        />
      )}
    </>
  );
}
