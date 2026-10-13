import Link from 'next/link';

import { LogoMark, Wordmark } from './Logo';
import styles from './SiteHeader.module.css';

const LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/#web', label: 'On the web' },
  { href: '/faq', label: 'Questions' },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Leads home">
          <LogoMark size={28} />
          <Wordmark size={15} />
        </Link>
        <nav className={styles.nav} aria-label="Main">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.account}>
          <Link href="/login" className={styles.login}>
            Log in
          </Link>
          <Link href="/signup" className={`button ${styles.cta}`}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
