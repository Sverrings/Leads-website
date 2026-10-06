import Link from 'next/link';

import { site } from '@/site.config';

import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.made}>
          © {new Date().getFullYear()} {site.operator}. Data is stored in {site.dataRegion}.
        </p>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/faq">Questions</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href={`mailto:${site.contactEmail}`}>Contact</a>
        </nav>
      </div>
    </footer>
  );
}
