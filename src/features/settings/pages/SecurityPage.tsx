'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { AppError } from '@/lib/errors';
import { capitalize } from '@/lib/strings';
import { Button } from '@/ui/Button';
import { Badge, SkeletonRows } from '@/ui/Display';
import { useConfirm } from '@/ui/Dialog';
import { TextField } from '@/ui/Field';
import { useToast } from '@/ui/Toast';

import { changePassword, fetchIdentities, signOutEverywhere } from '../../auth/api';
import { useAuth } from '../../auth/AuthProvider';
import { SettingsRow, SettingsSection } from '../SettingsShell';
import styles from '../settings.module.css';

export function SecurityPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const identities = useQuery({ queryKey: ['identities', user.id], queryFn: fetchIdentities });
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPassword = identities.data?.some((identity) => identity.provider === 'email') ?? true;

  const save = async () => {
    setError(null);
    if (password.length < 8) return setError('Use at least 8 characters.');
    setBusy(true);
    try {
      const result = await changePassword(password, needsCode ? code.trim() : undefined);
      if (result === 'code_sent') {
        setNeedsCode(true);
        toast.show({ title: 'Check your email', description: `We sent a code to ${user.email} to confirm it's you.` });
      } else {
        toast.success(hasPassword ? 'Password changed' : 'Password added', 'You can log in with it here and in the app.');
        setPassword('');
        setCode('');
        setNeedsCode(false);
        void identities.refetch();
      }
    } catch (failure) {
      setError(failure instanceof AppError ? failure.description : 'Something went wrong. Try again.');
    }
    setBusy(false);
  };

  const everywhere = async () => {
    const ok = await confirm({
      title: 'Log out everywhere?',
      message: 'You are logged out on every phone and browser, including this one.',
      confirmLabel: 'Log out everywhere',
      destructive: true,
    });
    if (!ok) return;
    try {
      await signOutEverywhere();
      // A full load, so nothing from this account stays in memory.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/login');
    } catch (failure) {
      toast.error(failure, 'Unable to log out');
    }
  };

  return (
    <>
      <SettingsSection
        title={hasPassword ? 'Change password' : 'Add a password'}
        description={
          hasPassword
            ? 'At least 8 characters. Passwords found in known data breaches are refused.'
            : 'Then you can also log in with your email, here and in the app.'
        }
        footer={
          <Button variant="primary" onClick={() => void save()} loading={busy} disabled={!password}>
            {needsCode ? 'Confirm and save' : 'Save password'}
          </Button>
        }>
        {error ? <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p> : null}
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {needsCode ? (
          <TextField
            label="Code from the email"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            hint="For your safety, Leads asks for this when you last logged in more than a day ago."
          />
        ) : null}
      </SettingsSection>

      <SettingsSection title="Ways to log in" description="Connect or remove Apple and Google in the iPhone app.">
        {identities.isPending ? (
          <SkeletonRows rows={2} />
        ) : (
          (identities.data ?? []).map((identity) => (
            <SettingsRow
              key={identity.identity_id}
              title={identity.provider === 'email' ? 'Email and password' : capitalize(identity.provider)}
              description={typeof identity.identity_data?.email === 'string' ? identity.identity_data.email : undefined}
              control={<Badge tone="success">Connected</Badge>}
            />
          ))
        )}
      </SettingsSection>

      <SettingsSection title="Sessions">
        <SettingsRow
          title="Log out everywhere"
          description="If you used Leads on a computer that isn't yours, or lost a phone."
          control={
            <Button variant="danger" onClick={() => void everywhere()}>
              Log out everywhere
            </Button>
          }
        />
        <p className={styles.muted}>Signed in as {user.email}.</p>
      </SettingsSection>
    </>
  );
}
