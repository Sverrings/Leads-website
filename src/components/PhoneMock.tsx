import styles from './PhoneMock.module.css';

const ROWS = [
  {
    initials: 'SM',
    name: 'Sarah Mitchell',
    context: 'Bathroom remodel, wants a quote',
    action: 'Reply to Sarah',
    meta: 'asked 2h ago',
    button: 'Reply',
    hue: '#1e2633',
  },
  {
    initials: 'JC',
    name: 'James Carter',
    context: 'Basement waterproofing',
    action: 'Follow up today',
    meta: '3 days since contact',
    button: 'Follow up',
    hue: '#262033',
  },
  {
    initials: 'EB',
    name: 'Emily Brooks',
    context: 'Storm damage repair',
    action: 'Review follow-up',
    meta: 'draft ready',
    button: 'Review',
    hue: '#1f2b26',
  },
  {
    initials: 'DP',
    name: 'Daniel Price',
    context: 'New deck, about 30 m²',
    action: 'Follow up tomorrow',
    meta: '1 day since contact',
    button: 'Later',
    hue: '#2e2620',
  },
];

/**
 * The app's Today screen, drawn in HTML. It plays the core loop on repeat:
 * tap Reply, the message goes out, the lead leaves the list.
 */
export function PhoneMock() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.phone}>
        <div className={styles.screen}>
          <div className={styles.status}>
            <span>9:41</span>
            <span className={styles.island} />
            <span className={styles.statusIcons}>
              <i />
              <i />
              <b />
            </span>
          </div>

          <div className={styles.toast}>
            <span className={styles.toastCheck}>✓</span>
            Reply sent to Sarah
          </div>

          <div className={styles.header}>
            <div>
              <div className={styles.title}>Today</div>
              <div className={styles.subtitle}>
                <span className={styles.countBefore}>4 leads need you</span>
                <span className={styles.countAfter}>3 leads need you</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <span className={styles.round}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </span>
              <span className={`${styles.round} ${styles.me}`}>AM</span>
            </div>
          </div>

          <div className={styles.label}>Needs you</div>

          <div className={styles.list}>
            {ROWS.map((row, index) => (
              <div
                key={row.name}
                className={`${styles.row} ${index === 0 ? styles.first : styles.rest}`}
                style={{ ['--i' as string]: index }}>
                <span className={styles.avatar} style={{ background: row.hue }}>
                  {row.initials}
                </span>
                <span className={styles.body}>
                  <span className={styles.name}>{row.name}</span>
                  <span className={styles.context}>{row.context}</span>
                  <span className={styles.next}>
                    <i />
                    {row.action}
                    <em>· {row.meta}</em>
                  </span>
                </span>
                <span className={`${styles.button} ${index === 0 ? styles.press : ''}`}>
                  {row.button}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.tabbar}>
            <div className={styles.tabs}>
              <span className={`${styles.tab} ${styles.tabActive}`}>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M12 3 3 10v10a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1V10z" />
                </svg>
                Today
              </span>
              <span className={styles.tab}>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="8" r="3.5" />
                  <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
                  <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.7c1.9.8 3.1 2.6 3.5 5.3" />
                </svg>
                Leads
              </span>
              <span className={styles.tab}>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                  <path d="M12 7.5V12l3 2" />
                </svg>
                Activity
              </span>
            </div>
            <span className={styles.add}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
