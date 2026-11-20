import "server-only";
import { headers } from "next/headers";

/**
 * Small fixed-window limiter for the public form actions.
 *
 * State is per server instance (in memory). That stops simple bursts but is NOT
 * a global limit on serverless hosting, where each instance has its own memory.
 * The database provides the global backstop (`throttle_public_inserts` triggers
 * in supabase/migrations/20261120000100_frx_content.sql). For stricter
 * multi-instance limiting, swap the Map for a shared store (e.g. Upstash Redis)
 * behind this same function signature.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const e = hits.get(key);
  if (!e || e.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  e.count += 1;
  return e.count <= limit;
}

export async function clientKey(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}
