'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { appLink } from '@/lib/auth';

import styles from '../auth.module.css';

/** What Supabase adds when it sends someone back after Google. */
const FORWARDED = ['code', 'error', 'error_code', 'error_description'];

/**
 * A stop on the way back from Google. Supabase only returns people to web
 * addresses, never to a Wi-Fi IP like Expo Go's exp://192.168.…, so the app
 * asks Supabase to come here, and this page hands the one-time code on to the
 * app address in `next`. Only app addresses are accepted, and the code is
 * useless without the secret the app kept (PKCE).
 */
export function ReturnToApp() {
  const params = useSearchParams();
  const target = useMemo(() => {
    const extra: Record<string, string> = {};
    for (const key of FORWARDED) {
      const value = params.get(key);
      if (value) extra[key] = value;
    }
    return appLink(params.get('next'), extra);
  }, [params]);

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <div className={styles.panel}>
      <h1 className="title">Going back to Leads</h1>
      <p className="intro">If the app doesn&apos;t open by itself, tap the button.</p>
      <div className={styles.actions}>
        <a className="button" href={target}>
          Open Leads
        </a>
      </div>
    </div>
  );
}
