import Link from 'next/link';

import { FaqList } from '@/components/FaqList';
import { PhoneMock } from '@/components/PhoneMock';
import { FAQS } from '@/content/faq';
import { site } from '@/site.config';

import styles from './page.module.css';

const STEPS = [
  {
    title: 'Add who asked',
    body: 'A name is enough. Paste their message so you remember what they wanted.',
    visual: 'add',
  },
  {
    title: 'Do what the button says',
    body: 'Follow-ups are lined up for day 1, 3 and 7 and drafted for you. Read, tap Send.',
    visual: 'schedule',
  },
  {
    title: 'Stop when they answer',
    body: 'Tap “They replied” and the rest are cancelled. No awkward double messages.',
    visual: 'reply',
  },
] as const;

const CALM = [
  { title: 'One list', body: 'Sorted by who needs you, not by when you added them.' },
  { title: 'Plain words', body: 'Reply, Follow up, Won, Lost. No pipeline stages to learn.' },
  { title: 'Your OK first', body: 'Nothing reaches a customer until you send it, unless you ask.' },
  { title: 'Made for teams', body: 'Invite a colleague with a code and share the same leads.' },
];

function StepVisual({ kind }: { kind: (typeof STEPS)[number]['visual'] }) {
  if (kind === 'add') {
    return (
      <div className={styles.vAdd} aria-hidden="true">
        <span className={styles.vLabel}>Name</span>
        <span className={styles.vInput}>
          <span className={styles.vTyped}>Sarah Mitchell</span>
          <span className={styles.vCaret} />
        </span>
        <span className={styles.vLabel}>What did they ask about?</span>
        <span className={`${styles.vInput} ${styles.vMuted}`}>New bathroom, wants a quote</span>
      </div>
    );
  }
  if (kind === 'schedule') {
    return (
      <div className={styles.vSchedule} aria-hidden="true">
        {[
          ['Day 1', 'Sent', styles.vDone],
          ['Day 3', 'Draft ready', styles.vNow],
          ['Day 7', 'Scheduled', ''],
        ].map(([day, state, tone]) => (
          <span key={day} className={`${styles.vStep} ${tone}`}>
            <i />
            <b>{day}</b>
            {state}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className={styles.vReply} aria-hidden="true">
      <span className={styles.vBadge}>
        <span className={styles.vBadgeWaiting}>Waiting</span>
        <span className={styles.vBadgeReplied}>Replied</span>
      </span>
      <span className={styles.vStrike}>Day 3 follow-up</span>
      <span className={styles.vStrike}>Day 7 follow-up</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroLight} aria-hidden="true" />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className="eyebrow rise" style={{ ['--i' as string]: 0 }}>
              Follow-ups for small businesses
            </span>
            <h1 className="h1 rise" style={{ ['--i' as string]: 1 }}>
              {site.tagline}
            </h1>
            <p className="lead rise" style={{ ['--i' as string]: 2 }}>
              {site.description}
            </p>
            <div className={`${styles.actions} rise`} style={{ ['--i' as string]: 3 }}>
              <span className="pill">
                <span className="live-dot" aria-hidden="true" />
                Coming soon to iPhone
              </span>
              <Link href="/faq" className="btn btn-ghost">
                Read the FAQ
              </Link>
            </div>
          </div>
          <PhoneMock />
        </div>
      </section>

      <section id="how" className="section">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">How it works</span>
            <h2 className="h2">Three steps. That is the whole app.</h2>
          </div>
          <div className={styles.steps}>
            {STEPS.map((step, index) => (
              <article
                key={step.title}
                className={`card reveal ${styles.step}`}
                style={{ ['--delay' as string]: `${index * 90}ms` }}>
                <StepVisual kind={step.visual} />
                <div className={styles.stepCopy}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <h3 className="h3">{step.title}</h3>
                  <p className="muted">{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.calmSection}`}>
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">Calm by design</span>
            <h2 className="h2">Done in a minute, not managed all day.</h2>
            <p className="lead">
              Most tools for leads want to become your whole job. Leads stays out of the way until
              someone needs you, then tells you exactly what to do.
            </p>
          </div>
          <div className={styles.calm}>
            {CALM.map((item, index) => (
              <div
                key={item.title}
                className={`reveal ${styles.calmItem}`}
                style={{ ['--delay' as string]: `${index * 70}ms` }}>
                <h3 className="h3">{item.title}</h3>
                <p className="muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.faqGrid}`}>
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">Questions</span>
            <h2 className="h2">The short answers.</h2>
            <Link href="/faq" className={styles.textLink}>
              All questions →
            </Link>
          </div>
          <div className="reveal">
            <FaqList items={FAQS.filter((faq) => ['auto-send', 'gmail', 'data'].includes(faq.id))} />
          </div>
        </div>
      </section>

      <section className={styles.final}>
        <div className={`container ${styles.finalInner} reveal`}>
          <h2 className="h2">Your next customer already asked.</h2>
          <p className="lead">Leads makes sure you answer.</p>
          <span className="pill">
            <span className="live-dot" aria-hidden="true" />
            Coming soon to iPhone
          </span>
        </div>
      </section>
    </>
  );
}
