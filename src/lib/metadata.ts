import type { Metadata } from "next";
import { SITE } from "@/lib/site";

/**
 * Every top-level page was setting `title`/`description`/`alternates.canonical`
 * but leaving `openGraph` and `twitter` unset, which meant every link preview
 * for /services, /about and /contact showed the homepage's generic card
 * instead of that page's own title and description — a real, silent SEO/social
 * gap, not a cosmetic one. This is the one place that's decided now, so it
 * can't drift back out of sync per-page again.
 */
export const OG_IMAGE = {
  url: "/brand/og.jpg",
  width: 1200,
  height: 630,
  alt: "FRX Technologies — Build. Automate. Scale.",
} as const;

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${SITE.url}${path}`;
  const fullTitle = `${title} | ${SITE.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en",
      title: fullTitle,
      description,
      url,
      // A page-level openGraph REPLACES the layout's (Next does not deep-merge), so the
      // share image must be repeated here or every inner page would lose it.
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
