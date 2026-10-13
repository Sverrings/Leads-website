'use client';

import { useState } from 'react';

import { capitalize } from '@/lib/strings';
import { Button } from '@/ui/Button';
import { Avatar, Badge, ErrorState, SkeletonRows } from '@/ui/Display';
import { useConfirm } from '@/ui/Dialog';
import { TextField } from '@/ui/Field';
import { useToast } from '@/ui/Toast';

import { useAuth } from '../../auth/AuthProvider';
import { useRegenerateInviteCode, useUpdateWorkspace, useWorkspaceMembers } from '../../workspace/hooks';
import { useCurrentWorkspace } from '../../workspace/WorkspaceProvider';
import { useSenderNameOffer } from '../useSenderNameOffer';
import { SettingsRow, SettingsSection } from '../SettingsShell';
import styles from '../settings.module.css';

export function WorkspacePage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const { workspace, isAdmin } = useCurrentWorkspace();
  const members = useWorkspaceMembers();
  const regenerate = useRegenerateInviteCode();

  const newCode = async () => {
    const ok = await confirm({
      title: 'Make a new invite code?',
      message: 'The old code stops working. People already in the workspace stay.',
      confirmLabel: 'New code',
    });
    if (!ok) return;
    regenerate.mutate(undefined, {
      onSuccess: () => toast.success('New invite code ready'),
      onError: (error) => toast.error(error, 'Unable to make a new code'),
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(workspace.invite_code);
      toast.success('Invite code copied');
    } catch {
      // The code is on screen to copy by hand.
    }
  };

  return (
    <>
      <WorkspaceNameForm key={workspace.name} />

      <SettingsSection
        title="Invite your team"
        description="Teammates join with this code in the app or here, under “Create or join a workspace”. Everyone sees the same leads.">
        <SettingsRow
          title={<span className={styles.code}>{workspace.invite_code}</span>}
          control={
            <>
              <Button icon="copy" onClick={() => void copyCode()}>
                Copy
              </Button>
              {isAdmin ? (
                <Button variant="ghost" icon="rotate-ccw" onClick={() => void newCode()} loading={regenerate.isPending}>
                  New code
                </Button>
              ) : null}
            </>
          }
        />
      </SettingsSection>

      <SettingsSection title="People" description="Owners and admins can change rules, templates and the plan.">
        {members.isPending ? (
          <SkeletonRows rows={2} />
        ) : members.isError ? (
          <ErrorState title="Unable to load members" error={members.error} onRetry={() => void members.refetch()} />
        ) : (
          members.data.map((member) => {
            const display = member.profile?.display_name || 'Teammate';
            return (
              <SettingsRow
                key={member.id}
                title={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={display} size={28} />
                    {display}
                    {member.user_id === user.id ? <span className={styles.muted}>(you)</span> : null}
                  </span>
                }
                control={<Badge tone={member.role === 'member' ? 'muted' : 'neutral'}>{capitalize(member.role)}</Badge>}
              />
            );
          })
        )}
      </SettingsSection>
    </>
  );
}

function WorkspaceNameForm() {
  const toast = useToast();
  const { workspace, isAdmin } = useCurrentWorkspace();
  const update = useUpdateWorkspace();
  const senderName = useSenderNameOffer();
  const [name, setName] = useState(workspace.name);

  const saveName = () => {
    const next = name.trim();
    if (!next || next === workspace.name) return;
    const previousSender = senderName.currentSenderName();
    update.mutate(
      { name: next },
      {
        onSuccess: () => {
          toast.success('Workspace renamed');
          void senderName.offer({ previous: previousSender, next, renamed: 'workspace' });
        },
        onError: (error) => toast.error(error, 'Unable to rename workspace'),
      },
    );
  };

  return (
    <SettingsSection
      title="Workspace"
      description="Customers see this name on your follow-ups."
      footer={
        isAdmin ? (
          <Button
            variant="primary"
            onClick={saveName}
            loading={update.isPending}
            disabled={!name.trim() || name.trim() === workspace.name}>
            Save
          </Button>
        ) : null
      }>
      <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} readOnly={!isAdmin} maxLength={80} />
      <p className={styles.muted}>Time zone: {workspace.timezone}. Follow-ups and notifications use it.</p>
    </SettingsSection>
  );
}
