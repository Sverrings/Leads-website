import { isPasswordBreached } from '@/lib/auth';
import { AppError, toAppError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase/client';

/**
 * Sign-in for the web app. Same accounts and the same rules as the iPhone
 * app (Leads/src/features/auth/api.ts): email is proven with the 6-digit
 * code from the email, passwords that appear in known breaches are refused,
 * and agreeing to the terms is recorded on the account.
 */

/** Bump together with the app (Leads/src/features/auth/consent.ts). */
export const TERMS_VERSION = '2026-10-06';

export type Consent = { terms_version: string; terms_accepted_at: string };

export function newConsent(): Consent {
  return { terms_version: TERMS_VERSION, terms_accepted_at: new Date().toISOString() };
}

/** Agreement given before leaving for Google, recorded once back (see AuthProvider). */
const PENDING_CONSENT = 'leads.pending-consent';

export function rememberConsentForRedirect(): void {
  try {
    sessionStorage.setItem(PENDING_CONSENT, JSON.stringify(newConsent()));
  } catch {
    // Setup asks again if this is lost.
  }
}

export function takePendingConsent(): Consent | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CONSENT);
    sessionStorage.removeItem(PENDING_CONSENT);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

/** The password was right, but the email address was never confirmed. */
export class EmailNotConfirmedError extends AppError {}

async function assertPasswordNotBreached(password: string) {
  if (await isPasswordBreached(password)) {
    throw new AppError({
      kind: 'validation',
      title: 'Choose another password',
      description:
        'This password has appeared in a data breach elsewhere, so it is easy to guess. Pick one you have not used before.',
    });
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
  if (!error) return;
  if (error.code === 'email_not_confirmed') {
    await resendSignUpCode(email).catch(() => undefined);
    throw new EmailNotConfirmedError({
      kind: 'auth',
      title: 'Confirm your email first',
      description: `We sent a new code to ${email}.`,
      cause: error,
    });
  }
  throw toAppError(error, { title: 'Unable to log in' });
}

export async function signUp(input: {
  displayName: string;
  email: string;
  password: string;
}): Promise<{ needsCode: boolean }> {
  await assertPasswordNotBreached(input.password);
  const { data, error } = await supabaseBrowser().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { display_name: input.displayName, ...newConsent() },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw toAppError(error, { title: 'Unable to create account' });
  // Supabase answers an address that already has an account with an empty user.
  if (data.user && data.user.identities?.length === 0) {
    throw new AppError({
      kind: 'conflict',
      title: 'You already have an account',
      description: 'Log in instead. If you used Google before, use that button, or reset your password.',
    });
  }
  return { needsCode: !data.session };
}

export async function verifySignUpCode(email: string, code: string): Promise<void> {
  const { error } = await supabaseBrowser().auth.verifyOtp({ email, token: code, type: 'email' });
  if (error) throw toAppError(error, { title: 'Unable to confirm your email' });
}

export async function resendSignUpCode(email: string): Promise<void> {
  const { error } = await supabaseBrowser().auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) throw toAppError(error, { title: 'Unable to send a new code' });
}

/** Resolves the same way whether or not the address has an account. */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset`,
  });
  if (error && error.code !== 'user_not_found') {
    throw toAppError(error, { title: 'Unable to send the code' });
  }
}

export async function verifyResetCode(email: string, code: string): Promise<void> {
  const { error } = await supabaseBrowser().auth.verifyOtp({ email, token: code, type: 'recovery' });
  if (error) throw toAppError(error, { title: 'Unable to reset your password' });
}

/** Saves the new password and signs out every other device. */
export async function setNewPassword(password: string): Promise<void> {
  await assertPasswordNotBreached(password);
  const client = supabaseBrowser();
  const { error } = await client.auth.updateUser({ password });
  if (error) throw toAppError(error, { title: 'Unable to save password' });
  await client.auth.signOut({ scope: 'others' }).catch(() => undefined);
}

/**
 * Google, through Supabase. Comes back to /auth/callback, which exchanges the
 * code for a session cookie and continues to `next`.
 */
export async function signInWithGoogle(next = '/app'): Promise<void> {
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await supabaseBrowser().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw toAppError(error, { title: 'Unable to continue with Google' });
}

export async function signOut(): Promise<void> {
  const { error } = await supabaseBrowser().auth.signOut();
  if (error) throw toAppError(error, { title: 'Unable to log out' });
}

export const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type ChangePasswordResult = 'changed' | 'code_sent';

/**
 * Sets or changes the password. When the last sign-in is more than a day old,
 * Supabase asks for proof first: a code is emailed, and this resolves with
 * 'code_sent'; call again with that code. Same as the app.
 */
export async function changePassword(password: string, code?: string): Promise<ChangePasswordResult> {
  await assertPasswordNotBreached(password);
  const client = supabaseBrowser();
  const { error } = await client.auth.updateUser({ password, nonce: code });
  if (!error) return 'changed';
  if (!code && (error.code === 'reauthentication_needed' || error.code === 'reauth_nonce_missing')) {
    const { error: sendError } = await client.auth.reauthenticate();
    if (sendError) throw toAppError(sendError, { title: 'Unable to send a code' });
    return 'code_sent';
  }
  throw toAppError(error, { title: 'Unable to save password' });
}

export async function fetchIdentities() {
  const { data, error } = await supabaseBrowser().auth.getUserIdentities();
  if (error) throw toAppError(error, { title: 'Unable to load sign-in methods' });
  return data.identities;
}

export async function signOutEverywhere(): Promise<void> {
  const { error } = await supabaseBrowser().auth.signOut({ scope: 'global' });
  if (error) throw toAppError(error, { title: 'Unable to log out' });
}

/**
 * Deletes the account with the same server function as the app. Removing
 * Apple's access needs Apple's own confirmation, which only the iPhone app
 * can ask for, so the web page points Apple users there first.
 */
export async function deleteAccount(): Promise<void> {
  const { invokeFunction } = await import('@/lib/functions');
  const { z } = await import('zod');
  await invokeFunction('delete-account', {}, z.object({ deleted: z.literal(true) }).loose(), {
    title: 'Unable to delete account',
    description: 'Nothing was deleted. Try again.',
  });
  await supabaseBrowser().auth.signOut({ scope: 'local' }).catch(() => undefined);
}
