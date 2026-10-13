import styles from './PanelPreview.module.css';

const ROWS = [
  { name: 'Sarah Mitchell', job: 'Bathroom remodel', status: 'Replied', next: 'Reply to Sarah', tone: 'accent' },
  { name: 'James Carter', job: 'Basement waterproofing', status: 'Waiting', next: 'Follow up today', tone: 'accent' },
  { name: 'Emily Brooks', job: 'Storm damage repair', status: 'Waiting', next: 'Follow up in 2 days', tone: 'muted' },
  { name: 'Daniel Price', job: 'New deck, about 30 m²', status: 'Won', next: 'Won 3d ago', tone: 'success' },
  { name: 'Olivia Hansen', job: 'Kitchen cabinets', status: 'New', next: 'Send first response', tone: 'accent' },
] as const;

const WEEKS = [3, 5, 4, 6, 4, 7, 5, 8];

/** The web app's Leads page, drawn in HTML for the front page. */
export function PanelPreview() {
  const max = Math.max(...WEEKS);
  return (
    <figure className={styles.frame} aria-label="The Leads web app">
      <div className={styles.window}>
        <aside className={styles.sidebar} aria-hidden="true">
          <div className={styles.brand}>
            <span className={styles.brandMark} />
            <span>Morgan Renovation</span>
          </div>
          {['Today', 'Leads', 'Activity', 'Insights'].map((item) => (
            <span key={item} className={item === 'Leads' ? styles.navActive : styles.nav}>
              {item}
            </span>
          ))}
          <span className={styles.navBottom}>Settings</span>
        </aside>
        <div className={styles.main} aria-hidden="true">
          <div className={styles.top}>
            <div>
              <p className={styles.pageTitle}>Leads</p>
              <p className={styles.pageSub}>24 leads · 3 need you</p>
            </div>
            <span className={styles.newLead}>New lead</span>
          </div>
          <div className={styles.stats}>
            <div>
              <p className={styles.statLabel}>New this month</p>
              <p className={styles.statValue}>18</p>
            </div>
            <div>
              <p className={styles.statLabel}>Answered within a day</p>
              <p className={styles.statValue}>83%</p>
            </div>
            <div>
              <p className={styles.statLabel}>Won</p>
              <p className={styles.statValue}>7</p>
            </div>
            <div className={styles.chart}>
              <p className={styles.statLabel}>New leads per week</p>
              <div className={styles.bars}>
                {WEEKS.map((value, index) => (
                  <i
                    key={index}
                    style={{ height: `${(value / max) * 100}%` }}
                    className={index === WEEKS.length - 1 ? styles.barNow : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className={styles.table}>
            <div className={styles.head}>
              <span>Name</span>
              <span>Status</span>
              <span>Next step</span>
            </div>
            {ROWS.map((row) => (
              <div key={row.name} className={styles.row}>
                <span>
                  <b>{row.name}</b>
                  <small>{row.job}</small>
                </span>
                <span className={styles.status}>{row.status}</span>
                <span className={styles[row.tone]}>{row.next}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
