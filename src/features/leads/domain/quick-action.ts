// Shared with the iPhone app: Leads/src/features/leads/domain/quick-action.ts. Change both together (see README).
import type { LeadWithFollowUp } from '@/lib/models';

import type { LeadInsight } from './insight';

export type QuickActionKind = 'compose' | 'call' | 'edit' | 'open';

export type QuickAction = { label: string; kind: QuickActionKind };

/**
 * The one button shown next to a lead that needs attention, so the list says
 * what to do, not just who: Reply, Follow up, Call. Null when nothing is due.
 */
export function getQuickAction(
  lead: Pick<LeadWithFollowUp, 'email' | 'phone'> & { insight: Pick<LeadInsight, 'attention'> },
): QuickAction | null {
  const reason = lead.insight.attention;
  if (!reason) return null;

  const reach = (emailLabel: string): QuickAction => {
    if (lead.email) return { label: emailLabel, kind: 'compose' };
    if (lead.phone) return { label: 'Call', kind: 'call' };
    return { label: 'Add email', kind: 'edit' };
  };

  switch (reason) {
    case 'draft_ready':
      return { label: 'Review', kind: 'compose' };
    case 'send_failed':
      return { label: 'Fix', kind: 'open' };
    case 'missing_contact':
      return lead.phone ? { label: 'Call', kind: 'call' } : { label: 'Add email', kind: 'edit' };
    case 'customer_replied':
    case 'first_response':
      return reach('Reply');
    case 'reminder_due':
    case 'follow_up_overdue':
    case 'follow_up_today':
    default:
      return reach('Follow up');
  }
}
