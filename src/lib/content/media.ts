/**
 * Public URL for an object in a public Supabase Storage bucket. Safe to import
 * from client and server code. Returns null when there is no path, so callers
 * can fall back to an illustration slot rather than a broken image.
 */
export function mediaUrl(path: string | null | undefined, bucket: "media" | "founders" = "media"): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}
