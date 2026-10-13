'use client';

import { useState } from 'react';

import type { Profile } from '@/lib/models';
import { Button } from '@/ui/Button';
import { ErrorState, SkeletonRows } from '@/ui/Display';
import { TextField } from '@/ui/Field';
import { useToast } from '@/ui/Toast';

import { useAuth } from '../../auth/AuthProvider';
import { useProfile, useUpdateProfile } from '../../workspace/hooks';
import { useSenderNameOffer } from '../useSenderNameOffer';
import { SettingsSection } from '../SettingsShell';

export function ProfilePage() {
  const profile = useProfile();
  if (profile.isError) {
    return <ErrorState title="Unable to load your profile" error={profile.error} onRetry={() => void profile.refetch()} />;
  }
  if (!profile.data) return <SkeletonRows rows={2} />;
  // A saved name remounts the form, so it always starts from what is stored.
  return <ProfileForm key={profile.data.updated_at} profile={profile.data} />;
}

function ProfileForm({ profile }: { profile: Profile }) {
  const toast = useToast();
  const { user } = useAuth();
  const update = useUpdateProfile();
  const senderName = useSenderNameOffer();
  const [name, setName] = useState(profile.display_name);

  const save = () => {
    const next = name.trim();
    if (!next) return;
    // Only offer when follow-ups were signed with the old personal name.
    const previousSender = senderName.storedSenderName();
    const signedWithOwnName = previousSender && previousSender === profile.display_name.trim();
    update.mutate(
      { display_name: next },
      {
        onSuccess: () => {
          toast.success('Profile saved');
          if (signedWithOwnName) void senderName.offer({ previous: previousSender, next, renamed: 'profile' });
        },
        onError: (error) => toast.error(error, 'Unable to save profile'),
      },
    );
  };

  return (
    <SettingsSection
      title="Profile"
      description="Your name is shown to teammates."
      footer={
        <Button variant="primary" onClick={save} loading={update.isPending} disabled={!name.trim() || name.trim() === profile.display_name}>
          Save
        </Button>
      }>
      <TextField label="Your name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
      <TextField label="Email" value={user.email ?? ''} readOnly hint="Change your email in the iPhone app." />
    </SettingsSection>
  );
}
