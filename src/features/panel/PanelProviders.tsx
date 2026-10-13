'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { AppError } from '@/lib/errors';
import { ConfirmProvider } from '@/ui/Dialog';
import { ToastProvider } from '@/ui/Toast';

import { AuthProvider, type SignedInUser } from '../auth/AuthProvider';
import { WorkspaceProvider } from '../workspace/WorkspaceProvider';
import { PanelShell } from './PanelShell';

/** Errors that will not fix themselves by retrying (same list as the app). */
const NON_RETRYABLE = new Set(['auth', 'permission', 'not_found', 'validation', 'conflict']);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (error instanceof AppError && NON_RETRYABLE.has(error.kind)) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

export function PanelProviders({
  initialUser,
  children,
}: {
  initialUser: SignedInUser;
  children: ReactNode;
}) {
  // One cache per browser session of the web app.
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>
        <WorkspaceProvider>
          <ToastProvider>
            <ConfirmProvider>
              <PanelShell>{children}</PanelShell>
            </ConfirmProvider>
          </ToastProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
