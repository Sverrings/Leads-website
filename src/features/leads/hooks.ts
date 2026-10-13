// Shared with the iPhone app: Leads/src/features/leads/hooks.ts. Change both together.
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useNow } from '@/lib/useNow';
import { queryKeys } from '@/lib/query-keys';
import type { LeadStatus, LeadWithFollowUp } from '@/lib/models';

import { useWorkspaceSettings } from '../workspace/hooks';
import { useCurrentWorkspace } from '../workspace/WorkspaceProvider';
import { createLead, deleteLead, fetchLead, fetchLeads, updateLead } from './api';
import { enrichLeads, type EnrichedLead } from './domain/collection';
import { getLeadInsight, type InsightContext } from './domain/insight';
import type { LeadInput } from './schemas';

// -----------------------------------------------------------------------------
// Cache helpers: one lead lives in two caches (list + detail). Keep them in sync.
// -----------------------------------------------------------------------------

export function writeLeadToCaches(
  queryClient: QueryClient,
  workspaceId: string,
  lead: LeadWithFollowUp,
) {
  queryClient.setQueryData(queryKeys.lead(workspaceId, lead.id), lead);
  queryClient.setQueryData<LeadWithFollowUp[]>(queryKeys.leads(workspaceId), (current) => {
    if (!current) return current;
    const exists = current.some((item) => item.id === lead.id);
    return exists ? current.map((item) => (item.id === lead.id ? lead : item)) : [lead, ...current];
  });
}

function patchLeadInCaches(
  queryClient: QueryClient,
  workspaceId: string,
  leadId: string,
  patch: Partial<LeadWithFollowUp>,
) {
  queryClient.setQueryData<LeadWithFollowUp>(queryKeys.lead(workspaceId, leadId), (current) =>
    current ? { ...current, ...patch } : current,
  );
  queryClient.setQueryData<LeadWithFollowUp[]>(queryKeys.leads(workspaceId), (current) =>
    current?.map((item) => (item.id === leadId ? { ...item, ...patch } : item)),
  );
}

/** After any lead change: timeline, activity and notifications may have new rows. */
export function invalidateLeadSideEffects(
  queryClient: QueryClient,
  workspaceId: string,
  leadId: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.leadTimeline(workspaceId, leadId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(workspaceId) });
}

// -----------------------------------------------------------------------------
// Queries
// -----------------------------------------------------------------------------

export function useLeads() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.leads(workspace.id),
    queryFn: () => fetchLeads(workspace.id),
  });
}

/** Shared clock + workspace context for computing lead insights. */
export function useInsightContext(): InsightContext {
  const now = useNow();
  const settings = useWorkspaceSettings();
  const autoSendEnabled = settings.data?.auto_send_enabled ?? false;
  return useMemo(() => ({ now, autoSendEnabled }), [now, autoSendEnabled]);
}

/** Leads with their computed stage and next action. */
export function useEnrichedLeads() {
  const query = useLeads();
  const context = useInsightContext();
  const leads = useMemo<EnrichedLead[]>(
    () => (query.data ? enrichLeads(query.data, context) : []),
    [query.data, context],
  );
  return { ...query, leads };
}

export function useLead(leadId: string) {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.lead(workspace.id, leadId),
    queryFn: () => fetchLead(leadId),
    // Opening a lead from a list renders instantly from the list cache.
    initialData: () =>
      queryClient
        .getQueryData<LeadWithFollowUp[]>(queryKeys.leads(workspace.id))
        ?.find((lead) => lead.id === leadId),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(queryKeys.leads(workspace.id))?.dataUpdatedAt,
  });
}

export function useLeadInsight(lead: LeadWithFollowUp | undefined) {
  const context = useInsightContext();
  return useMemo(() => (lead ? getLeadInsight(lead, context) : null), [lead, context]);
}

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

export function useCreateLead() {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeadInput & { next_follow_up_at: string | null }) =>
      createLead(workspace.id, input),
    onSuccess: (lead) => {
      writeLeadToCaches(queryClient, workspace.id, lead);
      invalidateLeadSideEffects(queryClient, workspace.id, lead.id);
    },
  });
}

export function useUpdateLead(leadId: string) {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<LeadInput>) => updateLead(leadId, patch),
    onSuccess: (lead) => {
      writeLeadToCaches(queryClient, workspace.id, lead);
      invalidateLeadSideEffects(queryClient, workspace.id, lead.id);
    },
  });
}

/**
 * Optimistic: the badge changes the moment a status is picked. The server
 * response then brings the follow-up consequences (stopped / restarted).
 */
export function useUpdateLeadStatus(leadId: string) {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: LeadStatus) => updateLead(leadId, { status }),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.lead(workspace.id, leadId) });
      const previousLead = queryClient.getQueryData<LeadWithFollowUp>(
        queryKeys.lead(workspace.id, leadId),
      );
      const previousList = queryClient.getQueryData<LeadWithFollowUp[]>(
        queryKeys.leads(workspace.id),
      );
      patchLeadInCaches(queryClient, workspace.id, leadId, {
        status,
        status_changed_at: new Date().toISOString(),
      });
      return { previousLead, previousList };
    },
    onError: (_error, _status, context) => {
      if (context?.previousLead)
        queryClient.setQueryData(queryKeys.lead(workspace.id, leadId), context.previousLead);
      if (context?.previousList)
        queryClient.setQueryData(queryKeys.leads(workspace.id), context.previousList);
    },
    onSuccess: (lead) => writeLeadToCaches(queryClient, workspace.id, lead),
    onSettled: () => invalidateLeadSideEffects(queryClient, workspace.id, leadId),
  });
}

export function useDeleteLead(leadId: string) {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteLead(leadId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.leads(workspace.id) });
      const previousList = queryClient.getQueryData<LeadWithFollowUp[]>(
        queryKeys.leads(workspace.id),
      );
      queryClient.setQueryData<LeadWithFollowUp[]>(queryKeys.leads(workspace.id), (current) =>
        current?.filter((lead) => lead.id !== leadId),
      );
      return { previousList };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousList)
        queryClient.setQueryData(queryKeys.leads(workspace.id), context.previousList);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.lead(workspace.id, leadId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspace.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(workspace.id) });
    },
  });
}

/** Re-reads one lead (after follow-up actions changed it server-side). */
export function useRefreshLead() {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return async (leadId: string) => {
    const lead = await fetchLead(leadId);
    writeLeadToCaches(queryClient, workspace.id, lead);
    invalidateLeadSideEffects(queryClient, workspace.id, leadId);
    return lead;
  };
}
