import type { Metadata } from 'next';

import { ActivityView } from '@/features/timeline/ActivityView';

export const metadata: Metadata = { title: 'Activity' };

export default function ActivityPage() {
  return <ActivityView />;
}
