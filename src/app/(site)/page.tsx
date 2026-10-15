import Link from 'next/link';

import { EmailPreview } from '@/components/EmailPreview';
import { FaqList } from '@/components/FaqList';
import { PanelPreview } from '@/components/PanelPreview';
import { PhoneMock } from '@/components/PhoneMock';
import { FAQS } from '@/content/faq';
import { site } from '@/site.config';

import styles from './page.module.css';

const WEEK = [
  {
    when: 'Monday 09:12',
    label: 'Asked for a quote',
    what: 'Sarah Mitchell emails to ask what a new bathroom would cost. You add her to Leads.',
  },
  {
    when: 'Tuesday 09:12',
    label: 'Day 1',
    what: 'Sarah is at the top of Today with a follow-up already written. You send it from your own email.',
  },
  {
    when: 'Friday 09:15',
    label: 'Day 3',
    what: 'Still no answer. A second, shorter follow-up is ready for you to look at.',
  },
  {
    when: 'Friday 14:40',
    label: 'Got the job',
    what: 'Sarah asks if you can come by on Monday. You tap “They replied”, and the last reminder is cancelled.',
  },
];

const PREVIEW_FAQS = ['price', 'auto-send', 'data'];

export default function HomePage() {
  return (
    <>
      <section className={styles.heroBand}>
        <div className={`container ${styles.hero}`}>
          <div className={styles.heroText}>
            <h1 className="display">Follow up with everyone who asks for a quote.</h1>
            <p className="intro">
              Add the person who asked. Leads lines up three follow-ups, writes them, and puts the
              next one in front of you on the right day. You send it from your own email, and when
              they answer, it stops.
            </p>
            <div className={styles.actions}>
              <Link href="/signup" className="button">
                Get started free
              </Link>
              <Link href="/login" className="button button-quiet">
                Log in
              </Link>
            </div>
            <p className={styles.status}>
              Works in your browser today. The iPhone app is coming to the App Store.
            </p>
          </div>
          <div className={styles.heroFigure}>
            <PhoneMock />
          </div>
        </div>
      </section>

      <section id="how" className={`container ${styles.section}`}>
        <div className="read">
          <h2 className="title">One lead, one week</h2>
          <p className={styles.lede}>
            Reminders come on day 1, 3 and 7 after you add someone. You can change the days, or turn
            a lead&apos;s reminders off, whenever you like.
          </p>
        </div>
        <ol className={styles.track}>
          {WEEK.map((entry, index) => (
            <li
              key={entry.when}
              className={`${styles.step} ${index === WEEK.length - 1 ? styles.won : ''}`}>
              <span className={styles.dot} aria-hidden="true" />
              <p className={styles.stepLabel}>{entry.label}</p>
              <time className={styles.when}>{entry.when}</time>
              <p className={styles.what}>{entry.what}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`container ${styles.section} ${styles.split}`}>
        <div className="read">
          <h2 className="title">What Sarah receives</h2>
          <p className={styles.body}>
            This is the first follow-up Leads writes. It is short on purpose, because a short email
            gets read. You can rewrite every message, and replies go to your own inbox, not to us.
          </p>
        </div>
        <EmailPreview />
      </section>

      <section id="web" className={`container ${styles.section}`}>
        <div className={styles.webHead}>
          <div className="read">
            <h2 className="title">Your leads on a bigger screen</h2>
            <p className={styles.body}>
              Everything from the phone, in your browser: who needs you today, every lead in one
              searchable list, and how many quotes turned into jobs. It is the same account, so a
              follow-up you send at your desk is crossed off on your phone.
            </p>
          </div>
          <Link href="/signup" className="button">
            Open Leads in your browser
          </Link>
        </div>
        <PanelPreview />
        <dl className={styles.facts}>
          <div>
            <dt>Today</dt>
            <dd>The people waiting on you, most urgent first, each with one button for the next step.</dd>
          </div>
          <div>
            <dt>Leads</dt>
            <dd>Search by name, phone or job, filter by where they are, and sort by when you last spoke.</dd>
          </div>
          <div>
            <dt>Insights</dt>
            <dd>New leads per week, how fast you answer, and how many said yes, for the last month or year.</dd>
          </div>
        </dl>
      </section>

      <section className={`container ${styles.section}`}>
        <div className="read">
          <h2 className="title">What it doesn&apos;t do</h2>
          <p className={styles.body}>
            Leads never connects to your inbox, so it can&apos;t read your email. When someone writes
            back, you tell it with one click. It never emails a customer by itself either: every
            follow-up goes out from your own email, when you press send. And the people in your list
            are yours. We don&apos;t sell or share them, and you can delete everything yourself. The{' '}
            <Link href="/privacy">privacy policy</Link> says exactly what is stored.
          </p>
        </div>
      </section>

      <section className={`container ${styles.section} ${styles.split}`}>
        <div className="read">
          <h2 className="title">What it costs</h2>
          <p className={styles.body}>
            Free for {site.freeActiveLeads} active leads at a time, for as long as you like. Won and
            lost leads never count. Leads Pro removes the limit for your whole team, with{' '}
            {site.trialDays} days free to try it. You subscribe in the iPhone app; the web app follows
            your plan.
          </p>
          <p className={styles.body}>
            {site.assistantLive ? '' : 'Coming soon: '}“Write for me” drafts a personal follow-up with
            AI. The free plan includes {site.freeAiDrafts} AI drafts a month and Leads Pro{' '}
            {site.proAiDrafts.toLocaleString('en-US')}, shared by the team. Templates are unlimited on
            both, so a follow-up is always ready even when the month’s AI drafts are used.
          </p>
        </div>
        <div className={styles.plans}>
          <div className={styles.plan}>
            <p className={styles.planName}>Free</p>
            <p className={styles.planPrice}>0 kr</p>
            <ul className={styles.planList}>
              <li>{site.freeActiveLeads} active leads</li>
              <li>
                {site.freeAiDrafts} AI drafts a month{site.assistantLive ? '' : ' (soon)'}
              </li>
              <li>Unlimited templates and follow-ups</li>
            </ul>
          </div>
          <div className={`${styles.plan} ${styles.planPro}`}>
            <p className={styles.planName}>Leads Pro</p>
            <p className={styles.planPrice}>
              99 kr <span>a month</span>
            </p>
            <ul className={styles.planList}>
              <li>No limit on active leads</li>
              <li>
                {site.proAiDrafts.toLocaleString('en-US')} AI drafts a month
                {site.assistantLive ? '' : ' (soon)'}
              </li>
              <li>For the whole team · or 990 kr a year</li>
            </ul>
          </div>
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
