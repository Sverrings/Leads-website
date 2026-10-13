// Shared with the iPhone app: Leads/src/features/leads/api.ts (with the web's Supabase client). Change both together.
import { AppError, assertOk, unwrap, unwrapMaybe } from '@/lib/errors';
import { db } from '@/lib/db';
import type { Lead, LeadWithFollowUp, OpenFollowUp } from '@/lib/models';

import type { LeadInput } from './schemas';

/**
 * Leads are always loaded together with their open follow-up (at most one per
 * lead, enforced by a unique index) so every screen can compute next actions
 * without a second request.
 */
const LEAD_SELECT =
  '*, follow_ups:scheduled_follow_ups(id, status, step_id, step_position, scheduled_for, ready_reason, draft_subject, draft_body, last_error)';
const OPEN_STATUSES = ['pending', 'processing', 'ready'] as const;

/**
 * MVP scale: a small business has hundreds of leads, not millions. Loading the
 * workspace's leads once makes search and filtering instant and offline-friendly.
 * Move filtering server-side (range + ilike) if a workspace outgrows this.
 */
export const LEAD_LIST_LIMIT = 1000;

type LeadRow = Lead & { follow_ups: OpenFollowUp[] };

function toLeadWithFollowUp({ follow_ups, ...lead }: LeadRow): LeadWithFollowUp {
  return { ...lead, followUp: follow_ups[0] ?? null };
}

export async function fetchLeads(workspaceId: string): Promise<LeadWithFollowUp[]> {
  const result = await db()
    .from('leads')
    .select(LEAD_SELECT)
    .eq('workspace_id', workspaceId)
    .in('follow_ups.status', [...OPEN_STATUSES])
    .order('updated_at', { ascending: false })
    .limit(LEAD_LIST_LIMIT);
  return unwrap(result, { title: 'Unable to load leads' }).map(toLeadWithFollowUp);
}

export async function fetchLead(leadId: string): Promise<LeadWithFollowUp> {
  const result = await db()
    .from('leads')
    .select(LEAD_SELECT)
    .eq('id', leadId)
    .in('follow_ups.status', [...OPEN_STATUSES])
    .maybeSingle();
  const row = unwrapMaybe(result, { title: 'Unable to load lead' });
  if (!row) {
    throw new AppError({
      kind: 'not_found',
      title: 'Lead not found',
      description: 'It may have been deleted by someone on your team.',
    });
  }
  return toLeadWithFollowUp(row);
}

/*
 * Writes return only the id and then re-read the lead: follow-ups are scheduled
 * by AFTER triggers, which a statement's own RETURNING clause cannot observe.
 */
export async function createLead(
  workspaceId: string,
  input: LeadInput & { next_follow_up_at: string | null },
): Promise<LeadWithFollowUp> {
  const result = await db()
    .from('leads')
    .insert({ workspace_id: workspaceId, ...input })
    .select('id')
    .single();
  const { id } = unwrap(result, {
    title: 'Unable to save lead',
    description: 'The lead was not saved. Try again.',
  });
  return fetchLead(id);
}

export async function updateLead(
  leadId: string,
  patch: Partial<LeadInput>,
): Promise<LeadWithFollowUp> {
  const result = await db().from('leads').update(patch).eq('id', leadId).select('id').single();
  assertOk(result, { title: 'Unable to save lead', description: 'Your changes were not saved.' });
  return fetchLead(leadId);
}

export async function deleteLead(leadId: string): Promise<void> {
  const result = await db().from('leads').delete().eq('id', leadId);
  assertOk(result, {
    title: 'Unable to delete lead',
    description: 'The lead was not deleted. Try again.',
  });
}
