/**
 * Theme configuration shared by the server (root layout, admin) and the client
 * (switcher). One architecture: a palette + a mode, expressed as two attributes
 * on <html> (`data-palette`, `data-theme`) that select blocks of CSS custom
 * properties in src/design-system/themes.css. No per-theme stylesheets, no
 * per-theme components.
 */

export const PALETTES = [
  {
    id: "frx",
    name: "Original FRX",
    blurb: "Blue, paper and ink",
    // [primary, secondary accent, ground] for light / dark — used by previews and the switcher.
    swatch: { light: ["#045cec", "#ffe98f", "#f4f2ed"], dark: ["#045cec", "#ffe98f", "#08090c"] },
  },
  {
    id: "orange",
    name: "Blue × Orange",
    blurb: "Energetic, warm accent",
    swatch: { light: ["#045cec", "#ff6a13", "#f7f3ee"], dark: ["#045cec", "#ff7a2e", "#0a0d14"] },
  },
  {
    id: "gold",
    name: "Blue × Golden",
    blurb: "Editorial and confident",
    swatch: { light: ["#045cec", "#e0a100", "#faf6ec"], dark: ["#045cec", "#f2b705", "#0d0c09"] },
  },
  {
    id: "neon",
    name: "Neon Digital",
    blurb: "Futuristic, technical",
    swatch: { light: ["#045cec", "#2eea7a", "#f1f4f2"], dark: ["#045cec", "#39ff88", "#0b0e0d"] },
  },
] as const;

export const MODE_KEY = "frx-theme";
export const PALETTE_KEY = "frx-palette";

export type Palette = (typeof PALETTES)[number]["id"];
export type Mode = "light" | "dark";

export const PALETTE_IDS = PALETTES.map((p) => p.id) as Palette[];

export type ThemeConfig = {
  palette: Palette;
  mode: Mode;
  /** May visitors change palette/mode? When false the admin default is final. */
  allow: boolean;
  enabled: Palette[];
  /** Validated #rrggbb override for the secondary accent, or "". */
  subAccent: string;
};

/** The string-valued shape stored in site_settings.theme (and edited in the admin). */
export type ThemeSettings = {
  defaultPalette: string;
  defaultMode: string;
  allowVisitorSwitch: string;
  enabledPalettes: string;
  subAccent: string;
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  defaultPalette: "frx",
  defaultMode: "light",
  allowVisitorSwitch: "true",
  enabledPalettes: "frx,orange,gold,neon",
  subAccent: "",
};

export function parseThemeConfig(s: ThemeSettings): ThemeConfig {
  const enabled = s.enabledPalettes
    .split(",")
    .map((x) => x.trim())
    .filter((x): x is Palette => (PALETTE_IDS as string[]).includes(x));
  const list = enabled.length ? enabled : (["frx"] as Palette[]);
  const wanted = s.defaultPalette as Palette;
  return {
    palette: list.includes(wanted) ? wanted : list[0],
    mode: s.defaultMode === "dark" ? "dark" : "light",
    allow: s.allowVisitorSwitch !== "false",
    enabled: list,
    subAccent: sanitizeSubAccent(s.subAccent).ok ? s.subAccent.toLowerCase() : "",
  };
}

/* ---- colour maths (WCAG relative luminance) ---------------------------------- */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
export const luminance = (h: string) => {
  const [r, g, b] = hex(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

function toHsl(h: string): [number, number, number] {
  const [r, g, b] = hex(h).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(hue * 60 + 360) % 360, s, l];
}
function fromHsl(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return "#" + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
}

/**
 * The admin may pick a secondary accent, but only a real accent: saturated
 * enough to read as a colour, and neither near-white nor near-black. Anything
 * else is rejected so a setting can never wash out or blacken the interface.
 */
export function sanitizeSubAccent(value: string): { ok: boolean; reason?: string } {
  if (!value) return { ok: true };
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return { ok: false, reason: "Use a six-digit hex colour such as #ff6a13." };
  const [, s, l] = toHsl(value);
  if (s < 0.35) return { ok: false, reason: "Too grey — choose a more saturated colour." };
  if (l < 0.4) return { ok: false, reason: "Too dark — choose a lighter colour." };
  if (l > 0.85) return { ok: false, reason: "Too pale — choose a stronger colour." };
  return { ok: true };
}

/** Nudge a colour's lightness until it reads as TEXT (≥ 4.5:1) on the given ground. */
function readableOn(color: string, ground: string, darker: boolean): string {
  let [h, s, l] = toHsl(color);
  for (let i = 0; i < 40 && contrast(fromHsl(h, s, l), ground) < 4.5; i++) l += darker ? -0.02 : 0.02;
  return fromHsl(h, s, Math.min(0.95, Math.max(0.1, l)));
}

/** CSS that applies the admin's secondary accent over whichever palette is active. */
export function subAccentCss(accent: string): string {
  if (!accent || !sanitizeSubAccent(accent).ok) return "";
  const a = accent.toLowerCase();
  const ink = contrast(a, "#0a0a0c") >= contrast(a, "#ffffff") ? "#0a0a0c" : "#ffffff";
  const textLight = readableOn(a, "#f4f2ed", true);
  const textDark = readableOn(a, "#0a0b0e", false);
  const base = `--fx-sub:${a};--fx-hot:${a};--fx-sub-ink:${ink};--fx-sub-soft:color-mix(in srgb,${a} 18%,transparent)`;
  return (
    `html:root[data-palette][data-theme] .fx-root,html:root[data-palette][data-theme]{${base}}` +
    `html:root[data-palette][data-theme="light"] .fx-root,html:root[data-palette][data-theme="light"]{--fx-sub-text:${textLight}}` +
    `html:root[data-palette][data-theme="dark"] .fx-root,html:root[data-palette][data-theme="dark"]{--fx-sub-text:${textDark}}`
  );
}

/**
 * Runs before first paint and stamps `data-theme` (light|dark) and
 * `data-palette` on <html>, so the right colours are in place when the document
 * renders — no flash, no hydration mismatch (React never renders the attributes).
 *
 * Resolution, per attribute:
 *   1. a visitor's saved choice — but only if the admin allows visitor switching
 *      and (for palettes) that palette is still enabled
 *   2. otherwise the admin's default (Admin → Theme)
 * The visitor's OS preference is deliberately not consulted: the brand opens in
 * its configured default, light unless changed.
 *
 * The same pass sets `data-intro-light`, which hides page content until the
 * loader has mounted and covered the viewport. Only routes that mount the
 * loader may sit behind it, so /admin and the 404 page are excluded.
 * It also marks the document JS-capable (`js-motion`), which gates the masked
 * headline start states.
 */
export function buildThemeScript(cfg: ThemeConfig) {
  const C = JSON.stringify({ p: cfg.palette, m: cfg.mode, a: cfg.allow, e: cfg.enabled });
  return `(function(){var d=document.documentElement,C=${C};try{
var m=null,p=null;
if(C.a){try{m=localStorage.getItem("${MODE_KEY}");p=localStorage.getItem("${PALETTE_KEY}");}catch(e){}}
if(m!=="dark"&&m!=="light")m=C.m;
if(!p||C.e.indexOf(p)<0)p=C.p;
if(/^\\/($|about|services|contact|work)/.test(location.pathname))d.setAttribute("data-intro-light","1");
d.setAttribute("data-theme",m);d.setAttribute("data-palette",p);d.style.colorScheme=m;
}catch(e){d.setAttribute("data-theme","light");d.setAttribute("data-palette","frx");}
d.classList.add("js-motion");})();`;
}

