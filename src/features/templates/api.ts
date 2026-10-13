// Shared with the iPhone app: Leads/src/features/templates/api.ts (with the web's Supabase client). Change both together.
import { assertOk, unwrap } from '@/lib/errors';
import { db } from '@/lib/db';
import type { MessageTemplate } from '@/lib/models';

export type TemplateInput = Pick<MessageTemplate, 'name' | 'subject' | 'body'>;

export async function fetchTemplates(workspaceId: string): Promise<MessageTemplate[]> {
  const result = await db()
    .from('message_templates')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });
  return unwrap(result, { title: 'Unable to load templates' });
}

export async function createTemplate(
  workspaceId: string,
  input: TemplateInput,
): Promise<MessageTemplate> {
  const result = await db()
    .from('message_templates')
    .insert({ workspace_id: workspaceId, channel: 'email', ...input })
    .select('*')
    .single();
  return unwrap(result, {
    title: 'Unable to save template',
    description: 'The template was not saved.',
  });
}

export async function updateTemplate(
  templateId: string,
  input: TemplateInput,
): Promise<MessageTemplate> {
  const result = await db()
    .from('message_templates')
    .update(input)
    .eq('id', templateId)
    .select('*')
    .single();
  return unwrap(result, {
    title: 'Unable to save template',
    description: 'Your changes were not saved.',
  });
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const result = await db().from('message_templates').delete().eq('id', templateId);
  assertOk(result, { title: 'Unable to delete template' });
}
