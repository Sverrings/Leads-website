'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';

import { authClient, describeAuthError, isPasswordBreached } from '@/lib/auth';

import styles from '../auth.module.css';

/**
 * Opened from the link in a password reset email. The link is only used when
 * the new password is submitted, so a mail app that opens links to scan them
 * cannot spend it. Afterwards every device is signed out.
 */
export function ResetPassword() {
  const params = useSearchParams();
  const tokenHash = params.get('token_hash');
  const linkError = params.get('error_code') ?? params.get('error');

  const [password, setPassword] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  // Kept after the link is used, so a rejected password can be retried.
  const verified = useRef<SupabaseClient | null>(null);

  if (!tokenHash || linkError) {
    return (
      <div className={styles.panel}>
        <h1 className="title">This link didn&apos;t work</h1>
        <p className="intro">{describeAuthError({ code: 'otp_expired' })}</p>
        <p>
          <Link href="/auth/forgot">Ask for a new one</Link>, or reset your password from the Leads
          app with a code.
        </p>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password.length > 72) return setError('Use at most 72 characters.');

    setWorking(true);
    try {
      if (await isPasswordBreached(password)) {
        return setError(
          'This password has shown up in a data breach on another site, so attackers try it first. Choose a different one.',
        );
      }

      let client = verified.current;
      if (!client) {
        client = authClient();
        const { error: verifyError } = await client.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (verifyError) return setError(describeAuthError(verifyError));
        verified.current = client;
      }

      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) return setError(describeAuthError(updateError));

      // Whoever had the old password is now logged out everywhere.
      await client.auth.signOut({ scope: 'global' }).catch(() => undefined);
      setDone(true);
    } finally {
      setWorking(false);
    }
  };

  if (done) {
    return (
      <div className={styles.panel}>
        <h1 className="title">Your password is changed</h1>
        <p className="intro">
          Log in to the Leads app with your new password. Every phone that was signed in has been
          logged out.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h1 className="title">Choose a new password</h1>
      <p className="intro">Use at least 8 characters. A short sentence is easy to remember.</p>
      <form className={styles.form} onSubmit={(event) => void submit(event)}>
        <label className={`field ${styles.password}`}>
          New password
          <input
            type={revealed ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={128}
            required
            autoFocus
          />
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealed((value) => !value)}
            aria-pressed={revealed}>
            {revealed ? 'Hide' : 'Show'}
          </button>
        </label>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button type="submit" className="button" disabled={working}>
            {working ? 'Saving…' : 'Save new password'}
          </button>
        </div>
      </form>
    </div>
  );
}
