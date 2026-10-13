import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { site } from '@/site.config';

import './globals.css';

// Apple devices use SF Pro, like the app. Everyone else gets Inter, which is
// close to it. Downloaded at build time and served from this site.
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--inter' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: follow-ups for small businesses`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name}: follow-ups for small businesses`,
    description: site.description,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#08090a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
