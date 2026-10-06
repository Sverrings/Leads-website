import type { Metadata } from 'next';

import { FaqList } from '@/components/FaqList';
import { FAQS } from '@/content/faq';
import { site } from '@/site.config';

import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Questions',
  description: 'How Leads works, what it does with your email and data, and how to delete your account.',
};

export default function FaqPage() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1 className="title">Questions</h1>
        <p className="intro">
          If yours isn&apos;t here, email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>{' '}
          and you&apos;ll get an answer from a person.
        </p>
      </header>
      <div className={styles.narrow}>
        <FaqList items={FAQS} />
      </div>
    </div>
  );
}
