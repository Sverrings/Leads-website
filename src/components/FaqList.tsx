import type { Faq } from '@/content/faq';

import styles from './FaqList.module.css';

/** Native disclosure elements: keyboard and screen-reader friendly with no script. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <details key={item.id} id={item.id} className={styles.item}>
          <summary className={styles.question}>
            <span>{item.question}</span>
            <span className={styles.icon} aria-hidden="true" />
          </summary>
          <div className={styles.answer}>
            {item.answer.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
