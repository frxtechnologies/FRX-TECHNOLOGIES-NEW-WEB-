export type ConceptKey = "a" | "b" | "c";

export type Concept = {
  key: ConceptKey;
  label: string;
  displayName: string;
  bodyName: string;
  /** CSS custom properties applied to the specimen root. */
  vars: Record<string, string>;
  /** Weights shown in the "big words" and range rows. */
  weights: number[];
  /** Rows for the concept's axis explorer. */
  explorer: { caption: string; wght: number; wdth?: number; opsz?: number; ls?: string }[];
  explorerTitle: string;
};

/**
 * Every concept receives identical content; only these values change.
 * `--d-wdth` / `--d-opsz` drive font-variation-settings — axes a font does not
 * have (Anton has none) are ignored by the browser.
 */
export const CONCEPTS: Record<ConceptKey, Concept> = {
  a: {
    key: "a",
    label: "A",
    displayName: "Bricolage Grotesque",
    bodyName: "Inter Tight",
    vars: {
      "--d-font": "var(--tl-bricolage), system-ui, sans-serif",
      "--b-font": "var(--tl-inter-tight), system-ui, sans-serif",
      "--d-wght": "800",
      "--d-wdth": "75",
      "--d-opsz": "96",
      "--d-ls": "-0.004em",
      "--d-lh": "0.86",
      "--hero-size": "clamp(3.4rem, min(23.5vw, 27.5svh), 18rem)",
    },
    weights: [300, 500, 800],
    explorerTitle: "Width and optical-size axes (weight 800)",
    explorer: [
      { caption: "wdth 75 · opsz 96", wght: 800, wdth: 75, opsz: 96 },
      { caption: "wdth 88 · opsz 96", wght: 800, wdth: 88, opsz: 96 },
      { caption: "wdth 100 · opsz 96", wght: 800, wdth: 100, opsz: 96 },
      { caption: "wdth 75 · opsz 12", wght: 800, wdth: 75, opsz: 12 },
    ],
  },
  b: {
    key: "b",
    label: "B",
    displayName: "Archivo",
    bodyName: "Hanken Grotesk",
    vars: {
      "--d-font": "var(--tl-archivo), system-ui, sans-serif",
      "--b-font": "var(--tl-hanken), system-ui, sans-serif",
      "--d-wght": "900",
      "--d-wdth": "62",
      "--d-opsz": "0",
      "--d-ls": "-0.008em",
      "--d-lh": "0.84",
      "--hero-size": "clamp(3.4rem, min(19.3vw, 23.3svh), 18rem)",
      "--d-ws": "0.09em",
    },
    weights: [300, 600, 900],
    explorerTitle: "Width axis (weight 900), then weight (width 62)",
    explorer: [
      { caption: "wdth 62 · wght 900", wght: 900, wdth: 62 },
      { caption: "wdth 75 · wght 900", wght: 900, wdth: 75 },
      { caption: "wdth 100 · wght 900", wght: 900, wdth: 100 },
      { caption: "wdth 125 · wght 900", wght: 900, wdth: 125 },
      { caption: "wdth 62 · wght 500", wght: 500, wdth: 62 },
    ],
  },
  c: {
    key: "c",
    label: "C",
    displayName: "Anton",
    bodyName: "Inter Tight",
    vars: {
      "--d-font": "var(--tl-anton), Impact, sans-serif",
      "--b-font": "var(--tl-inter-tight), system-ui, sans-serif",
      "--d-wght": "400",
      "--d-wdth": "100",
      "--d-opsz": "0",
      "--d-ls": "0.004em",
      "--d-lh": "0.97",
      "--hero-size": "clamp(3.4rem, min(20vw, 24.5svh), 18rem)",
    },
    weights: [400],
    explorerTitle: "Single weight — tracking and case instead of axes",
    explorer: [
      { caption: "tracking -0.02em", wght: 400, ls: "-0.02em" },
      { caption: "tracking 0", wght: 400, ls: "0em" },
      { caption: "tracking +0.03em", wght: 400, ls: "0.03em" },
      { caption: "tracking +0.08em", wght: 400, ls: "0.08em" },
    ],
  },
};

/** Verified from google/fonts METADATA.pb and OFL.txt. */
export const CREDITS = [
  {
    name: "Bricolage Grotesque",
    designer: "Mathieu Triay (Atelier Triay)",
    axes: "wght 200–800, wdth 75–100, opsz 12–96",
    source: "https://github.com/ateliertriay/bricolage",
  },
  {
    name: "Archivo",
    designer: "Omnibus-Type",
    axes: "wght 100–900, wdth 62–125",
    source: "https://github.com/Omnibus-Type/Archivo",
  },
  {
    name: "Anton",
    designer: "Vernon Adams",
    axes: "single weight (400)",
    source: "https://github.com/googlefonts/AntonFont",
  },
  {
    name: "Inter Tight",
    designer: "Rasmus Andersson",
    axes: "wght 100–900",
    source: "https://github.com/rsms/inter-gf-tight",
  },
  {
    name: "Hanken Grotesk",
    designer: "Alfredo Marco Pradil, Hanken Design Co.",
    axes: "wght 100–900",
    source: "https://github.com/marcologous/hanken-grotesk",
  },
] as const;
