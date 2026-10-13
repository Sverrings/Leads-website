// Shared with the iPhone app: Leads/src/features/follow-ups/hooks.ts. Change both together.
import { useMutation } from '@tanstack/react-query';

import { useRefreshLead } from '../leads/hooks';
import {
  addNote,
  draftFollowUp,
  logContact,
  scheduleFollowUp,
  setFollowUpsPaused,
  skipFollowUp,
  type ContactChannel,
  type DraftMode,
  type DraftTone,
} from './api';

/**
 * Every follow-up action changes server-side state (queue, status, timeline),
 * so each one refreshes the lead afterwards instead of guessing the result.
 */
function useLeadAction<TVariables>(
  leadId: string,
  action: (variables: TVariables) => Promise<unknown>,
) {
  const refreshLead = useRefreshLead();
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      await action(variables);
      return refreshLead(leadId);
    },
  });
}

export function useScheduleFollowUp(leadId: string) {
  return useLeadAction(leadId, (at: Date) => scheduleFollowUp(leadId, at));
}

export function useSkipFollowUp(leadId: string) {
  return useLeadAction(leadId, () => skipFollowUp(leadId));
}

export function useSetFollowUpsPaused(leadId: string) {
  return useLeadAction(leadId, (paused: boolean) => setFollowUpsPaused(leadId, paused));
}

export function useLogContact(leadId: string) {
  return useLeadAction(leadId, ({ channel, note }: { channel: ContactChannel; note: string }) =>
    logContact(leadId, channel, note),
  );
}

export function useAddNote(leadId: string) {
  return useLeadAction(leadId, (body: string) => addNote(leadId, body));
}

export function useDraftFollowUp(leadId: string) {
  return useMutation({
    mutationFn: ({ mode, tone }: { mode: DraftMode; tone?: DraftTone }) =>
      draftFollowUp({ leadId, mode, tone }),
  });
}
