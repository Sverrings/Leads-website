import type { Metadata } from 'next';

import { WorkspacePage } from '@/features/settings/pages/WorkspacePage';

export const metadata: Metadata = { title: 'Workspace & team' };

export default function Page() {
  return <WorkspacePage />;
}
