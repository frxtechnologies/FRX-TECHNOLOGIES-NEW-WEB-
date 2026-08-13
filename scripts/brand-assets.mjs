/**
 * Derives every FRX brand asset from the single official logo PNG.
 * - samples the exact blue used in the X
 * - emits the light-mode (navy) and dark-mode (white) lockups
 * - emits the square FRX mark used for favicons / touch icons
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE = process.argv[2];
const OUT = path.resolve("public/brand");
const ICONS = path.resolve("public/icons");

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(ICONS, { recursive: true });

const img = sharp(SOURCE).ensureAlpha();
const { width, height } = await img.metadata();
const { data } = await img.raw().toBuffer({ resolveWithObject: true });

// ---- 1. sample the vivid blue -------------------------------------------------
// Walk every opaque pixel, keep the one with the highest blue-dominance and
// saturation. That is the electric blue in the leading edge of the X.
let best = null;
let bestScore = -1;
const histogram = new Map();

for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 250) continue;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) continue;
  const sat = (max - min) / max;
  if (b !== max) continue;
  const score = sat * (b / 255) * (1 - Math.abs(0.55 - g / 255));
  if (score > bestScore) {
    bestScore = score;
    best = [r, g, b];
  }
  if (sat > 0.55 && b > 140) {
    const key = `${r >> 3},${g >> 3},${b >> 3}`;
    histogram.set(key, (histogram.get(key) ?? 0) + 1);
  }
}

// The most *frequent* saturated blue is the true brand blue; the brightest one
// is often a single anti-aliased highlight pixel.
const [dominantKey] = [...histogram.entries()].sort((a, b) => b[1] - a[1])[0];
const dominant = dominantKey.split(",").map((n) => (Number(n) << 3) + 4);

const hex = (c) => "#" + c.map((n) => n.toString(16).padStart(2, "0")).join("");

console.log("brightest blue :", hex(best));
console.log("dominant blue  :", hex(dominant));

// ---- 2. dark-mode lockup ------------------------------------------------------
// Recolour only the near-black "FRX TECHNOLOGIES" letterforms to white. The blue
// X and the blue rules are left exactly as designed.
const darkMode = Buffer.from(data);
for (let i = 0; i < darkMode.length; i += 4) {
  const [r, g, b, a] = [darkMode[i], darkMode[i + 1], darkMode[i + 2], darkMode[i + 3]];
  if (a === 0) continue;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  // navy letterforms: dark and not vividly blue
  if (max < 150 && !(sat > 0.5 && b === max && b > 120)) {
    // invert luminance so the subtle gradient inside the letterforms survives
    const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const v = Math.round(255 - lum * 70);
    darkMode[i] = v;
    darkMode[i + 1] = v;
    darkMode[i + 2] = v;
  }
}

await sharp(darkMode, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT, "frx-logo-dark-mode.png"));

await sharp(SOURCE).png({ compressionLevel: 9 }).toFile(path.join(OUT, "frx-logo-light-mode.png"));

// ---- 3. the square mark -------------------------------------------------------
// The full lockup is ~3.4:1, so squeezing it into 16px makes it unreadable mush.
// The favicon instead uses the X — the single most recognisable element of the
// official artwork — cropped from the real asset rather than redrawn.
//
// Find the bounding box of the "FRX" row (everything above the TECHNOLOGIES rule).
let top = height;
let bottom = 0;
let left = width;
let right = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 40) {
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
}
const fullH = bottom - top;
// the wordmark occupies roughly the top 72% of the lockup
const markH = Math.round(fullH * 0.72);
const markW = right - left;

const mark = await sharp(darkMode, { raw: { width, height, channels: 4 } })
  .extract({ left, top, width: markW, height: markH })
  .png()
  .toBuffer();

// Isolate the X by measuring the real bounding box of its vivid blue mass. The
// two thin rules flanking "TECHNOLOGIES" are also brand blue, so rows below the
// wordmark are excluded before the box is taken.
const wordmarkFloor = top + markH;
let bx0 = width;
let by0 = height;
let bx1 = 0;
let by1 = 0;
for (let y = top; y < wordmarkFloor; y++) {
  for (let x = left; x <= right; x++) {
    const i = (y * width + x) * 4;
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 200) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (b === max && b > 110 && (max - min) / max > 0.4) {
      if (x < bx0) bx0 = x;
      if (x > bx1) bx1 = x;
      if (y < by0) by0 = y;
      if (y > by1) by1 = y;
    }
  }
}
// The X's lower-left tip tucks under the R, so the raw blue box drags a sliver of
// the R's bowl into frame. Trimming the leftmost tenth drops the sliver; the tip
// it costs is a few pixels of a tapering point that no icon size can resolve.
bx0 += Math.round((bx1 - bx0) * 0.11);

// Crop the glyph's exact rectangle. The icon step letterboxes it into a square,
// which is what keeps every arm intact at every size.
const gw = Math.min(width - bx0, bx1 - bx0 + 1);
const gh = Math.min(height - by0, by1 - by0 + 1);
console.log("x glyph box   :", { bx0, by0, gw, gh });

const glyph = await sharp(SOURCE)
  .ensureAlpha()
  .extract({ left: bx0, top: by0, width: gw, height: gh })
  .png()
  .toBuffer();

await sharp(glyph).png().toFile(path.join(OUT, "frx-x.png"));

const SIZES = [16, 32, 48, 96, 180, 192, 512];
for (const size of SIZES) {
  const pad = Math.round(size * 0.16);
  const inner = await sharp(glyph)
    .resize({
      width: size - pad * 2,
      height: size - pad * 2,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 5, g: 8, b: 16, alpha: 1 },
    },
  })
    .composite([{ input: inner, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ICONS, `icon-${size}.png`));
}

// transparent mark for in-page use
await sharp(mark).png().toFile(path.join(OUT, "frx-mark-dark-mode.png"));
await sharp(SOURCE)
  .extract({ left, top, width: markW, height: markH })
  .png()
  .toFile(path.join(OUT, "frx-mark-light-mode.png"));

await fs.writeFile(
  path.resolve("brand-tokens.json"),
  JSON.stringify({ brightest: hex(best), dominant: hex(dominant) }, null, 2),
);

console.log("done. lockup:", width, "x", height, "mark:", markW, "x", markH);
