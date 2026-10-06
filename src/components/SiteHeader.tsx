import Link from 'next/link';

import { LogoMark, Wordmark } from './Logo';
import { ScrollState } from './ScrollState';
import styles from './SiteHeader.module.css';

const LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy' },
];

export function SiteHeader() {
  return (
    <header className={styles.header} data-header>
      <ScrollState />
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Leads home">
          <LogoMark size={26} />
          <Wordmark />
        </Link>
        <nav className={styles.nav} aria-label="Main">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
