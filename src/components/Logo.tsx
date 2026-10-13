import Image from 'next/image';

import icon from '@/assets/leads-icon.png';

import styles from './Logo.module.css';

/** The app icon itself, so the site and the phone show the same mark. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src={icon}
      width={size}
      height={size}
      alt=""
      className={styles.mark}
      style={{ borderRadius: size * 0.225 }}
      priority
    />
  );
}

/**
 * LEADS with the colon drawn as the icon draws it: two rounded squares in the
 * icon's blue, with its soft glow. Sizes follow the font size.
 */
export function Wordmark({ size = 15 }: { size?: number }) {
  return (
    <span className={styles.wordmark} style={{ fontSize: size }}>
      LEADS
      <span className={styles.colon} aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="visually-hidden">:</span>
    </span>
  );
}
