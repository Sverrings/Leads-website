import type { Metadata } from 'next';

import { ForgotPassword } from './ForgotPassword';

export const metadata: Metadata = { title: 'Reset your password' };

export default function ForgotPage() {
  return <ForgotPassword />;
}
