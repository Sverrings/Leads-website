// Shared with the iPhone app: Leads/src/features/timeline/hooks.ts. Change both together.
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

import { useCurrentWorkspace } from '../workspace/WorkspaceProvider';
import { ACTIVITY_PAGE_SIZE, fetchActivity, fetchLeadTimeline } from './api';

export function useLeadTimeline(leadId: string) {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.leadTimeline(workspace.id, leadId),
    queryFn: () => fetchLeadTimeline(leadId),
  });
}

export function useActivity() {
  const { workspace } = useCurrentWorkspace();
  return useInfiniteQuery({
    queryKey: queryKeys.activity(workspace.id),
    queryFn: ({ pageParam }) => fetchActivity(workspace.id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === ACTIVITY_PAGE_SIZE
        ? lastPage[lastPage.length - 1]?.created_at
        : undefined,
  });
}

/** A short slice of the feed for the Home screen. */
export function useRecentActivity(limit = 5) {
  const query = useActivity();
  const events = query.data?.pages[0]?.slice(0, limit) ?? [];
  return { ...query, events };
}
