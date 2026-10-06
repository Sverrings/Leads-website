import type { ReactNode } from 'react';

import { needsSetup, site } from '@/site.config';

import styles from '../app/legal.module.css';

export type LegalSection = { id: string; title: string; body: ReactNode };

/**
 * Privacy policy and terms share one layout: a plain summary first, then the
 * full text with a table of contents that stays in view on wide screens.
 */
export function LegalDocument({
  title,
  intro,
  summary,
  sections,
}: {
  title: string;
  intro: ReactNode;
  summary: string[];
  sections: LegalSection[];
}) {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1 className="title">{title}</h1>
        <p className="intro">{intro}</p>
        <p className={styles.updated}>Last updated {site.legalUpdated}</p>
      </header>

      {needsSetup && process.env.NODE_ENV !== 'production' ? (
        <p className={styles.setup}>
          Before publishing: fill in your name and contact email in src/site.config.ts.
        </p>
      ) : null}

      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="On this page">
          <span>On this page</span>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </nav>
        <article className={styles.doc}>
          <aside className={styles.summary}>
            <h2>The short version</h2>
            <ul>
              {summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </aside>
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.title}</h2>
              {section.body}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
