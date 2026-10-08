/**
 * Everything specific to you lives here. Fill in the fields marked TODO
 * before the site goes public: the privacy policy and terms read them.
 */
export const site = {
  name: 'Leads',
  description:
    'Leads is an iPhone app that reminds small businesses to follow up with everyone who asks for a quote, and writes the follow-up for them.',
  /** The address the site lives at. Update when you connect your own domain. */
  url: 'https://leads-website-nine.vercel.app',

  // TODO: the person or company responsible for the app (the "data controller").
  operator: 'The Leads team',
  /** An inbox you read. Privacy requests and support questions go here. */
  contactEmail: 'leads.colon@gmail.com',
  /** Where the Supabase project keeps data. */
  dataRegion: 'Frankfurt, Germany (EU)',

  /** Law that governs the terms, and the data protection authority people can complain to. */
  country: 'Norway',
  supervisoryAuthority: { name: 'Datatilsynet', url: 'https://www.datatilsynet.no' },

  /** Shown on the legal pages. Change it whenever you change them. */
  legalUpdated: '9 October 2026',

  /**
   * Leads Pro, as set up in App Store Connect and the app's database
   * (private.app_settings). Keep these in sync when either changes.
   */
  freeActiveLeads: 3,
  trialDays: 14,
  proPrices: '99 kr a month or 990 kr a year in Norway, or $9.99 a month or $99.99 a year in the United States',

  /**
   * The app's backend, used by the pages that email links open (confirm email,
   * reset password). The publishable key is meant to be public: every request
   * it makes is limited by the database's row-level security.
   */
  supabase: {
    // Point at a local stack in development with NEXT_PUBLIC_SUPABASE_URL/_PUBLISHABLE_KEY.
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tylshwfarhekknpjnhcb.supabase.co',
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_FlBa5_UL6kQHAH-GvNQthw_c_el5W70',
  },
  /** Opens the app. Expo Go links are accepted too, for testing. */
  appUrl: 'leads://',
} as const;

export const needsSetup = site.contactEmail.includes('your-domain');
