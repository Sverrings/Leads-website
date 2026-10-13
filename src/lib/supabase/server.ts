import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/lib/database.types';
import { site } from '@/site.config';

/**
 * A client for Server Components and Route Handlers, acting as the person in
 * the request's cookies. Create one per request.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient<Database>(site.supabase.url, site.supabase.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, which cannot set cookies. The
          // proxy refreshes the session on the next request instead.
        }
      },
    },
  });
}
