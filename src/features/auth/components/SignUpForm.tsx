'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { AppError } from '@/lib/errors';
import { Checkbox, TextField } from '@/ui/Field';

import {
  emailPattern,
  rememberConsentForRedirect,
  resendSignUpCode,
  signInWithGoogle,
  signUp,
  verifySignUpCode,
} from '../api';
import { AuthCard, CodeField, Divider, FormError, GoogleButton, PasswordField, SubmitButton } from './AuthCard';
import styles from './auth.module.css';

function message(error: unknown): string {
  return error instanceof AppError ? error.description : 'Something went wrong. Try again.';
}

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [busy, setBusy] = useState<'create' | 'google' | 'code' | 'resend' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const address = email.trim().toLowerCase();

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Enter your name.';
    if (!emailPattern.test(address)) errors.email = 'Enter a valid email address.';
    if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (password.length > 72) errors.password = 'Use at most 72 characters.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    if (!accepted) return setError('Tick the box to agree to the terms first.');

    setBusy('create');
    try {
      const { needsCode } = await signUp({ displayName: name.trim(), email: address, password });
      if (needsCode) {
        setStep('code');
        setBusy(null);
      } else {
        router.replace('/app');
        router.refresh();
      }
    } catch (failure) {
      setError(message(failure));
      setBusy(null);
    }
  };

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (code.length !== 6) return setError('Enter the 6-digit code from the email.');
    setBusy('code');
    try {
      await verifySignUpCode(address, code);
      router.replace('/app');
      router.refresh();
    } catch (failure) {
      setError(message(failure));
      setBusy(null);
    }
  };

  const resend = async () => {
    setError(null);
    setBusy('resend');
    try {
      await resendSignUpCode(address);
      setNotice(`We sent a new code to ${address}.`);
    } catch (failure) {
      setError(message(failure));
    }
    setBusy(null);
  };

  const google = async () => {
    setError(null);
    if (!accepted) return setError('Tick the box to agree to the terms first.');
    setBusy('google');
    rememberConsentForRedirect();
    try {
      await signInWithGoogle('/app');
    } catch (failure) {
      setError(message(failure));
      setBusy(null);
    }
  };

  if (step === 'code') {
    return (
      <AuthCard
        title="Confirm your email"
        subtitle={`We sent a 6-digit code to ${address}. It works for one hour.`}>
        <form className={styles.form} onSubmit={(event) => void confirm(event)} noValidate>
          {notice ? <p className={styles.notice}>{notice}</p> : null}
          <FormError message={error} />
          <CodeField value={code} onChange={setCode} />
          <SubmitButton loading={busy === 'code'}>Confirm email</SubmitButton>
          <div className={styles.row}>
            <button type="button" className={styles.linkButton} onClick={() => setStep('details')}>
              Use a different email
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
      title="Create your account"
      subtitle="Free for 3 active leads. Works here and in the iPhone app."
      footer={
        <>
          Already have an account? <Link href="/login">Log in</Link>
        </>
      }>
      <form className={styles.form} onSubmit={(event) => void create(event)} noValidate>
        <FormError message={error} />
        <TextField
          label="Your name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
          maxLength={80}
          required
          autoFocus
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          required
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint="At least 8 characters."
          error={fieldErrors.password}
        />
        <Checkbox checked={accepted} onChange={setAccepted}>
          I agree to the{' '}
          <Link href="/terms" target="_blank">
            terms
          </Link>{' '}
          and have read the{' '}
          <Link href="/privacy" target="_blank">
            privacy policy
          </Link>
          . Customer details I add stay mine and are only used to run Leads.
        </Checkbox>
        <SubmitButton loading={busy === 'create'}>Create account</SubmitButton>
      </form>
      <Divider />
      <GoogleButton onClick={() => void google()} loading={busy === 'google'} label="Sign up with Google" />
    </AuthCard>
  );
}
