import type { MetadataRoute } from 'next';

import { site } from '@/site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    // The email-link pages carry one-time tokens, and the web app is private.
    rules: { userAgent: '*', allow: '/', disallow: ['/auth/', '/app'] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
