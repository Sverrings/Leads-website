import type { Metadata } from 'next';

import { TodayView } from '@/features/today/TodayView';

export const metadata: Metadata = { title: 'Today' };

export default function TodayPage() {
  return <TodayView />;
}
