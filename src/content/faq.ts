export type Faq = { id: string; question: string; answer: string[] };

/**
 * Answers say exactly what the app does today. Update them when it changes;
 * people decide whether to trust the app from this page.
 */
export const FAQS: Faq[] = [
  {
    id: 'what',
    question: 'What is Leads?',
    answer: [
      'A simple app for following up with people who asked about your work. You add someone, Leads tells you when to get back to them and drafts the message, and it stops as soon as they reply.',
    ],
  },
  {
    id: 'who',
    question: 'Who is it for?',
    answer: [
      'Small businesses that quote before they sell: tradespeople, contractors, studios, clinics and agencies. If a missed follow-up has ever cost you a job, it is for you.',
    ],
  },
  {
    id: 'auto-send',
    question: 'Does it send emails on its own?',
    answer: [
      'Only if you turn it on. By default every follow-up waits as a draft for you to read, change and send.',
      'Under Settings → Sending you can let Leads send them on schedule instead. They go out even when your phone is off.',
    ],
  },
  {
    id: 'from',
    question: 'Which address do the emails come from?',
    answer: [
      'They are sent by our email service with your name as the sender and your own email address as the reply-to. When a customer answers, the reply lands in your normal inbox.',
    ],
  },
  {
    id: 'gmail',
    question: 'Does Leads read my Gmail or know when someone replies?',
    answer: [
      'No. Leads does not connect to your inbox, so it never reads your email.',
      'When someone writes back, open their lead and tap “They replied”. The remaining follow-ups stop straight away. Detecting replies automatically may come later, and it would always be your choice to switch on.',
    ],
  },
  {
    id: 'team',
    question: 'Can my team use it?',
    answer: [
      'Yes. Invite teammates with the code under Settings → Workspace & team. Everyone sees the same leads, and your workspace is kept separate from everyone else’s.',
    ],
  },
  {
    id: 'accounts',
    question: 'I signed in with Apple once and Google another time. Do I have two accounts?',
    answer: [
      'Not if both use the same email address: Leads joins them into one account automatically. The exception is Apple’s “Hide My Email”, which gives a different address. To avoid a second account, sign in the usual way and connect Apple under Settings → Sign-in & security.',
    ],
  },
  {
    id: 'data',
    question: 'What happens to my data?',
    answer: [
      'It is used to run the app for you and nothing else. We never sell it and never use it for advertising. The privacy policy has the details, in plain language.',
    ],
  },
  {
    id: 'delete',
    question: 'How do I delete my account?',
    answer: [
      'In the app, go to Settings → Delete account. Your account is removed, together with any workspace only you use and all its leads. Shared workspaces stay for your teammates.',
    ],
  },
  {
    id: 'devices',
    question: 'Which phones does it work on?',
    answer: ['iPhone, first. An Android version may follow.'],
  },
];
