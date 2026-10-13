'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { AppError } from '@/lib/errors';
import { TextField } from '@/ui/Field';

import { emailPattern, requestPasswordReset, setNewPassword, verifyResetCode } from '../api';
import { AuthCard, CodeField, FormError, PasswordField, SubmitButton } from './AuthCard';
import styles from './auth.module.css';

function message(error: unknown): string {
  return error instanceof AppError ? error.description : 'Something went wrong. Try again.';
}

/**
 * Email → code → new password, then straight into the web app. The code
 * opens a short recovery session, which the new password then replaces.
 */
export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = email.trim().toLowerCase();

  const run = (task: () => Promise<void>) => async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await task();
    } catch (failure) {
      setError(message(failure));
    }
    setBusy(false);
  };

  const send = run(async () => {
    if (!emailPattern.test(address)) throw new AppError({ kind: 'validation', title: '', description: 'Enter a valid email address.' });
    await requestPasswordReset(address);
    setStep('code');
  });

  const verify = run(async () => {
    if (code.length !== 6) throw new AppError({ kind: 'validation', title: '', description: 'Enter the 6-digit code from the email.' });
    await verifyResetCode(address, code);
    setStep('password');
  });

  const save = run(async () => {
    if (password.length < 8) throw new AppError({ kind: 'validation', title: '', description: 'Use at least 8 characters.' });
    await setNewPassword(password);
    router.replace('/app');
    router.refresh();
  });

  if (step === 'code') {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`If ${address} has a Leads account, we sent it a 6-digit code. Only the newest code works.`}>
        <form className={styles.form} onSubmit={(event) => void verify(event)} noValidate>
          <FormError message={error} />
          <CodeField value={code} onChange={setCode} />
          <SubmitButton loading={busy}>Continue</SubmitButton>
          <div className={styles.row}>
            <button type="button" className={styles.linkButton} onClick={() => setStep('email')}>
              Use a different email
            </button>
          </div>
        </form>
      </AuthCard>
    );
  }

  if (step === 'password') {
    return (
      <AuthCard title="Choose a new password" subtitle="You will stay logged in here. Other devices are logged out.">
        <form className={styles.form} onSubmit={(event) => void save(event)} noValidate>
          <FormError message={error} />
          <PasswordField
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            hint="At least 8 characters."
          />
          <SubmitButton loading={busy}>Save password</SubmitButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email you use for Leads. We send you a code."
      footer={
        <>
          Remembered it? <Link href="/login">Log in</Link>
        </>
      }>
      <form className={styles.form} onSubmit={(event) => void send(event)} noValidate>
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
        <SubmitButton loading={busy}>Send code</SubmitButton>
      </form>
    </AuthCard>
  );
}
