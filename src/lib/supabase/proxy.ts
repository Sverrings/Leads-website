import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import type { Database } from '@/lib/database.types';
import { site } from '@/site.config';

/** Pages for people who are not signed in yet; signed-in visitors go to the panel. */
const SIGNED_OUT_ONLY = ['/login', '/signup'];

/**
 * Runs before /app and the sign-in pages (see src/proxy.ts):
 *
 * 1. Refreshes an expiring session and writes the new cookies to both the
 *    request (for Server Components) and the response (for the browser).
 * 2. Sends signed-out visitors from /app to /login, and signed-in visitors
 *    from /login or /signup to /app.
 *
 * The check is optimistic: the panel's server layout verifies the user again,
 * and every row is still protected by row-level security in the database.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(site.supabase.url, site.supabase.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Keeps CDNs from caching a response that carries someone's session.
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });

  // Nothing may run between creating the client and getClaims(): it is what
  // refreshes the session. getClaims() also verifies the token's signature.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const redirect = (to: string) => {
    const target = NextResponse.redirect(new URL(to, request.url));
    // Carry refreshed cookies over to the redirect.
    for (const cookie of response.cookies.getAll()) target.cookies.set(cookie);
    return target;
  };

  if (!signedIn && (pathname === '/app' || pathname.startsWith('/app/'))) {
    return redirect(`/login?next=${encodeURIComponent(pathname + search)}`);
  }
  if (signedIn && SIGNED_OUT_ONLY.includes(pathname)) {
    return redirect('/app');
  }
  return response;
}
