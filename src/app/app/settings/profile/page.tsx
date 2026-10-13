import type { Metadata } from 'next';

import { ProfilePage } from '@/features/settings/pages/ProfilePage';

export const metadata: Metadata = { title: 'Profile' };

export default function Page() {
  return <ProfilePage />;
}
