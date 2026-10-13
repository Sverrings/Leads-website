import type { Metadata } from 'next';

import { DeleteAccountPage } from '@/features/settings/pages/DeleteAccountPage';

export const metadata: Metadata = { title: 'Delete account' };

export default function Page() {
  return <DeleteAccountPage />;
}
