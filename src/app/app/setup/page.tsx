import type { Metadata } from 'next';

import { SetupView } from '@/features/onboarding/SetupView';

export const metadata: Metadata = { title: 'Set up' };

export default function SetupPage() {
  return <SetupView />;
}
