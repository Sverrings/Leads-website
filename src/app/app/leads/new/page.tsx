import type { Metadata } from 'next';

import { NewLeadView } from '@/features/leads/NewLeadView';

export const metadata: Metadata = { title: 'New lead' };

export default function NewLeadPage() {
  return <NewLeadView />;
}
