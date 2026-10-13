import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only the panel and the sign-in pages need the session; the public pages
// stay static and never wait for Supabase.
export const config = {
  matcher: ['/app', '/app/:path*', '/login', '/signup'],
};
