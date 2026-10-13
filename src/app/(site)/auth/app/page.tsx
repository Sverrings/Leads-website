import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ReturnToApp } from './ReturnToApp';

export const metadata: Metadata = { title: 'Back to Leads' };

export default function ReturnPage() {
  return (
    <Suspense>
      <ReturnToApp />
    </Suspense>
  );
}
