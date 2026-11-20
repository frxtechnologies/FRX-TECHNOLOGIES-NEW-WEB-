import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/design-system/tokens.css";
import "@/design-system/themes.css";
import "@/design-system/type.css";
import "@/design-system/motion/fx.css";
import { fxFontClasses } from "@/design-system/fonts";

import { SITE, SOCIAL } from "@/lib/site";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSettings } from "@/lib/content/server";
import { buildThemeScript, parseThemeConfig, subAccentCss } from "@/lib/theme-config";
import { IntroProvider } from "@/components/providers/intro-provider";
import { JsonLd } from "@/components/shared/json-ld";

/**
 * Display: Bricolage Grotesque. Body and all functional UI: Inter Tight. Both are
 * self-hosted variable fonts (src/design-system/fonts) — no third-party font
 * requests at build or runtime.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s | FRX Technologies",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  keywords: [
    "AI automation",
    "custom software development",
    "web application development",
    "SaaS development",
    "business process automation",
    "UI UX design",
    "FRX Technologies",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    locale: "en",
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/brand/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#05070e" },
  ],
  colorScheme: "light dark",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/brand/frx-logo-light-mode.png`,
  description: SITE.description,
  sameAs: [SOCIAL.instagram, SOCIAL.linkedin],
  founder: [
    { "@type": "Person", name: "Feroze Mohiuddin", jobTitle: "Founder" },
    { "@type": "Person", name: "Raaef Usman", jobTitle: "Co-Founder" },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = parseThemeConfig((await getSettings()).theme);
  const subCss = subAccentCss(theme.subAccent);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored or system theme before first paint. Without this
            a dark-mode visitor sees a white flash on every cold load. */}
        <script dangerouslySetInnerHTML={{ __html: buildThemeScript(theme) }} />
        {subCss ? <style dangerouslySetInnerHTML={{ __html: subCss }} /> : null}
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body className={fxFontClasses}>
        <ThemeProvider config={theme}>
          <IntroProvider>{children}</IntroProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
