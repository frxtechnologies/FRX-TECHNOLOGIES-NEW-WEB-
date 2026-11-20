"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { resizeImageForUpload } from "@/lib/resize-image";
import { mediaUrl } from "@/lib/content/media";

/**
 * Uploads an image to the public `media` bucket (admin-only write, enforced by
 * Storage RLS) after downscaling it in the browser, and returns the object path
 * to store in the database. Throws a readable error on failure.
 */
export async function uploadMedia(
  supabase: SupabaseClient,
  file: File,
  folder: string,
  opts: { maxDimension?: number } = {},
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (JPG, PNG, WebP).");
  if (file.size > 12 * 1024 * 1024) throw new Error("That image is over 12 MB. Please choose a smaller one.");

  const isSvg = file.type === "image/svg+xml";
  const blob = isSvg ? file : await resizeImageForUpload(file, { maxDimension: opts.maxDimension ?? 1800, quality: 0.86 });
  const ext = isSvg ? "svg" : blob.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, blob, {
    cacheControl: "31536000",
    contentType: blob.type || file.type,
    upsert: false,
  });
  if (error) {
    throw new Error(
      /bucket not found/i.test(error.message)
        ? "The media storage bucket does not exist yet. Run the content migration in the Supabase SQL editor first."
        : error.message,
    );
  }
  return path;
}

export const previewUrl = (path: string | null | undefined) => mediaUrl(path);

/** Tell the public site to refresh its cached content right after an admin save. */
export async function revalidateSite() {
  try {
    await fetch("/api/revalidate", { method: "POST" });
  } catch {
    /* the site also refreshes itself within a minute */
  }
}
