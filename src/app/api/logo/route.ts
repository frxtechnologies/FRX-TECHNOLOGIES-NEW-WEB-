import { NextResponse } from "next/server";
import sharp from "sharp";

/**
 * Logo cleaner: GET /api/logo?p=technologies/<file>.jpg
 *
 * Technology and affiliation logos are usually uploaded as JPEG/PNG screenshots with a flat
 * white (or dark) background. This route fetches the ORIGINAL from public storage, removes a
 * uniform background by flood-filling inwards from the image edge, trims the empty margin and
 * returns a transparent PNG. Nothing is ever written back: the stored original and the database
 * row are untouched, and every future upload gets the same treatment automatically.
 *
 * Safe by construction:
 *  - only paths like `technologies/<name>.<ext>` / `affiliations/<name>.<ext>` in OUR bucket are fetched;
 *  - the background must be genuinely uniform (≥ 60% of the border one colour). Photos and busy
 *    images are returned untouched;
 *  - the cut is rejected (original returned) if it would remove almost everything, or leave only a
 *    near-white shape (e.g. a white mark that only existed against its coloured background);
 *  - already-transparent images are only trimmed, never recoloured.
 * Responses are immutable-cached: the object path contains a unique id per upload.
 */

export const maxDuration = 20;

const PATH = /^(technologies|affiliations)\/[A-Za-z0-9._-]{1,120}\.(png|jpe?g|webp|gif)$/i;
const MAX_BYTES = 6 * 1024 * 1024;
const WORK = 400; // working size: logos are shown at ~60px tall, 3x retina is plenty
const OUT = 224;

type Px = { data: Buffer; w: number; h: number };

const luma = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** Colour distance (0..441) between a pixel and a colour. */
const colourDist = (d: Buffer, i: number, c: number[]) => {
  const dr = d[i] - c[0], dg = d[i + 1] - c[1], db = d[i + 2] - c[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const TOL = 42; // JPEG noise, faint shadows and soft gradients

/** Flood fill (4-connected) from the seed pixels over everything within TOL of `bg`. */
function flood({ data, w, h }: Px, bg: number[], seeds: number[]): Uint8Array {
  const gone = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (k: number) => {
    if (!gone[k] && colourDist(data, k * 4, bg) <= TOL) {
      gone[k] = 1;
      stack.push(k);
    }
  };
  for (const k of seeds) push(k);
  while (stack.length) {
    const k = stack.pop()!;
    const x = k % w, y = (k / w) | 0;
    if (x > 0) push(k - 1);
    if (x < w - 1) push(k + 1);
    if (y > 0) push(k - w);
    if (y < h - 1) push(k + w);
  }
  return gone;
}

/**
 * Turns the flooded region transparent and mattes a 2px fringe: each edge pixel is a blend of the
 * background and the nearest solid logo colour, so its true colour is that logo colour and its
 * opacity is how far along the bg→logo line it sits. That removes both white and dark halos.
 * Returns null when the result would be wrong (see the guards).
 */
function finishCut({ data, w, h }: Px, gone: Uint8Array, bg: number[]): Buffer | null {
  const total = w * h;
  const near = new Uint8Array(total); // kept pixels within 2px of the cut
  for (let k = 0; k < total; k++) {
    if (!gone[k]) continue;
    const x = k % w, y = (k / w) | 0;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && !gone[ny * w + nx]) near[ny * w + nx] = 1;
      }
  }

  const out = Buffer.from(data);
  let kept = 0;
  let lumSum = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x, i = k * 4;
      if (gone[k]) {
        out[i + 3] = 0;
        continue;
      }
      if (near[k]) {
        // the most "logo-like" solid pixel within 3px
        let best = -1, bestD = -1;
        for (let dy = -3; dy <= 3; dy++)
          for (let dx = -3; dx <= 3; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const nk = ny * w + nx;
            if (gone[nk] || near[nk]) continue;
            const d = colourDist(data, nk * 4, bg);
            if (d > bestD) (bestD = d, best = nk * 4);
          }
        if (best >= 0 && bestD > TOL) {
          const u = [data[best] - bg[0], data[best + 1] - bg[1], data[best + 2] - bg[2]];
          const v = [data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]];
          const t = Math.max(0, Math.min(1, (v[0] * u[0] + v[1] * u[1] + v[2] * u[2]) / (u[0] * u[0] + u[1] * u[1] + u[2] * u[2])));
          if (t < 0.04) {
            out[i + 3] = 0;
            continue;
          }
          if (t < 0.97) {
            out[i] = data[best];
            out[i + 1] = data[best + 1];
            out[i + 2] = data[best + 2];
            out[i + 3] = Math.round(t * 255);
          }
        }
      }
      if (out[i + 3] > 200) {
        kept++;
        lumSum += luma(out[i], out[i + 1], out[i + 2]);
      }
    }
  }

  if (1 - kept / total < 0.003) return null; // nothing worth cutting
  if (kept / total < 0.08) return null; // would delete the logo itself
  if (kept && lumSum / kept > 0.93) return null; // only a white shape would remain (invisible on light surfaces)
  return out;
}

/**
 * Returns RGBA with the uniform background made transparent, or null when it should not be cut.
 * Attempt 1 (corners): the four corners agree on one flat colour. Corners are the most reliable
 *   sign of a backdrop; artwork that touches the edges (a rounded-square icon on black, a blue
 *   square logo) is left alone because the fill only starts from the corners.
 * Attempt 2 (border): the border is mostly one flat colour but the corners disagree.
 */
function cutBackground(px: Px): Buffer | null {
  const { data, w, h } = px;
  const at = (x: number, y: number) => (y * w + x) * 4;
  const median = (idx: number[]) => {
    const m = (ch: number) => idx.map((i) => data[i + ch]).sort((p, q) => p - q)[idx.length >> 1];
    return [m(0), m(1), m(2)];
  };

  // 1. corner patches (3x3) must agree on one colour
  const patch = (cx: number, cy: number) => {
    const idx: number[] = [];
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) idx.push(at(cx + dx, cy + dy));
    return idx;
  };
  const corners = [patch(0, 0), patch(w - 3, 0), patch(0, h - 3), patch(w - 3, h - 3)];
  const bgB = median(corners.flat());
  const agree = corners.filter((c) => c.every((i) => colourDist(data, i, bgB) <= TOL)).length;
  if (agree >= 3) {
    const seeds = [0, w - 1, (h - 1) * w, h * w - 1];
    const r = finishCut(px, flood(px, bgB, seeds), bgB);
    if (r) return r;
  }

  // 2. a flat border whose corners disagree (e.g. the artwork reaches two corners)
  const border: number[] = [];
  for (let x = 0; x < w; x++) border.push(at(x, 0), at(x, h - 1));
  for (let y = 1; y < h - 1; y++) border.push(at(0, y), at(w - 1, y));
  const bgA = median(border);
  const matchA = border.filter((i) => colourDist(data, i, bgA) <= TOL + 8).length / border.length;
  if (matchA >= 0.6) {
    const seeds: number[] = [];
    for (let x = 0; x < w; x++) seeds.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) seeds.push(y * w, y * w + w - 1);
    return finishCut(px, flood(px, bgA, seeds), bgA);
  }
  return null;
}

/** Bounding box of visible pixels, padded a little. */
function visibleBox(data: Buffer, w: number, h: number) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return null;
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.03);
  const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
  return { left, top, width: Math.min(w, x1 + pad + 1) - left, height: Math.min(h, y1 + pad + 1) - top };
}

const immutable = { "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" };

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams.get("p") ?? "";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!PATH.test(p) || !base) return new NextResponse("Not found", { status: 404 });

  let source: Buffer;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/storage/v1/object/public/media/${p}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
    source = Buffer.from(await res.arrayBuffer());
    if (source.length > MAX_BYTES) return new NextResponse("Too large", { status: 413 });
  } catch {
    return new NextResponse("Upstream unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { data, info } = await sharp(source)
      .rotate()
      .resize({ width: WORK, height: WORK, fit: "inside", withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const px: Px = { data, w: info.width, h: info.height };

    // already transparent? (more than 2% fully transparent) -> keep the artwork, only trim
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 8) clear++;
    const alreadyClear = clear / (px.w * px.h) > 0.02;

    const rgba = alreadyClear ? data : cutBackground(px) ?? null;
    const buf = rgba ?? data;
    const box = rgba ? visibleBox(buf, px.w, px.h) : null;
    let img = sharp(buf, { raw: { width: px.w, height: px.h, channels: 4 } });
    if (box) img = img.extract(box);
    const png = await img
      .resize({ width: OUT, height: OUT, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, effort: 8 })
      .toBuffer();
    return new NextResponse(new Uint8Array(png), {
      headers: { "Content-Type": "image/png", ...immutable, "X-Logo-Cut": rgba && !alreadyClear ? "background-removed" : alreadyClear ? "transparent-original" : "kept-original" },
    });
  } catch {
    return new NextResponse("Could not process image", { status: 422, headers: { "Cache-Control": "public, max-age=300" } });
  }
}
