import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/LegalDocument';
import { site } from '@/site.config';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The agreement between you and Leads, in plain language.',
};

const email = <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'The agreement',
    body: (
      <>
        <p>
          These terms are an agreement between you and {site.operator}, who runs Leads. By creating
          an account you accept them, together with our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p>
          If you use Leads for a business, you confirm that you are allowed to accept these terms on
          its behalf. You must be at least 16.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: 'What Leads does',
    body: (
      <p>
        Leads keeps track of people who asked about your work, reminds you when to follow up, drafts
        follow-up messages and, if you choose, sends them for you. Leads is in early access: features
        will change as we improve it, and we will tell you about changes that affect how you use it.
      </p>
    ),
  },
  {
    id: 'account',
    title: 'Your account',
    body: (
      <p>
        Give accurate details, keep your sign-in safe, and tell us at {email} if you think someone
        else has access to your account. You are responsible for what happens in your account,
        including what your invited teammates do in your workspace.
      </p>
    ),
  },
  {
    id: 'content',
    title: 'Your content and your customers',
    body: (
      <>
        <p>
          Everything you add stays yours. You give us permission to store and process it only to run
          Leads for you, for example to show it in the app, draft messages and send the emails you
          ask us to send.
        </p>
        <p>
          You are responsible for having the right to keep your customers’ details and to contact
          them. For that data you are the controller and we act as your processor, as described in
          the Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: 'email',
    title: 'Sending email',
    body: (
      <>
        <p>
          Leads is for following up with people who contacted you or agreed to hear from you. You
          may not use it to send unsolicited messages, to bought or scraped lists, or anything that
          breaks the email and marketing laws that apply to you.
        </p>
        <p>
          If messages from your workspace cause complaints, bounces or abuse reports, we may pause
          sending from it while we look into it.
        </p>
      </>
    ),
  },
  {
    id: 'assistant',
    title: 'Drafts from the assistant',
    body: (
      <p>
        Drafts are suggestions written by software and can be wrong. Read them before you send them.
        You are responsible for the messages that go out from your account, including those sent
        automatically after you switch that on.
      </p>
    ),
  },
  {
    id: 'use',
    title: 'Fair use',
    body: (
      <>
        <p>Do not use Leads to:</p>
        <ul>
          <li>break the law or anyone’s rights;</li>
          <li>harass people or send harmful content;</li>
          <li>try to get into other people’s accounts or data, or test our security without asking;</li>
          <li>copy, resell or rebuild the service.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'price',
    title: 'Price',
    body: (
      <p>
        Leads is currently free to use. If we introduce paid plans, we will tell you in advance, and
        you will never be charged without agreeing to it first.
      </p>
    ),
  },
  {
    id: 'availability',
    title: 'Availability',
    body: (
      <p>
        We work to keep Leads running and your data safe, but we cannot promise it will always be
        available or free of errors, and it is provided “as is”. Keep your own record of anything you
        cannot afford to lose.
      </p>
    ),
  },
  {
    id: 'ending',
    title: 'Ending the agreement',
    body: (
      <p>
        You can stop at any time by deleting your account in <strong>Settings → Delete account</strong>
        . We may suspend or close an account that breaks these terms; where we can, we will warn you
        first and give you the chance to fix it.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    body: (
      <p>
        As far as the law allows, we are not responsible for indirect losses, such as lost jobs,
        lost profit or lost data, and our total responsibility to you is limited to the amount you
        paid us in the twelve months before the claim. Nothing in these terms limits rights you have
        as a consumer that the law does not allow to be limited.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        When we change these terms we update the date at the top. If a change matters, we tell you
        in the app before it applies and ask you to agree again.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Law and disputes',
    body: (
      <p>
        These terms are governed by the laws of {site.country}. If we disagree, write to us first at{' '}
        {email}; most things are solved that way. Otherwise disputes go to the courts of{' '}
        {site.country}, without taking away any right you have to use the courts where you live.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      intro="The agreement between you and Leads, in plain language."
      summary={[
        'Your data stays yours. We only use it to run Leads for you.',
        'Only follow up with people who contacted you or agreed to hear from you.',
        'Read drafts before you send them. You are responsible for what goes out.',
        'You can delete your account at any time.',
      ]}
      sections={SECTIONS}
    />
  );
}
