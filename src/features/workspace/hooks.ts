// Shared with the iPhone app: Leads/src/features/workspace/hooks.ts. Change both together.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import type { MembershipWithWorkspace, Profile, WorkspaceSettings } from '@/lib/models';

import { useUser } from '../auth/AuthProvider';
import {
  createWorkspace,
  fetchNotificationPreferences,
  fetchProfile,
  fetchWorkspaceMembers,
  fetchWorkspaceSettings,
  joinWorkspace,
  regenerateInviteCode,
  updateNotificationPreferences,
  updateProfile,
  updateWorkspace,
  updateWorkspaceSettings,
  type NotificationPreferences,
  type WorkspaceSettingsPatch,
} from './api';
import { useCurrentWorkspace, useWorkspaceContext } from './WorkspaceProvider';

/** Create or join, then switch to the workspace immediately. */
export function useEnterWorkspace(role: MembershipWithWorkspace['role']) {
  const user = useUser();
  const queryClient = useQueryClient();
  const { switchWorkspace } = useWorkspaceContext();

  return (workspace: MembershipWithWorkspace['workspace']) => {
    queryClient.setQueryData<MembershipWithWorkspace[]>(
      queryKeys.memberships(user.id),
      (current = []) =>
        current.some((m) => m.workspace_id === workspace.id)
          ? current
          : [...current, { role, workspace_id: workspace.id, workspace }],
    );
    switchWorkspace(workspace.id);
    void queryClient.invalidateQueries({ queryKey: queryKeys.memberships(user.id) });
  };
}

export function useCreateWorkspace() {
  const enter = useEnterWorkspace('owner');
  return useMutation({ mutationFn: createWorkspace, onSuccess: enter });
}

export function useJoinWorkspace() {
  const enter = useEnterWorkspace('member');
  return useMutation({ mutationFn: joinWorkspace, onSuccess: enter });
}

export function useUpdateWorkspace() {
  const user = useUser();
  const queryClient = useQueryClient();
  const { workspace } = useCurrentWorkspace();
  return useMutation({
    mutationFn: (patch: { name: string }) => updateWorkspace(workspace.id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.memberships(user.id) }),
  });
}

export function useRegenerateInviteCode() {
  const user = useUser();
  const queryClient = useQueryClient();
  const { workspace } = useCurrentWorkspace();
  return useMutation({
    mutationFn: () => regenerateInviteCode(workspace.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.memberships(user.id) }),
  });
}

export function useWorkspaceSettings() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.workspaceSettings(workspace.id),
    queryFn: () => fetchWorkspaceSettings(workspace.id),
  });
}

/** Optimistic: toggles flip instantly and roll back if the save fails. */
export function useUpdateWorkspaceSettings() {
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const key = queryKeys.workspaceSettings(workspace.id);

  return useMutation({
    mutationFn: (patch: WorkspaceSettingsPatch) => updateWorkspaceSettings(workspace.id, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WorkspaceSettings>(key);
      if (previous) queryClient.setQueryData<WorkspaceSettings>(key, { ...previous, ...patch });
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useWorkspaceMembers() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.workspaceMembers(workspace.id),
    queryFn: () => fetchWorkspaceMembers(workspace.id),
  });
}

export function useProfile() {
  const user = useUser();
  return useQuery({ queryKey: queryKeys.profile(user.id), queryFn: () => fetchProfile(user.id) });
}

export function useUpdateProfile() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: { display_name: string }) => updateProfile(user.id, patch),
    onSuccess: (profile) => queryClient.setQueryData<Profile>(queryKeys.profile(user.id), profile),
  });
}

export function useNotificationPreferences() {
  const user = useUser();
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: queryKeys.notificationPreferences(workspace.id, user.id),
    queryFn: () => fetchNotificationPreferences(workspace.id, user.id),
  });
}

/** Optimistic toggle with rollback. */
export function useUpdateNotificationPreferences() {
  const user = useUser();
  const { workspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const key = queryKeys.notificationPreferences(workspace.id, user.id);
  return useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      updateNotificationPreferences(workspace.id, user.id, preferences),
    onMutate: async (preferences) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationPreferences>(key);
      queryClient.setQueryData(key, preferences);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
}
