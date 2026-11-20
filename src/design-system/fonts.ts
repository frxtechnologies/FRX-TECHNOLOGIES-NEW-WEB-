import localFont from "next/font/local";

/**
 * FRX typefaces — local files, both SIL Open Font License 1.1 (full licence
 * text sits next to the files: fonts/OFL-*.txt).
 *
 *   Display  Bricolage Grotesque   Mathieu Triay / Atelier Triay
 *            github.com/ateliertriay/bricolage
 *            axes: wght 200–800 · wdth 75–100 · opsz 12–96
 *   Body     Inter Tight           Rasmus Andersson
 *            github.com/rsms/inter-gf-tight
 *            axes: wght 100–900
 *
 * The woff2 files are the official Latin subsets as published by Google Fonts
 * (unmodified — the OFL Reserved-Font-Name clause applies to modified copies).
 * Latin only is deliberate for an English site; glyphs outside it (e.g. "→")
 * fall back to the system font.
 *
 * Because they are self-hosted through next/font/local, builds never depend on
 * a network fetch to Google, and there are no third-party font requests at
 * runtime.
 */
export const bricolage = localFont({
  src: [
    {
      path: "./fonts/BricolageGrotesque-Variable-latin.woff2",
      weight: "200 800",
      style: "normal",
    },
  ],
  variable: "--fx-face-display",
  display: "swap",
  // Registers the width axis so `font-stretch: 75%` maps to wdth 75.
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
  adjustFontFallback: "Arial",
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

export const interTight = localFont({
  src: [
    {
      path: "./fonts/InterTight-Variable-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--fx-face-body",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

/** Put on the element that carries `.fx-root`. */
export const fxFontClasses = `${bricolage.variable} ${interTight.variable}`;
