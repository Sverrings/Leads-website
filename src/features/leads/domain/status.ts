// Shared with the iPhone app: Leads/src/features/leads/domain/status.ts. Change both together (see README).
import { Constants } from '@/lib/database.types';
import type { LeadStatus } from '@/lib/models';

/** Order matches the lifecycle and every status picker in the app. */
export const LEAD_STATUSES = Constants.public.Enums.lead_status satisfies readonly LeadStatus[];

export type StatusTone = 'accent' | 'neutral' | 'warning' | 'success' | 'muted';

type StatusMeta = {
  label: string;
  /** Explains what choosing the status does, shown in the status picker. */
  description: string;
  tone: StatusTone;
};

export const STATUS_META: Record<LeadStatus, StatusMeta> = {
  new: {
    label: 'New',
    description: "They haven't heard from you yet.",
    tone: 'accent',
  },
  waiting: {
    label: 'Waiting',
    description: "You've been in touch. Follow-ups keep going until they answer.",
    tone: 'neutral',
  },
  replied: {
    label: 'Replied',
    description: 'They answered. Follow-ups stop so you can reply yourself.',
    tone: 'warning',
  },
  converted: {
    label: 'Won',
    description: 'They said yes. Follow-ups stop.',
    tone: 'success',
  },
  closed: {
    label: 'Lost',
    description: "It's not happening. Follow-ups stop.",
    tone: 'muted',
  },
};

/** Statuses where the follow-up engine may still act. */
export function isActiveStatus(status: LeadStatus): boolean {
  return status === 'new' || status === 'waiting';
}

/** Statuses where a follow-up can be scheduled by hand. */
export function canScheduleFollowUp(status: LeadStatus): boolean {
  return status !== 'converted' && status !== 'closed';
}
