'use client';

import type { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabaseBrowser } from '@/lib/supabase/client';

import { takePendingConsent } from './api';

/** The person the server layout verified; enough to start before the full user loads. */
export type SignedInUser = { id: string; email: string | null };

type AuthContextValue = {
  /** Always set inside the web app (the server layout only renders it for a signed-in person). */
  user: SignedInUser;
  /** The full Supabase user (metadata, linked sign-in methods), once loaded. */
  details: User | null;
  refreshDetails: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Keeps the web app in step with the session: another tab logging out, or
 * the session expiring, sends this tab back to the login page.
 */
export function AuthProvider({ initialUser, children }: { initialUser: SignedInUser; children: ReactNode }) {
  const queryClient = useQueryClient();
  const [details, setDetails] = useState<User | null>(null);

  const refreshDetails = useCallback(async () => {
    const { data } = await supabaseBrowser().auth.getUser();
    setDetails(data.user ?? null);
  }, []);

  useEffect(() => {
    const client = supabaseBrowser();
    void (async () => {
      const { data } = await client.auth.getUser();
      let user = data.user ?? null;
      // Agreed to the terms before leaving for Google: record it now.
      const consent = takePendingConsent();
      if (user && consent && typeof user.user_metadata?.terms_accepted_at !== 'string') {
        const updated = await client.auth.updateUser({ data: consent });
        user = updated.data.user ?? user;
      }
      setDetails(user);
    })();

    const { data: subscription } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        queryClient.clear();
        // A full load, so nothing from this account stays in memory.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign('/login');
      } else if (event === 'USER_UPDATED') {
        setDetails(session.user);
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user: initialUser, details, refreshDetails }),
    [initialUser, details, refreshDetails],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

/** Same name as the app's hook, so shared hooks work unchanged. */
export function useUser(): SignedInUser {
  return useAuth().user;
}
