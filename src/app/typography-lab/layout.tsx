import type { Metadata } from "next";
import {
  Anton,
  Archivo,
  Bricolage_Grotesque,
  Hanken_Grotesk,
  Inter_Tight,
} from "next/font/google";
import "./lab.css";
import { ClearIntroFlag } from "./clear-intro-flag";

/**
 * TEMPORARY typography lab. Delete this whole folder (src/app/typography-lab)
 * once a direction is chosen — nothing outside it depends on it.
 *
 * Fonts are declared here, not in the root layout, so they are only requested
 * on this route. next/font downloads the real font files from Google Fonts at
 * build/dev time and serves them from this site's own origin. All five are
 * SIL OFL 1.1 (see the credits block on the page).
 *
 * Variable axes are requested explicitly:
 *   Bricolage Grotesque  wght 200–800, wdth 75–100, opsz 12–96
 *   Archivo              wght 100–900, wdth 62–125
 *   Inter Tight / Hanken Grotesk   wght 100–900
 *   Anton                single weight (400)
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--tl-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--tl-archivo",
  axes: ["wdth"],
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--tl-anton",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--tl-inter-tight",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--tl-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Typography lab (temporary)",
  robots: { index: false, follow: false },
};

export default function TypographyLabLayout({ children }: { children: React.ReactNode }) {
  const fonts = [bricolage, archivo, anton, interTight, hanken]
    .map((f) => f.variable)
    .join(" ");

  return (
    <div className={`tl-root ${fonts}`}>
      <ClearIntroFlag />
      {children}
    </div>
  );
}
