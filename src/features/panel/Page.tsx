import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/ui/Icon';

import styles from './page.module.css';

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        {back ? (
          <Link href={back.href} className={styles.back}>
            <Icon name="chevron-left" size={14} />
            {back.label}
          </Link>
        ) : null}
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className={styles.sectionTitle}>
      <h2>{children}</h2>
      {aside}
    </div>
  );
}
