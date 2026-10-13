import { db } from '@/lib/db';
import { toAppError, unwrap } from '@/lib/errors';

import { billingStatusSchema, type BillingStatus } from './plans';

/** The plan as the database sees it (public.billing_status). Read only: Pro is bought in the iPhone app. */
export async function fetchBillingStatus(workspaceId: string): Promise<BillingStatus> {
  const result = await db().rpc('billing_status', { p_workspace_id: workspaceId });
  const data = unwrap(result, { title: 'Unable to load your plan' });
  const parsed = billingStatusSchema.safeParse(data);
  if (!parsed.success) {
    throw toAppError(new Error(parsed.error.message), { title: 'Unable to load your plan' });
  }
  return parsed.data;
}
