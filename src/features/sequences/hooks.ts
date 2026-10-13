// Shared with the iPhone app: Leads/src/features/sequences/hooks.ts. Change both together.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

import { useCurrentWorkspace } from '../workspace/WorkspaceProvider';
import { createStep, deleteStep, fetchDefaultSequence, updateSequence, updateStep } from './api';
import { describeSchedule } from './delays';

export function useFollowUpSequence() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.sequence(workspace.id),
    queryFn: () => fetchDefaultSequence(workspace.id),
  });
}

/** Human description of the active rules, e.g. "After 1 day, then 3 days, then 1 week." */
export function useScheduleDescription(): string | null {
  const { data } = useFollowUpSequence();
  if (!data) return null;
  if (!data.enabled) return 'Automatic follow-ups are turned off.';
  return describeSchedule(data.steps.map((step) => step.delay_minutes));
}

function useSequenceMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sequence(workspace.id) });
      // Turning automation on/off schedules or cancels follow-ups for many leads.
      void queryClient.invalidateQueries({ queryKey: queryKeys.leads(workspace.id) });
    },
  });
}

export function useUpdateSequence() {
  return useSequenceMutation(
    (variables: { sequenceId: string; enabled?: boolean; name?: string }) => {
      const { sequenceId, ...patch } = variables;
      return updateSequence(sequenceId, patch);
    },
  );
}

export function useCreateStep() {
  const { workspace } = useCurrentWorkspace();
  return useSequenceMutation(
    (variables: {
      sequenceId: string;
      position: number;
      delayMinutes: number;
      templateId: string | null;
    }) => createStep({ workspaceId: workspace.id, ...variables }),
  );
}

export function useUpdateStep() {
  return useSequenceMutation(
    (variables: { stepId: string; delay_minutes?: number; template_id?: string | null }) => {
      const { stepId, ...patch } = variables;
      return updateStep(stepId, patch);
    },
  );
}

export function useDeleteStep() {
  return useSequenceMutation((stepId: string) => deleteStep(stepId));
}
