'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/ui/Icon';

import { PageHeader } from '../panel/Page';
import styles from './settings.module.css';

const SECTIONS: { title: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  {
    title: 'Follow-ups',
    items: [
      { href: '/app/settings/follow-ups', label: 'Follow-up rules', icon: 'repeat' },
      { href: '/app/settings/sending', label: 'Sending', icon: 'send' },
      { href: '/app/settings/templates', label: 'Message templates', icon: 'file-text' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { href: '/app/settings/workspace', label: 'Workspace & team', icon: 'briefcase' },
      { href: '/app/settings/plan', label: 'Leads Pro', icon: 'award' },
    ],
  },
  {
    title: 'You',
    items: [
      { href: '/app/settings/profile', label: 'Profile', icon: 'user' },
      { href: '/app/settings/notifications', label: 'Notifications', icon: 'bell' },
      { href: '/app/settings/security', label: 'Sign-in & security', icon: 'lock' },
      { href: '/app/settings/delete-account', label: 'Delete account', icon: 'trash-2' },
    ],
  },
];

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const all = SECTIONS.flatMap((section) => section.items);

  return (
    <>
      <PageHeader title="Settings" subtitle="The same settings as in the app; changes apply on both." />
      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="Settings">
          {SECTIONS.map((section) => (
            <div key={section.title} className={styles.navGroup}>
              <p className={styles.navTitle}>{section.title}</p>
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${active ? styles.navActive : ''}`}
                    aria-current={active ? 'page' : undefined}>
                    <Icon name={item.icon} size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <label className={styles.mobileNav}>
          <span className="visually-hidden">Settings page</span>
          <select value={pathname} onChange={(event) => router.push(event.target.value)}>
            {all.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}

/** A titled block of settings. */
export function SettingsSection({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <div className={styles.sectionBody}>{children}</div>
      {footer ? <footer className={styles.sectionFoot}>{footer}</footer> : null}
    </section>
  );
}

/** Label on the left, control on the right. */
export function SettingsRow({
  title,
  description,
  control,
}: {
  title: ReactNode;
  description?: ReactNode;
  control?: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <p className={styles.rowTitle}>{title}</p>
        {description ? <p className={styles.rowDescription}>{description}</p> : null}
      </div>
      {control ? <div className={styles.rowControl}>{control}</div> : null}
    </div>
  );
}
