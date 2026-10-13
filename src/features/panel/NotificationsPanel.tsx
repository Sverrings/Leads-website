'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { formatRelative } from '@/lib/dates';
import type { Notification, NotificationType } from '@/lib/models';
import { useNow } from '@/lib/useNow';
import { Button } from '@/ui/Button';
import { EmptyState, ErrorState, SkeletonRows } from '@/ui/Display';
import { Icon, type IconName } from '@/ui/Icon';

import { useMarkAllNotificationsRead, useNotifications } from '../notifications/hooks';
import styles from './panel.module.css';

const TYPE_ICON: Record<NotificationType, { icon: IconName; tone: string }> = {
  follow_up_ready: { icon: 'edit-3', tone: 'var(--accent-strong)' },
  follow_up_failed: { icon: 'alert-triangle', tone: 'var(--danger)' },
  follow_up_sent: { icon: 'send', tone: 'var(--text-2)' },
  lead_replied: { icon: 'corner-up-left', tone: 'var(--accent-strong)' },
  system: { icon: 'info', tone: 'var(--text-2)' },
};

/** Where a notification leads: its lead, or the plan for Leads Pro notices. */
function target(notification: Notification): string | null {
  if (notification.lead_id) return `/app/leads/${notification.lead_id}`;
  if (notification.link === '/settings/plan') return '/app/settings/plan';
  return null;
}

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const now = useNow();
  const notifications = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const hasUnread = notifications.data?.some((item) => !item.read_at) ?? false;

  // Opening the list counts as reading it, like in the app.
  useEffect(() => {
    if (!open || !hasUnread) return;
    const id = window.setTimeout(() => markAllRead.mutate(), 1500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasUnread]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button type="button" className={styles.drawerScrim} aria-label="Close notifications" onClick={onClose} />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Notifications">
        <header className={styles.drawerHead}>
          <h2>Notifications</h2>
          <Button variant="ghost" size="sm" icon="x" aria-label="Close" onClick={onClose} />
        </header>
        <div className={styles.drawerBody}>
          {notifications.isPending ? (
            <div style={{ padding: 20 }}>
              <SkeletonRows rows={4} />
            </div>
          ) : notifications.isError ? (
            <ErrorState
              title="Unable to load notifications"
              error={notifications.error}
              onRetry={() => void notifications.refetch()}
            />
          ) : notifications.data.length === 0 ? (
            <EmptyState icon="bell" title="You're up to date" description="We'll let you know when a follow-up needs you." />
          ) : (
            <ul className={styles.notificationList}>
              {notifications.data.map((item) => {
                const meta = TYPE_ICON[item.type];
                const href = target(item);
                const content = (
                  <>
                    <span className={styles.notificationIcon} style={{ color: meta.tone }}>
                      <Icon name={meta.icon} size={14} />
                    </span>
                    <span className={styles.notificationText}>
                      <span className={item.read_at ? styles.notificationTitle : styles.notificationTitleUnread}>
                        {item.title}
                      </span>
                      {item.body ? <span className={styles.notificationBody}>{item.body}</span> : null}
                    </span>
                    <span className={styles.notificationMeta}>
                      {formatRelative(item.created_at, now)}
                      {!item.read_at ? <span className={styles.unreadDot} aria-label="Unread" /> : null}
                    </span>
                  </>
                );
                return (
                  <li key={item.id}>
                    {href ? (
                      <button
                        type="button"
                        className={styles.notification}
                        onClick={() => {
                          onClose();
                          router.push(href);
                        }}>
                        {content}
                      </button>
                    ) : (
                      <div className={styles.notification}>{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
