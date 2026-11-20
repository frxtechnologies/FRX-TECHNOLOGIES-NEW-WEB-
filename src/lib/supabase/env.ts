/**
 * Centralised so every client construction fails the same way if the project
 * isn't configured, instead of each call site throwing its own version of
 * "cannot read property of undefined" three layers deep in a stack trace.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

const DEFAULT_ADMIN_EMAIL = "frx.technologies@gmail.com";

/**
 * The one account allowed into /admin. This must equal the address the SQL policies trust
 * (supabase/schema.sql). It falls back to the default when the env var is missing OR is not
 * a full email address (e.g. "frx.technologies" typed without "@gmail.com"), so a mistake in
 * the hosting dashboard can never lock the owner out. The database policies are the real
 * boundary; this value only decides who the app lets reach the screens.
 */
const fromEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
export const ADMIN_EMAIL = fromEnv && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEnv) ? fromEnv : DEFAULT_ADMIN_EMAIL;

/** Case-insensitive: Supabase stores emails lower-cased, people type them however. */
export const isAdminEmail = (email?: string | null) => !!email && email.trim().toLowerCase() === ADMIN_EMAIL;
