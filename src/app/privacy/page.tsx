import type { Metadata } from 'next';

import { LegalDocument, type LegalSection } from '@/components/LegalDocument';
import { site } from '@/site.config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What Leads collects, why, who helps us run it, and how to delete your data.',
};

const email = <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: 'who',
    title: 'Who we are',
    body: (
      <>
        <p>
          Leads is an app that helps small businesses follow up with people who asked about their
          work. It is run by {site.operator} (“we”, “us”). You can reach us at {email}.
        </p>
        <p>
          For your own account details, we decide how they are used, so we are the{' '}
          <strong>controller</strong>. For the details you add about your customers, you decide,
          so you are the controller and we are your <strong>processor</strong>: we handle that
          data only to run Leads for you, as described below.
        </p>
      </>
    ),
  },
  {
    id: 'collect',
    title: 'What we collect',
    body: (
      <>
        <h3>When you create an account</h3>
        <ul>
          <li>Your name and email address.</li>
          <li>
            Your password, stored only as a secure hash by our authentication provider. We never
            see it.
          </li>
          <li>
            If you sign in with Apple or Google: an identifier and the email address they share. With
            Apple you can choose to share a private relay address instead of your real one.
          </li>
          <li>When you agreed to these terms and this policy, and which version.</li>
        </ul>
        <h3>What you add to Leads</h3>
        <ul>
          <li>
            Details about your leads: names, email addresses, phone numbers, company, what they
            asked about, where they found you, notes and status.
          </li>
          <li>The follow-ups you write or send, your templates and your follow-up settings.</li>
          <li>Your workspace name and the teammates you invite.</li>
        </ul>
        <h3>If you subscribe to Leads Pro</h3>
        <ul>
          <li>
            Apple handles the payment. We never see your card or bank details. From Apple we get
            the subscription’s transaction number, which plan it is, its start, renewal and end
            dates, and whether it will renew, so the app knows your workspace has Pro.
          </li>
        </ul>
        <h3>If you turn on push notifications</h3>
        <ul>
          <li>
            A push token for your phone, which lets us send it notifications. It is deleted when
            you log out, turn push off, or delete your account.
          </li>
        </ul>
        <h3>Technical information</h3>
        <ul>
          <li>
            Server logs with your IP address, the time of a request and the app version, used to
            keep the service secure and working.
          </li>
        </ul>
        <p>
          Follow-ups you send leave from your own email app; Leads does not send or see them after
          that. The app contains no advertising and no third-party analytics or tracking SDKs. This
          website sets no cookies and uses no analytics.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use it',
    body: (
      <>
        <ul>
          <li>
            <strong>To run the app</strong>: show your leads, work out who needs a follow-up, draft
            and send messages, and share a workspace with your team. Legal basis: our contract with
            you.
          </li>
          <li>
            <strong>To keep it safe</strong>: prevent abuse, investigate problems and protect your
            account. Legal basis: our legitimate interest in a secure service.
          </li>
          <li>
            <strong>To talk to you</strong> about your account, such as confirmation and
            password-reset emails, or important changes. Legal basis: our contract with you.
          </li>
          <li>
            <strong>To follow the law</strong> where we have to keep or share information. Legal
            basis: legal obligation.
          </li>
        </ul>
        <p>
          We never sell your data, never share it with advertisers and never use your customers’
          details for anything other than running Leads for you.
        </p>
      </>
    ),
  },
  {
    id: 'assistant',
    title: 'The writing assistant',
    body: (
      <p>
        The writing assistant is not available yet. When it is, and only when you ask it to write a
        draft, the lead’s name, what they asked about, earlier messages and your sender details will
        be sent to our AI provider, Anthropic, which returns the text. Anthropic processes this only
        to produce the draft and, under its commercial terms, does not use it to train its models.
        We will update this policy before it is switched on.
      </p>
    ),
  },
  {
    id: 'providers',
    title: 'Who helps us run Leads',
    body: (
      <>
        <p>We use a small number of providers that process data on our behalf:</p>
        <ul>
          <li>
            <strong>Supabase</strong>: database, sign-in and hosting of the app’s backend. Your
            data is stored in {site.dataRegion}.
          </li>
          <li>
            <strong>Google (Gmail)</strong>: delivers the emails Leads sends you about your account,
            such as sign-up and password reset codes.
          </li>
          <li>
            <strong>Apple</strong> and <strong>Google</strong>: only if you choose them to sign in.
          </li>
          <li>
            <strong>Apple</strong>: takes payment for Leads Pro and tells us the state of your
            subscription.
          </li>
          <li>
            <strong>Expo</strong>: delivers app updates and push notifications to your phone (push
            notifications go on through Apple or Google). A notification contains its title, such
            as “Follow up with Sarah”, and never the text of your messages.
          </li>
          <li>
            <strong>Vercel</strong>: hosts this website.
          </li>
          <li>
            <strong>Have I Been Pwned</strong>: when you choose a password, the app checks whether
            it has appeared in a known data breach. Only the first five characters of a one-way
            hash of the password are sent, which is not enough to work out the password, and
            nothing about you is included.
          </li>
        </ul>
        <p>
          Some of these companies are based in the United States. Where data leaves the EEA, the
          transfer is covered by the EU-US Data Privacy Framework or the European Commission’s
          standard contractual clauses.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <>
        <p>
          We keep your data while you have an account. When you delete your account, it is removed
          from our live systems straight away: your profile, your sign-in methods, and every
          workspace only you use, with all its leads and messages. Shared workspaces stay for your
          teammates.
        </p>
        <p>
          Backups are kept for a limited time, at most 30 days, and are then overwritten. Server
          logs are kept for a short period for security, normally no longer than 90 days.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your rights',
    body: (
      <>
        <p>Under data protection law (GDPR) you can:</p>
        <ul>
          <li>get a copy of your data, and have it in a format you can take elsewhere;</li>
          <li>correct it (most of it you can edit in the app);</li>
          <li>
            delete it: in the app, go to <strong>Settings → Delete account</strong>;
          </li>
          <li>object to or limit how we use it;</li>
          <li>withdraw consent you have given, at any time.</li>
        </ul>
        <p>
          Email {email} for anything you cannot do in the app. We answer within one month. You can
          also complain to the data protection authority in your country; in {site.country} that is{' '}
          <a href={site.supervisoryAuthority.url}>{site.supervisoryAuthority.name}</a>.
        </p>
        <p>
          <strong>If a business contacted you using Leads</strong>, that business controls your
          details. Ask them first; we will help them answer.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <>
        <p>
          Data is encrypted in transit and at rest. Each workspace is separated by the database
          itself, so one business can never see another’s leads. Keys for email and drafting live
          only on our servers, never in the app.
        </p>
        <p>
          On your phone, your sign-in and the copy of your leads the app keeps for offline use are
          encrypted with a key held in the iPhone’s Keychain, which never leaves that device. Email
          addresses are confirmed with a one-time code, changing your password after a while needs
          a fresh code, and resetting it signs you out everywhere else. You get an email when your
          password changes or a new way to sign in is added.
        </p>
        <p>
          No system is perfectly secure, but we will tell you without delay if a breach affects
          your data.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: <p>Leads is a tool for businesses and is not meant for anyone under 16.</p>,
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        When we change this policy we update the date at the top. If a change matters, we tell you in
        the app before it applies and, where needed, ask you to agree again.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      intro="What we collect, why, who helps us, and how to delete it. Written to be read."
      summary={[
        'We collect what is needed to run Leads: your account and the leads you add.',
        'We never sell your data or use it for advertising.',
        'Your customers’ details are yours. We only process them to run the app for you.',
        'Delete your account and its data any time in Settings.',
      ]}
      sections={SECTIONS}
    />
  );
}
