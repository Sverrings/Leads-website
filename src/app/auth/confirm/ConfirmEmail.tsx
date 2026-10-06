'use client';

import type { EmailOtpType } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { appLink, authClient, describeAuthError } from '@/lib/auth';

import styles from '../auth.module.css';

const TYPES: readonly EmailOtpType[] = ['email', 'signup', 'email_change', 'invite', 'magiclink'];

type State = 'ready' | 'working' | 'done' | 'failed';

/**
 * Opened from the link in a confirmation email. Nothing happens until the
 * person presses the button: some mail apps open links on their own to scan
 * them, and that must not use up the link.
 */
export function ConfirmEmail() {
  const params = useSearchParams();
  const tokenHash = params.get('token_hash');
  const typeParam = params.get('type') as EmailOtpType | null;
  const type = typeParam && TYPES.includes(typeParam) ? typeParam : 'email';
  const next = params.get('next');
  // Supabase's own confirmation link already confirmed the email before it
  // redirected here; it may carry a code the app can sign in with.
  const code = params.get('code');
  const linkError = params.get('error_code') ?? params.get('error');

  const [state, setState] = useState<State>(
    linkError ? 'failed' : tokenHash ? 'ready' : code ? 'done' : 'failed',
  );
  const [message, setMessage] = useState(
    linkError || !tokenHash ? describeAuthError({ code: 'otp_expired' }) : '',
  );

  const confirm = async () => {
    if (!tokenHash) return;
    setState('working');
    const client = authClient();
    const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      setMessage(describeAuthError(error));
      setState('failed');
      return;
    }
    // The browser doesn't need this session; end it so it can't be reused.
    await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
    setState('done');
  };

  const openApp = appLink(next, code ? { code } : undefined);

  if (state === 'done') {
    return (
      <div className={styles.panel}>
        <h1 className="title">Your email is confirmed</h1>
        <p className="intro">
          Go back to the Leads app on your phone. If it asks, log in with your email and password.
        </p>
        <div className={styles.actions}>
          <a className="button" href={openApp}>
            Open Leads
          </a>
        </div>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className={styles.panel}>
        <h1 className="title">This link didn&apos;t work</h1>
        <p className="intro">{message}</p>
        <p>
          Open Leads and log in. If your email isn&apos;t confirmed yet, the app sends you a new
          code to type in.
        </p>
        <div className={styles.actions}>
          <a className="button" href={appLink(next)}>
            Open Leads
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h1 className="title">Confirm your email</h1>
      <p className="intro">Press the button to finish creating your Leads account.</p>
      <div className={styles.actions}>
        <button
          type="button"
          className="button"
          onClick={() => void confirm()}
          disabled={state === 'working'}>
          {state === 'working' ? 'Confirming…' : 'Confirm email'}
        </button>
      </div>
    </div>
  );
}
