"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { getSupabaseEnv } from "./env";

/**
 * Browser client. Only ever carries the anon/publishable key — the same key
 * that's visible in the page source to anyone who opens devtools. That's by
 * design for Supabase's model: every table this key can touch is gated by a
 * Row Level Security policy in supabase/schema.sql, not by keeping this key
 * secret. There is no service-role key in this project.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
