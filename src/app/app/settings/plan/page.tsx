import type { Metadata } from 'next';

import { PlanPage } from '@/features/settings/pages/PlanPage';

export const metadata: Metadata = { title: 'Leads Pro' };

export default function Page() {
  return <PlanPage />;
}
