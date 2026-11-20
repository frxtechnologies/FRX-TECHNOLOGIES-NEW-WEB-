import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src", "design-system");

export const readDs = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

/**
 * The palette on the page is parsed out of tokens.css itself, so the review
 * page can never show a colour the CSS doesn't actually define.
 */
export function readTokens() {
  const css = readDs("tokens.css");
  const darkStart = css.indexOf('.fx-root[data-fx-theme="dark"]');
  const light = css.slice(0, darkStart);
  const dark = css.slice(darkStart);

  const parse = (block: string) => {
    const out: Record<string, string> = {};
    for (const m of block.matchAll(/(--fx-[a-z0-9-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
    return out;
  };

  const lightTokens = parse(light);
  // Dark overrides sit on top of everything it doesn't redefine.
  const darkTokens = { ...lightTokens, ...parse(dark) };
  return { css, light: lightTokens, dark: darkTokens };
}

/* ---- WCAG 2.x contrast ---------------------------------------------------- */
function lum(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return null;
  const x = lum(a);
  const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
