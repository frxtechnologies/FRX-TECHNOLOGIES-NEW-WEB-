/**
 * Removes the white halo from background-removed portraits.
 *
 * Tools like remove.bg composite the subject over white before cutting it out,
 * so every semi-transparent edge pixel carries white mixed into its colour.
 * On a light page nobody notices. On this site's black founders section it
 * reads as a bright outline traced around the person.
 *
 * The fix is to reverse that composite. For a pixel observed as
 *   observed = colour * alpha + 255 * (1 - alpha)
 * the original colour is
 *   colour = (observed - 255 * (1 - alpha)) / alpha
 *
 * Fully opaque pixels are untouched, so the subject itself is unchanged — only
 * the partially transparent rim is corrected.
 *
 * Usage: node scripts/defringe-portrait.mjs <in> <out>
 */
import sharp from "sharp";

const [, , SRC, DEST] = process.argv;
if (!SRC || !DEST) {
  console.error("usage: defringe-portrait.mjs <in.png> <out.png>");
  process.exit(1);
}

const img = sharp(SRC).ensureAlpha();
const { width, height } = await img.metadata();
const { data } = await img.raw().toBuffer({ resolveWithObject: true });

let touched = 0;

for (let i = 0; i < data.length; i += 4) {
  const a = data[i + 3];
  if (a === 0 || a === 255) continue;

  const alpha = a / 255;
  let changed = false;

  for (let c = 0; c < 3; c++) {
    const observed = data[i + c];
    const recovered = (observed - 255 * (1 - alpha)) / alpha;
    const clamped = Math.max(0, Math.min(255, Math.round(recovered)));
    if (clamped !== observed) changed = true;
    data[i + c] = clamped;
  }

  if (changed) touched++;
}

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(DEST);

console.log(`de-fringed ${touched} edge pixels → ${DEST}`);
