import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LeadView } from '@/features/leads/LeadView';

export const metadata: Metadata = { title: 'Lead' };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <LeadView id={id} />
    </Suspense>
  );
}
