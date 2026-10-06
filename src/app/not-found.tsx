import Link from 'next/link';

import styles from './legal.module.css';

export default function NotFound() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={`${styles.head} rise`}>
        <span className="eyebrow">404</span>
        <h1 className="h2">This page does not exist.</h1>
        <p className="lead">The link may be old, or it was never here.</p>
        <Link href="/" className="btn btn-primary" style={{ width: 'fit-content' }}>
          Back to the start
        </Link>
      </header>
    </div>
  );
}
