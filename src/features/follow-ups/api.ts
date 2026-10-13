// Shared with the iPhone app: Leads/src/features/follow-ups/api.ts (with the web's Supabase client). Change both together.
import { z } from 'zod';

import { assertOk } from '@/lib/errors';
import { invokeFunction } from '@/lib/functions';
import { db } from '@/lib/db';

export type ContactChannel = 'call' | 'email' | 'sms' | 'meeting' | 'other';
export type DraftTone = 'friendly' | 'professional' | 'concise';
export type DraftMode = 'template' | 'ai';

export async function scheduleFollowUp(leadId: string, at: Date): Promise<void> {
  const result = await db().rpc('schedule_follow_up', {
    p_lead_id: leadId,
    p_scheduled_for: at.toISOString(),
  });
  assertOk(result, {
    title: 'Unable to schedule follow-up',
    description: 'The follow-up was not scheduled.',
  });
}

export async function skipFollowUp(leadId: string): Promise<void> {
  const result = await db().rpc('skip_follow_up', { p_lead_id: leadId });
  assertOk(result, { title: 'Unable to skip follow-up' });
}

export async function setFollowUpsPaused(leadId: string, paused: boolean): Promise<void> {
  const result = await db().rpc('set_follow_ups_paused', {
    p_lead_id: leadId,
    p_paused: paused,
  });
  assertOk(result, {
    title: paused ? 'Unable to pause follow-ups' : 'Unable to resume follow-ups',
  });
}

export async function logContact(
  leadId: string,
  channel: ContactChannel,
  note: string,
): Promise<void> {
  const result = await db().rpc('log_contact', {
    p_lead_id: leadId,
    p_channel: channel,
    p_note: note.trim().length > 0 ? note.trim() : undefined,
  });
  assertOk(result, {
    title: 'Unable to log contact',
    description: 'Nothing was saved. Try again.',
  });
}

export async function addNote(leadId: string, body: string): Promise<void> {
  const result = await db().rpc('add_lead_note', { p_lead_id: leadId, p_body: body });
  assertOk(result, { title: 'Unable to save note', description: 'Your note was not saved.' });
}

// -----------------------------------------------------------------------------
// Edge Functions: drafting and sending need server-side secrets.
// -----------------------------------------------------------------------------

const draftSchema = z.object({
  subject: z.string(),
  body: z.string(),
  source: z.enum(['template', 'ai']),
  provider: z.string(),
  templateName: z.string().nullable().optional(),
});

export type Draft = z.infer<typeof draftSchema>;

export function draftFollowUp(params: {
  leadId: string;
  mode: DraftMode;
  tone?: DraftTone;
}): Promise<Draft> {
  return invokeFunction(
    'draft-follow-up',
    { lead_id: params.leadId, mode: params.mode, tone: params.tone },
    draftSchema,
    { title: 'Unable to prepare a draft', description: 'Write the message yourself or try again.' },
  );
}
