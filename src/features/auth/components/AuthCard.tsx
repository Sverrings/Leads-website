'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '@/ui/Button';
import { TextField } from '@/ui/Field';

import styles from './auth.module.css';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <section className={styles.card}>
        <header className={styles.head}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>
        {children}
      </section>
      {footer ? <p className={styles.footer}>{footer}</p> : null}
    </div>
  );
}

export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className={styles.divider} role="separator">
      <span>{label}</span>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className={styles.formError} role="alert">
      {message}
    </p>
  );
}

/** The multicolour G, as Google asks sign-in buttons to show it. */
function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function GoogleButton({
  onClick,
  loading,
  disabled,
  label = 'Continue with Google',
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={styles.google}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}>
      <GoogleMark />
      {label}
    </button>
  );
}

export function PasswordField({
  label = 'Password',
  value,
  onChange,
  autoComplete,
  hint,
  error,
  aside,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  hint?: string;
  error?: string | null;
  aside?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.password}>
      <TextField
        label={label}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        hint={hint}
        error={error}
        aside={aside}
        required
      />
      <button
        type="button"
        className={styles.reveal}
        onClick={() => setVisible((shown) => !shown)}
        aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

/** The 6-digit code from the email. Pasting a whole code works. */
export function CodeField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  return (
    <TextField
      label="6-digit code"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]*"
      maxLength={6}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
      error={error}
      className={styles.code}
      autoFocus
      required
    />
  );
}

export function SubmitButton({ children, loading }: { children: ReactNode; loading?: boolean }) {
  return (
    <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
      {children}
    </Button>
  );
}
