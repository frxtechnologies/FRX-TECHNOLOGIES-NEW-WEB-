/**
 * Extracts the usable artwork from the supplied FRX banner.
 *
 * The banner's left two-thirds are a logo lockup, a headline and a row of
 * service icons — all of which restate content the site already carries, in a
 * different typeface. Dropping that whole image onto a page would put two
 * competing typographic systems on screen at once.
 *
 * Its right-hand panel, though, is pure brand artwork: the blue diagonal and
 * the dark particle wave, no type at all. That crop is genuinely reusable, so
 * that is what gets extracted — in two aspect ratios, for the feature band and
 * for the vertical reel poster.
 */
import sharp from "sharp";
import fs from "node:fs/promises";

const SRC = "_incoming/frx-banner.png";
const OUT = "public/images";

await fs.mkdir(OUT, { recursive: true });

const { width, height } = await sharp(SRC).metadata();

// The blue diagonal sits around 62% across and the dark field runs to the right
// edge. Starting at 76% clears the diagonal entirely — the white wedge on its
// left belongs to the banner's layout, not to the artwork, and would read as a
// blown-out corner on a dark section.
const left = Math.round(width * 0.81);
const panelW = width - left;

// Wide crop for the feature band.
await sharp(SRC)
  .extract({ left, top: 0, width: panelW, height })
  .resize(1600, 1000, { fit: "cover", position: "right bottom" })
  .webp({ quality: 82 })
  .toFile(`${OUT}/frx-signal-wide.webp`);

// Tall crop for the reel poster. Same clear-of-the-diagonal rule, and the
// source region is already close to 9:16 so the resize barely has to crop.
await sharp(SRC)
  .extract({
    left: Math.round(width * 0.79),
    top: 0,
    width: Math.round(width * 0.21),
    height,
  })
  .resize(720, 1280, { fit: "cover", position: "center" })
  .webp({ quality: 82 })
  .toFile(`${OUT}/frx-signal-tall.webp`);

console.log("feature art written from", `${panelW}x${height}`, "panel");
