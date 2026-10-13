import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/database.types';
import { site } from '@/site.config';

/**
 * The signed-in browser client. The session lives in cookies (not
 * localStorage), so the server can check who is signed in before the panel
 * renders. `createBrowserClient` returns the same instance on every call.
 */
export function supabaseBrowser() {
  return createBrowserClient<Database>(site.supabase.url, site.supabase.publishableKey);
}

export type BrowserClient = ReturnType<typeof supabaseBrowser>;
