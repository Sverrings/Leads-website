'use client';

import { useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { MembershipWithWorkspace, Workspace, WorkspaceRole } from '@/lib/models';
import { queryKeys } from '@/lib/query-keys';

import { useUser } from '../auth/AuthProvider';
import { fetchMemberships } from './api';

export type WorkspaceStatus = 'loading' | 'error' | 'none' | 'ready';

type WorkspaceContextValue = {
  status: WorkspaceStatus;
  workspace: Workspace | null;
  role: WorkspaceRole | null;
  memberships: MembershipWithWorkspace[];
  error: unknown;
  retry: () => void;
  switchWorkspace: (workspaceId: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/** Same key as the app uses on the phone, kept in this browser. */
const CURRENT_WORKSPACE = 'leads.current-workspace-id';

function readStoredWorkspace(): string | null {
  try {
    return localStorage.getItem(CURRENT_WORKSPACE);
  } catch {
    return null;
  }
}

/**
 * Which workspace the web app shows. People usually belong to one; with
 * several, the choice is remembered in this browser. The web version of the
 * app's WorkspaceProvider.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { id: userId } = useUser();
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : readStoredWorkspace(),
  );

  const memberships = useQuery({
    queryKey: queryKeys.memberships(userId),
    queryFn: () => fetchMemberships(userId),
  });

  const switchWorkspace = useCallback((workspaceId: string) => {
    setSelectedId(workspaceId);
    try {
      localStorage.setItem(CURRENT_WORKSPACE, workspaceId);
    } catch {
      // Remembering is a convenience only.
    }
  }, []);

  const list = useMemo(() => memberships.data ?? [], [memberships.data]);
  const current = list.find((m) => m.workspace_id === selectedId) ?? list[0] ?? null;

  let status: WorkspaceStatus;
  if (memberships.data) status = current ? 'ready' : 'none';
  else if (memberships.isError) status = 'error';
  else status = 'loading';

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      status,
      workspace: current?.workspace ?? null,
      role: current?.role ?? null,
      memberships: list,
      error: memberships.error,
      retry: () => void memberships.refetch(),
      switchWorkspace,
    }),
    [status, current, list, memberships, switchWorkspace],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspaceContext must be used inside <WorkspaceProvider>');
  return context;
}

/** For pages inside the web app, where a workspace always exists. */
export function useCurrentWorkspace(): {
  workspace: Workspace;
  role: WorkspaceRole;
  isAdmin: boolean;
} {
  const { workspace, role } = useWorkspaceContext();
  if (!workspace || !role) throw new Error('useCurrentWorkspace called before a workspace was resolved');
  return { workspace, role, isAdmin: role === 'owner' || role === 'admin' };
}
