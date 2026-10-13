'use client';

import { useConfirm } from '@/ui/Dialog';
import { useToast } from '@/ui/Toast';

import { useProfile, useUpdateWorkspaceSettings, useWorkspaceSettings } from '../workspace/hooks';
import { useCurrentWorkspace } from '../workspace/WorkspaceProvider';

/**
 * Follow-ups are signed with the sender name (Settings → Sending), kept apart
 * from the workspace and profile names. After a rename this asks whether the
 * sender name should change too. Web version of the app's useSenderNameOffer.
 */
export function useSenderNameOffer() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useCurrentWorkspace();
  const settings = useWorkspaceSettings();
  const profile = useProfile();
  const update = useUpdateWorkspaceSettings();

  const currentSenderName = (): string =>
    settings.data?.sender_name?.trim() || profile.data?.display_name?.trim() || '';

  const storedSenderName = (): string => settings.data?.sender_name?.trim() || '';

  const offer = async ({
    previous,
    next,
    renamed,
  }: {
    previous: string;
    next: string;
    renamed: 'workspace' | 'profile';
  }) => {
    if (!isAdmin || !previous || previous === next) return;
    const ok = await confirm({
      title: `Sign follow-ups as “${next}”?`,
      message: `Your follow-ups are signed “${previous}”. That name is kept separately, under Settings → Sending, so changing your ${
        renamed === 'workspace' ? 'workspace' : 'own'
      } name didn't change it.`,
      confirmLabel: `Use “${next}”`,
      cancelLabel: `Keep “${previous}”`,
    });
    if (!ok) return;
    update.mutate(
      { sender_name: next },
      {
        onSuccess: () => toast.success(`Follow-ups are now signed “${next}”`),
        onError: (error) => toast.error(error, 'Unable to change the sender name'),
      },
    );
  };

  return { currentSenderName, storedSenderName, offer };
}
