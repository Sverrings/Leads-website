import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import styles from './auth.module.css';

// These pages only make sense from an email link: keep them out of search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className={`container ${styles.page}`}>{children}</div>;
}
