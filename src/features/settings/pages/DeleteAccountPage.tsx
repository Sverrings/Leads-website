'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/ui/Button';
import { useConfirm } from '@/ui/Dialog';
import { Icon, type IconName } from '@/ui/Icon';
import { useToast } from '@/ui/Toast';

import { deleteAccount, fetchIdentities } from '../../auth/api';
import { useAuth } from '../../auth/AuthProvider';
import { useWorkspaceContext } from '../../workspace/WorkspaceProvider';
import { SettingsSection } from '../SettingsShell';
import styles from '../settings.module.css';

const WHAT_HAPPENS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'user', title: 'Your account is removed', body: 'Your profile and every way you log in. You can sign up again later.' },
  { icon: 'trash-2', title: 'Workspaces only you use are deleted', body: 'With all their leads, messages, templates and history.' },
  {
    icon: 'users',
    title: 'Shared workspaces stay for your team',
    body: 'Their leads are kept. If you are the owner, the teammate who has been there longest takes over.',
  },
];

/** The same deletion as the app (Settings → Delete account), with the same server function. */
export function DeleteAccountPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const { memberships } = useWorkspaceContext();
  const identities = useQuery({ queryKey: ['identities', user.id], queryFn: fetchIdentities });
  const [busy, setBusy] = useState(false);
  const usesApple = identities.data?.some((identity) => identity.provider === 'apple') ?? false;

  const submit = async () => {
    const ok = await confirm({
      title: 'Delete your account?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteAccount();
      // A full load, so nothing from this account stays in memory.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/?deleted=1');
    } catch (failure) {
      toast.error(failure, 'Unable to delete account');
      setBusy(false);
    }
  };

  return (
    <SettingsSection
      title={`Delete ${user.email ?? 'your account'}`}
      description={`You belong to ${memberships.length === 1 ? 'one workspace' : `${memberships.length} workspaces`}. Here is what happens:`}
      footer={
        <Button variant="danger" icon="trash-2" onClick={() => void submit()} loading={busy}>
          Delete my account
        </Button>
      }>
      {WHAT_HAPPENS.map((item) => (
        <div key={item.title} className={styles.notice}>
          <Icon name={item.icon} size={15} />
          <span>
            <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{item.title}.</strong> {item.body}
          </span>
        </div>
      ))}
      <p className={styles.muted}>
        Paying for Leads Pro? Apple keeps charging until the subscription is cancelled, even after the account is
        gone. Cancel it first in the iPhone app under Settings → Leads Pro.
      </p>
      {usesApple ? (
        <p className={styles.muted}>
          You signed in with Apple. Delete your account from the iPhone app instead, so Apple&apos;s access to your Apple ID
          is removed too.
        </p>
      ) : null}
    </SettingsSection>
  );
}
