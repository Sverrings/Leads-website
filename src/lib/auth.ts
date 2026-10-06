import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { site } from '@/site.config';

/**
 * A client for one confirmation or reset. It keeps nothing in the browser:
 * no session in storage, no refresh in the background.
 */
export function authClient(): SupabaseClient {
  return createClient(site.supabase.url, site.supabase.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * Where "Open Leads" goes. Email links may carry the app's own return address
 * (`next`); only app addresses are accepted, so a crafted link can never send
 * someone to another website from here.
 */
export function appLink(next: string | null, extra?: Record<string, string>): string {
  const target =
    next && next.length < 300 && /^(leads|exp|exps):\/\//i.test(next)
      ? next
      : `${site.appUrl}auth/callback`;
  if (!extra) return target;
  const url = new URL(target);
  for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
  return url.toString();
}

/** Plain words for the errors these pages can meet. */
export function describeAuthError(error: { code?: string; message?: string } | null): string {
  switch (error?.code) {
    case 'otp_expired':
      return 'This link has expired or has already been used.';
    case 'same_password':
      return 'That is already your password. Choose a different one.';
    case 'weak_password':
      return 'Choose a longer password that is harder to guess.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Too many attempts. Wait a minute and try again.';
    default:
      return 'Something went wrong. Try again in a moment.';
  }
}

/**
 * True when the password appears in Have I Been Pwned's list of breached
 * passwords. Only the first five characters of its SHA-1 hash are sent. If the
 * service cannot be reached, the password is allowed.
 */
export async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return false;
    const suffix = hash.slice(5);
    return (await response.text()).split(/\r?\n/).some((line) => {
      const [candidate, count] = line.trim().split(':');
      return candidate === suffix && Number(count) > 0;
    });
  } catch {
    return false;
  }
}
