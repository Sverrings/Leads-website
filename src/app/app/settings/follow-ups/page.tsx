import type { Metadata } from 'next';

import { FollowUpRulesPage } from '@/features/settings/pages/FollowUpRulesPage';

export const metadata: Metadata = { title: 'Follow-up rules' };

export default function Page() {
  return <FollowUpRulesPage />;
}
