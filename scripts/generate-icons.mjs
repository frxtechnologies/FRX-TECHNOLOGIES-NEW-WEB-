#!/usr/bin/env node
/**
 * Generates the browser-tab / app icons from the FULL FRX logo (public/brand).
 *
 *   node scripts/generate-icons.mjs
 *
 * - >= 180px icons carry the complete lockup (FRX + the blue X + TECHNOLOGIES).
 * - The tab / search-result sizes (16/32/48/96) carry the FRX X mark from the logo
 *   (public/brand/frx-x.png). A wide wordmark squeezed into 16px is only ~8px tall and
 *   reads as a smudge; the bold X is the one part of the logo that stays recognisable
 *   that small, which is what browser tabs and Google's favicon listing show.
 * - All sit on a white rounded square, so the navy letters stay legible in both
 *   light and dark browser chrome.
 * src/app/favicon.ico is a PNG-in-ICO (16/32/48) — supported by every current browser.
 */
import fs from "node:fs";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../public/brand/frx-logo-light-mode.png", import.meta.url));
const XMARK = fileURLToPath(new URL("../public/brand/frx-x.png", import.meta.url));
const OUT = new URL("../public/icons/", import.meta.url);
const LOGO_W = 1101;
const LOGO_H = 477;
const WORDMARK_H = 392; // everything above the TECHNOLOGIES strap

async function icon(size, { full }) {
  const pad = Math.round(size * (full ? 0.1 : 0.14));
  const inner = size - pad * 2;
  const logo = full
    ? await sharp(SRC)
        .extract({ left: 0, top: 0, width: LOGO_W, height: LOGO_H })
        .resize({ width: inner, height: inner, fit: "inside" })
        .toBuffer()
    : await sharp(XMARK).resize({ width: inner, height: inner, fit: "inside" }).toBuffer();
  const radius = Math.round(size * 0.22);
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/></svg>`,
  );
  return sharp(bg).composite([{ input: logo, gravity: "center" }]).png({ compressionLevel: 9 }).toBuffer();
}

const sizes = [
  [16, false],
  [32, false],
  [48, false],
  [96, false],
  [180, true],
  [192, true],
  [512, true],
];
const bufs = {};
for (const [s, full] of sizes) {
  bufs[s] = await icon(s, { full });
  fs.writeFileSync(new URL(`icon-${s}.png`, OUT), bufs[s]);
  console.log("icon", s, full ? "(full lockup)" : "(X mark)", bufs[s].length, "bytes");
}

// PNG-in-ICO
const entries = [16, 32, 48].map((s) => ({ s, data: bufs[s] }));
const head = Buffer.alloc(6);
head.writeUInt16LE(0, 0);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(entries.length, 4);
let offset = 6 + entries.length * 16;
const dir = entries.map((e) => {
  const b = Buffer.alloc(16);
  b.writeUInt8(e.s, 0);
  b.writeUInt8(e.s, 1);
  b.writeUInt8(0, 2);
  b.writeUInt8(0, 3);
  b.writeUInt16LE(1, 4);
  b.writeUInt16LE(32, 6);
  b.writeUInt32LE(e.data.length, 8);
  b.writeUInt32LE(offset, 12);
  offset += e.data.length;
  return b;
});
fs.writeFileSync(new URL("../src/app/favicon.ico", import.meta.url), Buffer.concat([head, ...dir, ...entries.map((e) => e.data)]));
console.log("favicon.ico written");
