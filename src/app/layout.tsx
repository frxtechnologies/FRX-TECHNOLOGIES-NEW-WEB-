import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { SITE, SOCIAL } from "@/lib/site";
import { ThemeProvider, themeScript } from "@/components/providers/theme-provider";
import { IntroProvider } from "@/components/providers/intro-provider";
import { JsonLd } from "@/components/shared/json-ld";

/**
 * Manrope: a modern grotesk with genuinely usable tight tracking at display
 * sizes, which is what this design leans on. JetBrains Mono carries the
 * technical register — indices, eyebrows, counters.
 */
const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored or system theme before first paint. Without this
            a dark-mode visitor sees a white flash on every cold load. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body className={`${sans.variable} ${mono.variable}`}>
        <ThemeProvider>
          <IntroProvider>{children}</IntroProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
