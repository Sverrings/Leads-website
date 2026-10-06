/**
 * Everything specific to you lives here. Fill in the fields marked TODO
 * before the site goes public: the privacy policy and terms read them.
 */
export const site = {
  name: 'Leads',
  tagline: 'Never let a lead go cold.',
  description:
    'Leads keeps everyone who asked about a job in one list, tells you who to follow up with today, and drafts the message. When they reply, it stops.',
  /** The address the site will live at. Update when you connect a domain. */
  url: 'https://leads-website.vercel.app',

  // TODO: the person or company responsible for the app (the "data controller").
  operator: 'The Leads team',
  // TODO: an inbox you read. Privacy requests and support questions go here.
  contactEmail: 'hello@your-domain.com',
  // TODO: check where your Supabase project stores data (Project settings → General → Region).
  dataRegion: 'the European Union',

  /** Law that governs the terms, and the data protection authority people can complain to. */
  country: 'Norway',
  supervisoryAuthority: { name: 'Datatilsynet', url: 'https://www.datatilsynet.no' },

  /** Shown on the legal pages. Change it whenever you change them. */
  legalUpdated: '6 October 2026',
} as const;

export const needsSetup = site.contactEmail.includes('your-domain');
