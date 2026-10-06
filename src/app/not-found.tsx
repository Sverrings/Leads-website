import Link from 'next/link';

import styles from './legal.module.css';

export default function NotFound() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1 className="title">There&apos;s no page here.</h1>
        <p className="intro">
          The link may be old or mistyped. The <Link href="/">front page</Link> is a good place to
          start again.
        </p>
      </header>
    </div>
  );
}
