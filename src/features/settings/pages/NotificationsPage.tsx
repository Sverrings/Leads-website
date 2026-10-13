'use client';

import { ErrorState, SkeletonRows } from '@/ui/Display';
import { Switch } from '@/ui/Field';
import { useToast } from '@/ui/Toast';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '../../workspace/hooks';
import { SettingsRow, SettingsSection } from '../SettingsShell';
import styles from '../settings.module.css';

/** The same switches as the app. Failed and sent notices only exist once Leads sends email itself. */
export function NotificationsPage() {
  const toast = useToast();
  const preferences = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  if (preferences.isError) {
    return (
      <ErrorState
        title="Unable to load notification settings"
        error={preferences.error}
        onRetry={() => void preferences.refetch()}
      />
    );
  }

  return (
    <>
      <SettingsSection title="Notifications" description="Shown under Notifications here and under the bell in the app. Applies to this workspace.">
        {preferences.data ? (
          <SettingsRow
            title="Follow-up ready"
            description="A draft is waiting for your review, or a reminder is due."
            control={
              <Switch
                checked={preferences.data.follow_up_ready ?? true}
                label="Follow-up ready"
                onChange={(value) =>
                  update.mutate(
                    { ...preferences.data, follow_up_ready: value },
                    { onError: (error) => toast.error(error, 'Unable to save notification settings') },
                  )
                }
              />
            }
          />
        ) : (
          <SkeletonRows rows={1} />
        )}
      </SettingsSection>
      <SettingsSection title="On your phone">
        <p className={styles.muted}>
          Push notifications to the iPhone app are coming soon. They will arrive between 07:00 and 21:00 your
          time, and never show what your messages say.
        </p>
      </SettingsSection>
    </>
  );
}
