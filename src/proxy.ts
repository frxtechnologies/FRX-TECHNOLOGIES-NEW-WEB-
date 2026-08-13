import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_EMAIL } from "@/lib/supabase/env";

/**
 * Next 16 renamed the `middleware` file/export to `proxy`, without changing
 * what it does — see node_modules/next/dist/docs/.../version-16.md. Same two
 * jobs as before under the old name:
 *
 * 1. Refresh the Supabase session cookie on every request. `@supabase/ssr`
 *    needs this run here specifically — Server Components can read cookies
 *    but can't reliably write refreshed ones back to the response. Skip this
 *    and sessions silently expire while the user is still using the site.
 *
 * 2. Gate `/admin`. This is a UX redirect, not the security boundary — the
 *    real one is the RLS policies in supabase/schema.sql, which check the
 *    JWT's email claim independently of anything that happens here. Someone
 *    bypassing this gets an admin UI with no data in it, not someone else's
 *    data.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Unconfigured project: don't 500 the whole site over it, just skip auth
    // plumbing. /admin will show its own "not configured" state.
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";
  const isAuthorized = user?.email === ADMIN_EMAIL;

  if (isAdminRoute && !isLoginRoute && !isAuthorized) {
    const redirectUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && isAuthorized) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and Next's own internals — the
     * session refresh is cheap but there's no reason to pay it for a font
     * file. Admin gating only needs /admin anyway.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|brand/|images/).*)",
  ],
};
