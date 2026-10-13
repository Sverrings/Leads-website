import type { Metadata } from 'next';

import { SendingPage } from '@/features/settings/pages/SendingPage';

export const metadata: Metadata = { title: 'Sending' };

export default function Page() {
  return <SendingPage />;
}
