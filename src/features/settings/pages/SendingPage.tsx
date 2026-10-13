'use client';

import { useState } from 'react';

import type { WorkspaceSettings } from '@/lib/models';
import { Button } from '@/ui/Button';
import { ErrorState, SkeletonRows } from '@/ui/Display';
import { TextArea, TextField } from '@/ui/Field';
import { Icon } from '@/ui/Icon';
import { useToast } from '@/ui/Toast';

import { useUpdateWorkspaceSettings, useWorkspaceSettings } from '../../workspace/hooks';
import { useCurrentWorkspace } from '../../workspace/WorkspaceProvider';
import { SettingsSection } from '../SettingsShell';
import styles from '../settings.module.css';

/** The name and signature follow-ups are written with (Settings → Sending in the app). */
export function SendingPage() {
  const settings = useWorkspaceSettings();
  if (settings.isError) {
    return <ErrorState title="Unable to load email settings" error={settings.error} onRetry={() => void settings.refetch()} />;
  }
  if (!settings.data) return <SkeletonRows rows={3} />;
  return <SendingForm key={settings.data.updated_at} settings={settings.data} />;
}

function SendingForm({ settings }: { settings: WorkspaceSettings }) {
  const toast = useToast();
  const { isAdmin } = useCurrentWorkspace();
  const update = useUpdateWorkspaceSettings();
  const [senderName, setSenderName] = useState(settings.sender_name ?? '');
  const [signature, setSignature] = useState(settings.email_signature ?? '');

  const dirty = senderName.trim() !== (settings.sender_name ?? '') || signature.trim() !== (settings.email_signature ?? '');

  const save = () =>
    update.mutate(
      { sender_name: senderName.trim() || null, email_signature: signature.trim() || null },
      {
        onSuccess: () => toast.success('Email settings saved'),
        onError: (error) => toast.error(error, 'Unable to save settings'),
      },
    );

  return (
    <SettingsSection
      title="Sending"
      footer={
        isAdmin ? (
          <Button variant="primary" onClick={save} disabled={!dirty} loading={update.isPending}>
            Save
          </Button>
        ) : (
          <span className={styles.muted}>Only owners and admins can change email settings.</span>
        )
      }>
      <div className={styles.notice}>
        <Icon name="mail" size={15} />
        <span>
          Follow-ups open in your own email app with the message written, so they come from your address and replies
          land in your inbox. Sending straight from Leads is coming soon.
        </span>
      </div>
      <TextField
        label="Sender name"
        placeholder="Alex Morgan"
        value={senderName}
        onChange={(event) => setSenderName(event.target.value)}
        readOnly={!isAdmin}
        maxLength={80}
        hint="Used for {{sender_name}} in your templates."
      />
      <TextArea
        label="Signature"
        optional
        rows={3}
        placeholder={'Alex Morgan\nMorgan Renovation · +47 412 34 567'}
        value={signature}
        onChange={(event) => setSignature(event.target.value)}
        readOnly={!isAdmin}
        maxLength={1000}
        hint="Added below every follow-up."
      />
    </SettingsSection>
  );
}
