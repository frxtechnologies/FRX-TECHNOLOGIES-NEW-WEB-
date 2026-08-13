"use client";

/**
 * Downscales and re-encodes an image in the browser before it ever reaches
 * Supabase Storage. Browser-native (Canvas + createImageBitmap) — no added
 * dependency for what's a one-off admin upload path.
 *
 * The bug this exists to prevent: a phone-camera photo uploaded through
 * /admin/founders with no processing at all landed in storage at ~1.85MB,
 * and Next's on-demand image optimizer timed out trying to resize it for
 * every requested breakpoint. The fix belongs here, at the point of upload —
 * store something reasonable once, rather than asking the optimizer to
 * rescue an oversized original on every single request.
 */
export async function resizeImageForUpload(
  file: File,
  { maxDimension = 1600, quality = 0.85 } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );

  // If canvas encoding fails for any reason, upload the original rather than
  // blocking the admin from setting a photo at all.
  return blob ?? file;
}
