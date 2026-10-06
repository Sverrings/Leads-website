import Link from 'next/link';

import { site } from '@/site.config';

import { LogoMark, Wordmark } from './Logo';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.mark} aria-label="Leads home">
            <LogoMark size={22} />
            <Wordmark />
          </Link>
          <p className={styles.tagline}>{site.tagline}</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href={`mailto:${site.contactEmail}`}>Contact</a>
        </nav>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>
          © {new Date().getFullYear()} {site.operator}
        </span>
        <span>Made for people who quote before they sell.</span>
      </div>
    </footer>
  );
}
