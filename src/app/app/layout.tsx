import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { PanelProviders } from '@/features/panel/PanelProviders';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: { default: 'Leads', template: '%s · Leads' },
  robots: { index: false, follow: false },
};

/**
 * The web app. The proxy already sent signed-out visitors to /login; this
 * checks again on the server with a verified token before anything renders.
 * Data itself is protected by row-level security either way.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect('/login?next=/app');

  return (
    <PanelProviders
      initialUser={{ id: claims.sub, email: typeof claims.email === 'string' ? claims.email : null }}>
      {children}
    </PanelProviders>
  );
}
