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
      'No. When a follow-up is due, Leads shows it on Today with the message already written. You read it, change what you like, and it opens in your Mail app to send.',
      'Letting Leads send follow-ups for you on schedule is coming later. It will always be something you switch on yourself.',
    ],
  },
  {
    id: 'from',
    question: 'Which address do the emails come from?',
    answer: [
      'From your own. Follow-ups open in the Mail app on your phone, so they are sent from your address and customers reply straight to your normal inbox.',
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
    id: 'price',
    question: 'What does it cost?',
    answer: [
      'Each workspace can have 3 active leads at a time for free. Leads marked Won or Lost do not count.',
      'Leads Pro removes the limit for everyone in the workspace: 99 kr a month or 990 kr a year in Norway, shown in your own currency in the app. New subscribers get 14 days free through Apple, and the app reminds you 2 days before the trial ends. Cancel any time under Settings → Leads Pro.',
      'Coming soon, “Write for me” drafts a personal follow-up with AI. The free plan will include 10 AI drafts a month and Leads Pro 1,000, shared by the whole workspace. They start over on the 1st of each month and unused ones do not carry over. Templates are unlimited on both plans, so you can always follow up when the month’s AI drafts are used.',
      'If Pro ends, nothing is deleted. Every lead stays; you just cannot add more than 3 active ones until some are marked Won or Lost.',
    ],
  },
  {
    id: 'notifications',
    question: 'Will it send me notifications?',
    answer: [
      'If you turn them on. Leads tells you when a follow-up is due, between 07:00 and 21:00 your time. A notification says who to follow up with, never what your messages say.',
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
    question: 'Can I use Leads on my computer?',
    answer: [
      'Yes. Log in at this website with the same account and you get the same leads, follow-ups and settings, plus charts of how your follow-ups are going. A change on one shows up on the other.',
      'The iPhone app is coming to the App Store soon. An Android version may follow.',
    ],
  },
];
