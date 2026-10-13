// Shared with the iPhone app: Leads/src/features/onboarding/api.ts (with the web's Supabase client). Change both together.
import { createLead } from '@/features/leads/api';
import { fetchDefaultSequence, updateStep } from '@/features/sequences/api';
import { createWorkspace } from '@/features/workspace/api';

import type { Workspace } from '@/lib/models';

import { getRhythm, type RhythmId } from './rhythms';

export type FirstLead = { name: string; email: string | null; inquiry: string | null };

export type SetupInput = {
  businessName: string;
  rhythm: RhythmId;
  firstLead: FirstLead | null;
};

/**
 * Creates the workspace and applies the choices from setup, in that order, so
 * the first lead is scheduled with the chosen rhythm. Only the workspace is
 * essential: if a later step fails, the person still gets in and can adjust
 * it in Settings.
 */
export async function completeSetup(input: SetupInput): Promise<{
  workspace: Workspace;
  leadAdded: boolean;
}> {
  const workspace = await createWorkspace(input.businessName);

  try {
    const delays = getRhythm(input.rhythm).delays;
    const sequence = await fetchDefaultSequence(workspace.id);
    const steps = [...(sequence?.steps ?? [])].sort((a, b) => a.position - b.position);
    await Promise.all(
      steps.map((step, index) => {
        const delay = delays[index];
        return delay !== undefined && delay !== step.delay_minutes
          ? updateStep(step.id, { delay_minutes: delay })
          : null;
      }),
    );
  } catch (error) {
    console.warn('Setup: could not apply follow-up rhythm', { error });
  }

  let leadAdded = false;
  if (input.firstLead) {
    try {
      await createLead(workspace.id, {
        name: input.firstLead.name,
        email: input.firstLead.email,
        phone: null,
        company: null,
        inquiry: input.firstLead.inquiry,
        source: null,
        status: 'new',
        next_follow_up_at: null,
      });
      leadAdded = true;
    } catch (error) {
      console.warn('Setup: could not add first lead', { error });
    }
  }

  return { workspace, leadAdded };
}
