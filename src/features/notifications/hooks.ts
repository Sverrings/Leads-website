// Shared with the iPhone app: Leads/src/features/notifications/hooks.ts. Change both together.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import type { Notification } from '@/lib/models';

import { useUser } from '../auth/AuthProvider';
import { useCurrentWorkspace } from '../workspace/WorkspaceProvider';
import { fetchNotifications, markAllNotificationsRead } from './api';

export function useNotifications() {
  const user = useUser();
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.notifications(workspace.id),
    queryFn: () => fetchNotifications(workspace.id, user.id),
    // The backend worker creates notifications; check periodically while open.
    refetchInterval: 60_000,
  });
}

export function useUnreadNotificationCount(): number {
  const { data } = useNotifications();
  return data?.filter((notification) => !notification.read_at).length ?? 0;
}

export function useMarkAllNotificationsRead() {
  const user = useUser();
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const key = queryKeys.notifications(workspace.id);
  return useMutation({
    mutationFn: () => markAllNotificationsRead(workspace.id, user.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Notification[]>(key);
      const readAt = new Date().toISOString();
      queryClient.setQueryData<Notification[]>(key, (current) =>
        current?.map((notification) => ({
          ...notification,
          read_at: notification.read_at ?? readAt,
        })),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
}
