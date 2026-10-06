import type { MetadataRoute } from 'next';

import { site } from '@/site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    // The email-link pages carry one-time tokens and are useless out of context.
    rules: { userAgent: '*', allow: '/', disallow: '/auth/' },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
