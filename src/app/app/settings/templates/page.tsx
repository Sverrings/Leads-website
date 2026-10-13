import type { Metadata } from 'next';

import { TemplatesPage } from '@/features/settings/pages/TemplatesPage';

export const metadata: Metadata = { title: 'Message templates' };

export default function Page() {
  return <TemplatesPage />;
}
