/**
 * Builds a real multi-size favicon.ico from the generated PNG icons.
 *
 * Browsers still request /favicon.ico directly, and a single-size file looks
 * soft in the places that ask for 16 or 48. sharp can't write ICO, so the
 * container is assembled by hand: header, one directory entry per image, then
 * the PNG payloads (ICO has permitted embedded PNGs since Vista).
 */
import sharp from "sharp";
import fs from "node:fs/promises";

const SIZES = [16, 32, 48];

const buffers = await Promise.all(
  SIZES.map((s) => sharp(`public/icons/icon-${s}.png`).png().toBuffer()),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(buffers.length, 4);

let offset = 6 + buffers.length * 16;
const entries = buffers.map((buf, i) => {
  const size = SIZES[i];
  const e = Buffer.alloc(16);
  e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
  e.writeUInt8(size >= 256 ? 0 : size, 1); // height
  e.writeUInt8(0, 2); // palette count
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});

await fs.writeFile("src/app/favicon.ico", Buffer.concat([header, ...entries, ...buffers]));
console.log(`favicon.ico written (${SIZES.join(", ")})`);
