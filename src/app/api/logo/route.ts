import { NextResponse } from "next/server";
import { processCutout } from "@/lib/image-cut";

/**
 * Logo cleaner: GET /api/logo?p=technologies/<file>.jpg
 *
 * Technology and affiliation logos are usually uploaded as JPEG/PNG screenshots with a flat white (or dark)
 * background. This route fetches the ORIGINAL from public storage, removes a uniform background, trims the
 * empty margin and returns a transparent PNG (see lib/image-cut.ts for the safety rules). Nothing is ever
 * written back: the stored original and the database row are untouched, and every future upload gets the
 * same treatment automatically. Only `technologies/` and `affiliations/` paths in OUR bucket are fetched.
 * Responses are immutable-cached: the object path contains a unique id per upload.
 */

export const maxDuration = 20;

const PATH = /^(technologies|affiliations)\/[A-Za-z0-9._-]{1,120}\.(png|jpe?g|webp|gif)$/i;
const MAX_BYTES = 6 * 1024 * 1024;

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
    // logos are shown at ~60px tall: 3x retina is plenty
    const { png, mode } = await processCutout(source, { work: 400, out: 224 });
    return new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", ...immutable, "X-Logo-Cut": mode } });
  } catch {
    return new NextResponse("Could not process image", { status: 422, headers: { "Cache-Control": "public, max-age=300" } });
  }
}
