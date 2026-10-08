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
        Leads keeps track of people who asked about your work, reminds you when to follow up and
        prepares the follow-up messages, which you send from your own email. Leads is in early
        access: features will change as we improve it, and we will tell you about changes that
        affect how you use it.
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
          Leads for you, for example to show it in the app and prepare messages.
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
          Follow-ups are sent from your own email account, so its provider&apos;s rules apply too.
          If we later send email for you and messages from your workspace cause complaints, bounces
          or abuse reports, we may pause sending from it while we look into it.
        </p>
      </>
    ),
  },
  {
    id: 'assistant',
    title: 'Drafts from the assistant',
    body: (
      <p>
        Drafts are suggestions, whether they come from a template or, once it is available, from
        the writing assistant, and they can be wrong. Read them before you send them. You are
        responsible for the messages you send.
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
    title: 'Plans and payment',
    body: (
      <>
        <p>
          <strong>Free.</strong> Each workspace can have {site.freeActiveLeads} active leads at a
          time without paying. Leads marked Won or Lost do not count, and there is no limit on them.
        </p>
        <p>
          <strong>Leads Pro</strong> removes that limit for everyone in the workspace. It is a
          subscription you buy in the app through Apple, monthly or yearly. The price is shown in
          your currency before you confirm, for example {site.proPrices}.
        </p>
        <ul>
          <li>
            <strong>Free trial.</strong> New subscribers can get a {site.trialDays}-day free trial,
            once per Apple ID. Apple decides who can have one. If you do not cancel at least 24
            hours before the trial ends, the subscription starts and Apple charges you. The app
            reminds you 2 days before.
          </li>
          <li>
            <strong>Renewal.</strong> The subscription renews automatically at the end of each
            month or year, and Apple charges your Apple ID, unless you cancel at least 24 hours
            before the period ends.
          </li>
          <li>
            <strong>Cancelling.</strong> In the app under <strong>Settings → Leads Pro → Manage
            subscription</strong>, or in your Apple ID’s subscription settings. Pro then stays until
            the end of the period you paid for.
          </li>
          <li>
            <strong>Refunds</strong> are handled by Apple under its rules, at{' '}
            <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a>.
          </li>
        </ul>
        <p>
          When Pro ends, nothing is deleted or locked. Every lead stays, with its history and
          follow-ups. While more than {site.freeActiveLeads} leads are active, adding another needs
          Pro. Deleting your account does not cancel a subscription; cancel it with Apple first.
        </p>
        <p>
          If we change the price, Apple tells you before it applies to your subscription, and
          where required you have to agree to it first.
        </p>
      </>
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
