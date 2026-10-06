import type { Metadata } from 'next';

import { FaqList } from '@/components/FaqList';
import { FAQS } from '@/content/faq';
import { site } from '@/site.config';

import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Questions and answers',
  description: 'How Leads works, what it does with your email and data, and how to delete your account.',
};

export default function FaqPage() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={`${styles.head} rise`}>
        <span className="eyebrow">FAQ</span>
        <h1 className="h2">Questions and answers</h1>
        <p className="lead">
          Something missing? Email{' '}
          <a className={styles.inlineLink} href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>
          .
        </p>
      </header>
      <div className={`${styles.narrow} rise`} style={{ ['--i' as string]: 1 }}>
        <FaqList items={FAQS} />
      </div>
    </div>
  );
}
