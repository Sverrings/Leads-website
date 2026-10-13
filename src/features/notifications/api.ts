// Shared with the iPhone app: Leads/src/features/notifications/api.ts (with the web's Supabase client). Change both together.
import { assertOk, unwrap } from '@/lib/errors';
import { db } from '@/lib/db';
import type { Notification } from '@/lib/models';

export async function fetchNotifications(
  workspaceId: string,
  userId: string,
): Promise<Notification[]> {
  const result = await db()
    .from('notifications')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return unwrap(result, { title: 'Unable to load notifications' });
}

export async function markAllNotificationsRead(workspaceId: string, userId: string): Promise<void> {
  const result = await db()
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .is('read_at', null);
  assertOk(result, { title: 'Unable to update notifications' });
}
