import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@/lib/query-keys';

import { useLeads } from '../leads/hooks';
import { useCurrentWorkspace } from '../workspace/WorkspaceProvider';
import { fetchBillingStatus } from './api';
import { planIdForProduct, type BillingStatus, type PlanId } from './plans';

export function useBillingStatus() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.billing(workspace.id),
    queryFn: () => fetchBillingStatus(workspace.id),
    staleTime: 5 * 60_000,
  });
}

export type Plan = {
  enabled: boolean;
  pro: boolean;
  status: BillingStatus['status'];
  planId: PlanId | null;
  expiresAt: string | null;
  willRenew: boolean;
  canManage: boolean;
  activeLeads: number;
  freeLimit: number;
  atLimit: boolean;
  loaded: boolean;
};

const ACTIVE = new Set(['new', 'waiting', 'replied']);

/** Same rules as the app's usePlan (Leads/src/features/billing/hooks.ts), without the App Store. */
export function usePlan(): Plan {
  const billing = useBillingStatus();
  const leads = useLeads();
  return useMemo(() => {
    const data = billing.data;
    const activeLeads = leads.data
      ? leads.data.filter((lead) => ACTIVE.has(lead.status)).length
      : (data?.active_leads ?? 0);
    const freeLimit = data?.free_active_leads ?? 3;
    const enabled = data?.enabled ?? false;
    const pro = data?.pro ?? false;
    return {
      enabled,
      pro,
      status: data?.status ?? 'none',
      planId: planIdForProduct(data?.product_id),
      expiresAt: data?.expires_at ?? null,
      willRenew: data?.will_renew ?? false,
      canManage: data?.can_manage ?? false,
      activeLeads,
      freeLimit,
      atLimit: enabled && !pro && activeLeads >= freeLimit,
      loaded: Boolean(data),
    };
  }, [billing.data, leads.data]);
}
