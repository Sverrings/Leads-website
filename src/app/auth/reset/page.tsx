import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ResetPassword } from './ResetPassword';

export const metadata: Metadata = { title: 'Choose a new password' };

export default function ResetPage() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
