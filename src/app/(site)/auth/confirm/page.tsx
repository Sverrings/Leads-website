import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ConfirmEmail } from './ConfirmEmail';

export const metadata: Metadata = { title: 'Confirm your email' };

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmEmail />
    </Suspense>
  );
}
