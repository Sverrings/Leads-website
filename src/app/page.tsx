import Link from 'next/link';

import { EmailPreview } from '@/components/EmailPreview';
import { FaqList } from '@/components/FaqList';
import { PhoneMock } from '@/components/PhoneMock';
import { FAQS } from '@/content/faq';

import styles from './page.module.css';

const WEEK = [
  {
    when: 'Monday 09:12',
    what: (
      <>
        Sarah Mitchell emails to ask what a new bathroom would cost. You add her to Leads with her
        name and a few words about the job.
      </>
    ),
  },
  {
    when: 'Tuesday 09:12',
    what: (
      <>
        Sarah is at the top of your list with a follow-up already written. You change one line and
        tap Send. It goes out with your name on it.
      </>
    ),
  },
  {
    when: 'Friday 09:15',
    what: <>Still no answer. A second, shorter follow-up is ready for you to look at.</>,
  },
  {
    when: 'Friday 14:40',
    what: (
      <>
        Sarah replies to ask if you can come by on Monday. Her answer lands in your normal inbox.
        You tap <q>They replied</q> in Leads and the last reminder is cancelled.
      </>
    ),
  },
];

const PREVIEW_FAQS = ['auto-send', 'gmail', 'data'];

export default function HomePage() {
  return (
    <>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <h1 className="display">Follow up with everyone who asks for a quote.</h1>
          <p className="intro">
            Leads is an iPhone app for small businesses. Add the person who asked, and Leads lines
            up three follow-ups and writes them for you. You read them and tap Send. When they
            answer, it stops.
          </p>
          <p className={styles.status}>
            Coming to the App Store soon. <Link href="#week">See how it works</Link>
          </p>
        </div>
        <div className={styles.heroFigure}>
          <PhoneMock />
        </div>
      </section>

      <section id="week" className={`container ${styles.section}`}>
        <h2 className="title">A week with one lead</h2>
        <ol className={styles.week}>
          {WEEK.map((entry) => (
            <li key={entry.when} className={styles.day}>
              <time className={styles.when}>{entry.when}</time>
              <p className={styles.what}>{entry.what}</p>
            </li>
          ))}
        </ol>
        <p className={`small ${styles.note}`}>
          The reminders come on day 1, 3 and 7 after you add someone. You can change the days, or
          turn a lead&apos;s reminders off, whenever you like.
        </p>
      </section>

      <section className={`container ${styles.section} ${styles.split}`}>
        <div className="read">
          <h2 className="title">What Sarah receives</h2>
          <p className={styles.body}>
            This is the first follow-up Leads writes. It is short on purpose, because a short
            email gets read. You can rewrite every message in the app, and replies go to your own
            email address, not to us.
          </p>
        </div>
        <EmailPreview />
      </section>

      <section className={`container ${styles.section}`}>
        <div className="read">
          <h2 className="title">What it doesn&apos;t do</h2>
          <p className={styles.body}>
            Leads never connects to your inbox, so it can&apos;t read your email. When someone
            writes back, you tell it with one tap. Nothing goes out to a customer until you press
            Send, unless you switch on automatic sending yourself. There are no pipelines, deal
            stages or reports to learn. And the people in your list are yours: we don&apos;t sell
            or share them, and you can delete everything from the app. The{' '}
            <Link href="/privacy">privacy policy</Link> says exactly what is stored.
          </p>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className="read">
          <h2 className="title">Who it&apos;s for</h2>
          <p className={styles.body}>
            People who quote before they get the job: electricians, painters, roofers, cleaners,
            photographers, physiotherapists, small agencies. If a busy week has ever cost you a
            customer because nobody followed up, Leads is for you.
          </p>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className="read">
          <h2 className="title">Questions people ask</h2>
          <div className={styles.faq}>
            <FaqList items={FAQS.filter((item) => PREVIEW_FAQS.includes(item.id))} />
          </div>
          <p className="small">
            <Link href="/faq">All questions</Link>
          </p>
        </div>
      </section>
    </>
  );
}
