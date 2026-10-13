import type { Metadata } from 'next';

import { SecurityPage } from '@/features/settings/pages/SecurityPage';

export const metadata: Metadata = { title: 'Sign-in & security' };

export default function Page() {
  return <SecurityPage />;
}
