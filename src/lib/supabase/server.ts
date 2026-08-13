import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { getSupabaseEnv } from "./env";

/**
 * Server client for Server Components, Route Handlers and Server Actions.
 * Reads the session from cookies that `middleware.ts` keeps refreshed.
 *
 * Call sites that only read public data (assistant entries, founders) don't
 * need this — the browser client is enough and avoids the per-request cookie
 * plumbing. This exists for the admin routes, which need to know who's
 * signed in before rendering anything.
 */
export async function createServerSupabase() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render, where cookies are
          // read-only. Harmless: middleware refreshes the session on every
          // request anyway, so this write was an optimisation, not a
          // requirement.
        }
      },
    },
  });
}
