// Shared with the iPhone app: Leads/src/features/timeline/api.ts (with the web's Supabase client). Change both together.
import { unwrap } from '@/lib/errors';
import { db } from '@/lib/db';
import type { LeadEvent, LeadEventType } from '@/lib/models';

export type TimelineEvent = LeadEvent & {
  actor: { display_name: string } | null;
};

export type ActivityEvent = TimelineEvent & {
  lead: { id: string; name: string; company: string | null } | null;
};

/** Event types worth showing in the workspace-wide feed. Scheduling noise stays on the lead. */
export const ACTIVITY_EVENT_TYPES: LeadEventType[] = [
  'lead_created',
  'status_changed',
  'follow_up_sent',
  'follow_up_ready',
  'follow_up_failed',
  'contact_logged',
  'note_added',
  'message_received',
];

export const ACTIVITY_PAGE_SIZE = 40;

export async function fetchLeadTimeline(leadId: string): Promise<TimelineEvent[]> {
  const result = await db()
    .from('lead_events')
    .select('*, actor:profiles(display_name)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(200);
  return unwrap(result, { title: 'Unable to load timeline' });
}

/** Cursor pagination on created_at keeps pages stable while new events arrive. */
export async function fetchActivity(
  workspaceId: string,
  before?: string,
): Promise<ActivityEvent[]> {
  let query = db()
    .from('lead_events')
    .select('*, actor:profiles(display_name), lead:leads(id, name, company)')
    .eq('workspace_id', workspaceId)
    .in('type', ACTIVITY_EVENT_TYPES)
    .order('created_at', { ascending: false })
    .limit(ACTIVITY_PAGE_SIZE);
  if (before) query = query.lt('created_at', before);
  return unwrap(await query, { title: 'Unable to load activity' });
}
