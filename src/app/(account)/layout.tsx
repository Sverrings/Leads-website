import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { LogoMark, Wordmark } from '@/components/Logo';

import styles from './account.module.css';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/** Log in, create account and reset password: one card on the icon's graphite. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Link href="/" className={styles.brand} aria-label="Leads home">
          <LogoMark size={28} />
          <Wordmark size={15} />
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.foot}>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/faq">Questions</Link>
      </footer>
    </div>
  );
}
