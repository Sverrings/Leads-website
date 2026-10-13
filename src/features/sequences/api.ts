// Shared with the iPhone app: Leads/src/features/sequences/api.ts (with the web's Supabase client). Change both together.
import { assertOk, unwrap, unwrapMaybe } from '@/lib/errors';
import { db } from '@/lib/db';
import type { FollowUpSequence, FollowUpStep, MessageTemplate } from '@/lib/models';

export type StepWithTemplate = FollowUpStep & {
  template: Pick<MessageTemplate, 'id' | 'name' | 'subject'> | null;
};

export type SequenceWithSteps = FollowUpSequence & { steps: StepWithTemplate[] };

/** The workspace's default sequence ("follow-up rules"). */
export async function fetchDefaultSequence(workspaceId: string): Promise<SequenceWithSteps | null> {
  const result = await db()
    .from('follow_up_sequences')
    .select('*, steps:follow_up_steps(*, template:message_templates(id, name, subject))')
    .eq('workspace_id', workspaceId)
    .eq('is_default', true)
    .order('position', { referencedTable: 'follow_up_steps', ascending: true })
    .maybeSingle();
  return unwrapMaybe(result, { title: 'Unable to load follow-up rules' });
}

export async function updateSequence(
  sequenceId: string,
  patch: Partial<Pick<FollowUpSequence, 'enabled' | 'name'>>,
): Promise<void> {
  const result = await db().from('follow_up_sequences').update(patch).eq('id', sequenceId);
  assertOk(result, {
    title: 'Unable to save follow-up rules',
    description: 'Your changes were not saved.',
  });
}

export async function createStep(input: {
  workspaceId: string;
  sequenceId: string;
  position: number;
  delayMinutes: number;
  templateId: string | null;
}): Promise<FollowUpStep> {
  const result = await db()
    .from('follow_up_steps')
    .insert({
      workspace_id: input.workspaceId,
      sequence_id: input.sequenceId,
      position: input.position,
      delay_minutes: input.delayMinutes,
      template_id: input.templateId,
    })
    .select('*')
    .single();
  return unwrap(result, { title: 'Unable to add step' });
}

export async function updateStep(
  stepId: string,
  patch: Partial<Pick<FollowUpStep, 'delay_minutes' | 'template_id'>>,
): Promise<void> {
  const result = await db().from('follow_up_steps').update(patch).eq('id', stepId);
  assertOk(result, { title: 'Unable to save step', description: 'Your changes were not saved.' });
}

export async function deleteStep(stepId: string): Promise<void> {
  const result = await db().from('follow_up_steps').delete().eq('id', stepId);
  assertOk(result, { title: 'Unable to remove step' });
}
