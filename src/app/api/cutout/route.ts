import { NextResponse } from "next/server";
import { processCutout } from "@/lib/image-cut";

/**
 * Project image cut-out: GET /api/cutout?p=projects/<file>.jpg
 *
 * Used ONLY for projects whose owner ticked "Remove the cover's flat background" in admin (isolated logos and
 * product graphics). It fetches the stored ORIGINAL, removes a flat backdrop and returns a transparent PNG at
 * up to 900px. If the background is not flat (a UI screenshot, a photo, a gradient) or the cut would damage the
 * artwork, the original comes back unchanged (header X-Logo-Cut: kept-original). The original upload is never
 * modified or deleted. Responses are immutable-cached: the object path contains a unique id per upload.
 */

export const maxDuration = 20;

const PATH = /^projects\/[A-Za-z0-9._-]{1,120}\.(png|jpe?g|webp|gif)$/i;
const MAX_BYTES = 12 * 1024 * 1024;

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
    const { png, mode } = await processCutout(source, { work: 900, out: 900 });
    return new NextResponse(new Uint8Array(png), {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable", "X-Logo-Cut": mode },
    });
  } catch {
    return new NextResponse("Could not process image", { status: 422, headers: { "Cache-Control": "public, max-age=300" } });
  }
}
