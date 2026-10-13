'use client';

import { useState, type FormEvent } from 'react';

import { authClient, describeAuthError } from '@/lib/auth';
import { site } from '@/site.config';

import styles from '../auth.module.css';

/** For people on a computer, or following the link in a "password changed" email. */
export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setWorking(true);
    const address = email.trim();
    const { error: sendError } = await authClient().auth.resetPasswordForEmail(address, {
      redirectTo: `${site.url}/auth/reset`,
    });
    setWorking(false);
    // An unknown address looks the same as a known one, so this page never
    // tells anyone who has an account.
    if (sendError && sendError.code !== 'user_not_found') return setError(describeAuthError(sendError));
    setSentTo(address);
  };

  if (sentTo) {
    return (
      <div className={styles.panel}>
        <h1 className="title">Check your email</h1>
        <p className="intro">
          If {sentTo} has a Leads account, we sent it a code and a link. Type the code into the
          app, or open the link here to choose a new password.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h1 className="title">Reset your password</h1>
      <p className="intro">Enter the email you use for Leads.</p>
      <form className={styles.form} onSubmit={(event) => void submit(event)}>
        <label className="field">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />
        </label>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button type="submit" className="button" disabled={working}>
            {working ? 'Sending…' : 'Send reset email'}
          </button>
        </div>
      </form>
    </div>
  );
}
