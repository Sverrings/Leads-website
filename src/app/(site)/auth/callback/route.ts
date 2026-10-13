import { NextResponse, type NextRequest } from 'next/server';

import { supabaseServer } from '@/lib/supabase/server';

/** Only paths on this site, so a crafted link can never send someone elsewhere. */
function safeNext(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
    ? value
    : '/app';
}

/**
 * Where Google sign-in on the web comes back to. Exchanges the one-time code
 * for a session (stored in cookies) and continues into the web app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get('next'));
  const code = searchParams.get('code');
  const providerError = searchParams.get('error_description') ?? searchParams.get('error');

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.code ?? 'callback_failed')}`, origin),
    );
  }

  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(providerError ? 'provider_error' : 'callback_failed')}`, origin),
  );
}
