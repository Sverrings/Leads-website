import Link from 'next/link';

import { site } from '@/site.config';

import { LogoMark, Wordmark } from './Logo';
import { InstagramIcon, YouTubeIcon } from './SocialIcons';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.mark} aria-label="Leads home">
            <LogoMark size={24} />
            <Wordmark size={13} />
          </Link>
          <p className={styles.made}>Follow-ups for people who quote before they get the job.</p>
          <div className={styles.social}>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
              <span>Instagram</span>
            </a>
            <a href={site.social.youtube} target="_blank" rel="noopener noreferrer">
              <YouTubeIcon />
              <span>YouTube</span>
            </a>
          </div>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          <div>
            <h2>Leads</h2>
            <Link href="/#how">How it works</Link>
            <Link href="/#web">On the web</Link>
            <Link href="/faq">Questions</Link>
          </div>
          <div>
            <h2>Account</h2>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Create account</Link>
            <Link href="/forgot-password">Forgot password</Link>
          </div>
          <div>
            <h2>About</h2>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href={`mailto:${site.contactEmail}`}>Contact</a>
          </div>
        </nav>
      </div>
      <div className={`container ${styles.base}`}>
        <p>
          © {new Date().getFullYear()} {site.operator}. Data is stored in {site.dataRegion}.
        </p>
      </div>
    </footer>
  );
}
