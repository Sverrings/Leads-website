'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { AppError } from '@/lib/errors';
import { TextField } from '@/ui/Field';

import {
  EmailNotConfirmedError,
  emailPattern,
  resendSignUpCode,
  signIn,
  signInWithGoogle,
  verifySignUpCode,
} from '../api';
import { AuthCard, CodeField, Divider, FormError, GoogleButton, PasswordField, SubmitButton } from './AuthCard';
import styles from './auth.module.css';

const CALLBACK_ERRORS: Record<string, string> = {
  provider_error: 'Google sign-in was cancelled or failed. Try again.',
  callback_failed: 'That sign-in link has expired. Try again.',
  flow_state_not_found: 'That sign-in has expired. Try again.',
  bad_code_verifier: 'Finish signing in in the same browser you started in.',
};

/** Only paths in the web app. */
function safeNext(value: string | null): string {
  return value && value.startsWith('/app') ? value : '/app';
}

function message(error: unknown): string {
  return error instanceof AppError ? error.description : 'Something went wrong. Try again.';
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const callbackError = params.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'password' | 'code'>('password');
  const [busy, setBusy] = useState<'login' | 'google' | 'code' | 'resend' | null>(null);
  const [error, setError] = useState<string | null>(
    callbackError ? (CALLBACK_ERRORS[callbackError] ?? CALLBACK_ERRORS.callback_failed!) : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const enter = () => {
    router.replace(next);
    router.refresh();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!emailPattern.test(email.trim())) return setError('Enter a valid email address.');
    setBusy('login');
    try {
      await signIn(email.trim().toLowerCase(), password);
      enter();
    } catch (failure) {
      if (failure instanceof EmailNotConfirmedError) {
        setNotice(failure.description);
        setStep('code');
      } else {
        setError(message(failure));
      }
      setBusy(null);
    }
  };

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (code.length !== 6) return setError('Enter the 6-digit code from the email.');
    setBusy('code');
    try {
      await verifySignUpCode(email.trim().toLowerCase(), code);
      enter();
    } catch (failure) {
      setError(message(failure));
      setBusy(null);
    }
  };

  const resend = async () => {
    setError(null);
    setBusy('resend');
    try {
      await resendSignUpCode(email.trim().toLowerCase());
      setNotice(`We sent a new code to ${email.trim()}.`);
    } catch (failure) {
      setError(message(failure));
    }
    setBusy(null);
  };

  const google = async () => {
    setError(null);
    setBusy('google');
    try {
      await signInWithGoogle(next);
    } catch (failure) {
      setError(message(failure));
      setBusy(null);
    }
  };

  if (step === 'code') {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`Type the 6-digit code we sent to ${email.trim()}. It works for one hour.`}>
        <form className={styles.form} onSubmit={(event) => void confirm(event)} noValidate>
          {notice ? <p className={styles.notice}>{notice}</p> : null}
          <FormError message={error} />
          <CodeField value={code} onChange={setCode} />
          <SubmitButton loading={busy === 'code'}>Confirm and log in</SubmitButton>
          <div className={styles.row}>
            <button type="button" className={styles.linkButton} onClick={() => setStep('password')}>
              Back
            </button>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => void resend()}
              disabled={busy === 'resend'}>
              Send a new code
            </button>
          </div>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Log in to Leads"
      subtitle="The same account as the iPhone app."
      footer={
        <>
          New to Leads? <Link href="/signup">Create an account</Link>
        </>
      }>
      <GoogleButton onClick={() => void google()} loading={busy === 'google'} />
      <Divider label="or with email" />
      <form className={styles.form} onSubmit={(event) => void submit(event)} noValidate>
        <FormError message={error} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoFocus
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          aside={
            <Link href="/forgot-password" className={styles.small}>
              Forgot password?
            </Link>
          }
        />
        <SubmitButton loading={busy === 'login'}>Log in</SubmitButton>
      </form>
      <p className={styles.small}>
        Signed up with Apple on your iPhone? Add a password in the app under Settings → Sign-in &amp;
        security, then log in here with your email.
      </p>
    </AuthCard>
  );
}
