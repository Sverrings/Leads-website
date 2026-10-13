// Shared with the iPhone app: Leads/src/features/leads/domain/insight.ts. Change both together (see README).
import type { LeadWithFollowUp, ReadyReason } from '@/lib/models';
import {
  calendarDaysBetween,
  formatClock,
  formatDuration,
  formatRelative,
  formatTimeUntil,
  isSameDay,
  toDate,
} from '@/lib/dates';
import { getFirstName } from '@/lib/strings';

/**
 * The single source of truth for "what should happen with this lead?".
 *
 * A lead's stored status is what a person decided (new, waiting, replied, ...).
 * Its *stage* additionally knows about time: a waiting lead whose follow-up is
 * due today needs follow-up. Every screen (Home, Leads filters, detail) reads
 * stages and next actions from here so they never disagree.
 */
export type LeadStage = 'needs_follow_up' | 'waiting' | 'replied' | 'converted' | 'closed';

export type AttentionReason =
  | 'customer_replied'
  | 'draft_ready'
  | 'send_failed'
  | 'missing_contact'
  | 'reminder_due'
  | 'follow_up_overdue'
  | 'follow_up_today'
  | 'first_response';

export type ActionTone = 'accent' | 'warning' | 'danger' | 'neutral' | 'success' | 'muted';

export type NextAction = {
  /** Short instruction: "Follow up today", "Reply to Sarah", "Follow up in 18 hours". */
  label: string;
  /** Supporting context: "Follow-up #2 · 14:30", "Replied 3h ago". */
  detail?: string;
  tone: ActionTone;
};

export type LeadInsight = {
  stage: LeadStage;
  attention: AttentionReason | null;
  /** Sort key for attention lists: older = more urgent. */
  urgencyAt: number;
  nextAction: NextAction;
};

export type InsightContext = {
  now: Date;
  /** Workspace setting: due sequence steps are sent by the backend without review. */
  autoSendEnabled: boolean;
  locale?: string;
};

function stepLabel(position: number | null | undefined): string {
  return position ? `Follow-up #${position}` : 'Reminder';
}

function readyAction(
  lead: LeadWithFollowUp,
  reason: ReadyReason | null,
  position: number | null,
): { attention: AttentionReason; action: NextAction } {
  const first = getFirstName(lead.name);
  switch (reason) {
    case 'send_failed':
      return {
        attention: 'send_failed',
        action: { label: 'Follow-up not sent', detail: 'Review and try again', tone: 'danger' },
      };
    case 'missing_contact':
      return {
        attention: 'missing_contact',
        action: lead.phone
          ? {
              label: `Call ${first}`,
              detail: `${stepLabel(position)} · No email address`,
              tone: 'warning',
            }
          : { label: 'Add contact details', detail: 'No email or phone number', tone: 'warning' },
      };
    case 'reminder':
      return {
        attention: 'reminder_due',
        action: { label: 'Follow up now', detail: 'Reminder', tone: 'accent' },
      };
    case 'approval_required':
    default:
      return {
        attention: 'draft_ready',
        action: {
          label: 'Review follow-up',
          detail: `${stepLabel(position)} is ready to send`,
          tone: 'accent',
        },
      };
  }
}

export function getLeadInsight(lead: LeadWithFollowUp, context: InsightContext): LeadInsight {
  const { now, autoSendEnabled, locale } = context;
  const first = getFirstName(lead.name);
  const createdAt = toDate(lead.created_at).getTime();

  if (lead.status === 'converted') {
    return {
      stage: 'converted',
      attention: null,
      urgencyAt: Number.POSITIVE_INFINITY,
      nextAction: {
        label: 'Won',
        detail: `${formatRelative(lead.status_changed_at, now, locale)}`,
        tone: 'success',
      },
    };
  }

  if (lead.status === 'closed') {
    return {
      stage: 'closed',
      attention: null,
      urgencyAt: Number.POSITIVE_INFINITY,
      nextAction: {
        label: 'Lost',
        detail: `${formatRelative(lead.status_changed_at, now, locale)}`,
        tone: 'muted',
      },
    };
  }

  if (lead.status === 'replied') {
    return {
      stage: 'replied',
      attention: 'customer_replied',
      urgencyAt: toDate(lead.status_changed_at).getTime(),
      nextAction: {
        label: `Reply to ${first}`,
        detail: `Replied ${formatRelative(lead.status_changed_at, now, locale)}`,
        tone: 'accent',
      },
    };
  }

  const followUp = lead.followUp;
  const neverContacted = lead.status === 'new' && !lead.last_contact_at;

  if (followUp?.status === 'ready') {
    const { attention, action } = readyAction(
      lead,
      followUp.ready_reason as ReadyReason | null,
      followUp.step_position,
    );
    return {
      stage: 'needs_follow_up',
      attention,
      urgencyAt: toDate(followUp.scheduled_for).getTime(),
      nextAction: action,
    };
  }

  if (followUp?.status === 'processing') {
    return {
      stage: 'waiting',
      attention: null,
      urgencyAt: Number.POSITIVE_INFINITY,
      nextAction: {
        label: 'Sending follow-up…',
        detail: stepLabel(followUp.step_position),
        tone: 'neutral',
      },
    };
  }

  if (followUp?.status === 'pending') {
    const due = toDate(followUp.scheduled_for);
    const automatic = autoSendEnabled && followUp.step_id !== null && Boolean(lead.email);
    const dueToday = isSameDay(due, now);
    const step = stepLabel(followUp.step_position);

    if (due.getTime() <= now.getTime() || dueToday) {
      if (automatic) {
        return {
          stage: 'waiting',
          attention: null,
          urgencyAt: due.getTime(),
          nextAction: {
            label:
              due.getTime() <= now.getTime()
                ? 'Sending shortly'
                : `Sends today at ${formatClock(due, locale)}`,
            detail: `${step} · Automatic`,
            tone: 'neutral',
          },
        };
      }

      if (due.getTime() <= now.getTime()) {
        const daysLate = calendarDaysBetween(due, now);
        return {
          stage: 'needs_follow_up',
          attention: 'follow_up_overdue',
          urgencyAt: due.getTime(),
          nextAction:
            daysLate >= 1
              ? {
                  label: 'Follow up now',
                  detail: `${step} · ${formatDuration(now.getTime() - due.getTime())} overdue`,
                  tone: 'warning',
                }
              : {
                  label: 'Follow up today',
                  detail: `${step} · Due ${formatClock(due, locale)}`,
                  tone: 'accent',
                },
        };
      }

      return {
        stage: 'needs_follow_up',
        attention: 'follow_up_today',
        urgencyAt: due.getTime(),
        nextAction: {
          label: 'Follow up today',
          detail: `${step} · ${formatClock(due, locale)}`,
          tone: 'accent',
        },
      };
    }

    if (neverContacted) {
      return {
        stage: 'needs_follow_up',
        attention: 'first_response',
        urgencyAt: createdAt,
        nextAction: {
          label: 'Send first response',
          detail: `New ${formatRelative(lead.created_at, now, locale)}`,
          tone: 'accent',
        },
      };
    }

    return {
      stage: 'waiting',
      attention: null,
      urgencyAt: due.getTime(),
      nextAction: {
        label: `Follow up ${formatTimeUntil(due, now)}`,
        detail: automatic ? `${step} · Automatic` : step,
        tone: 'neutral',
      },
    };
  }

  if (neverContacted) {
    return {
      stage: 'needs_follow_up',
      attention: 'first_response',
      urgencyAt: createdAt,
      nextAction: {
        label: 'Send first response',
        detail: `New ${formatRelative(lead.created_at, now, locale)}`,
        tone: 'accent',
      },
    };
  }

  return {
    stage: 'waiting',
    attention: null,
    urgencyAt: Number.POSITIVE_INFINITY,
    nextAction: lead.follow_ups_paused
      ? { label: 'Follow-ups paused', tone: 'muted' }
      : { label: 'Waiting for reply', detail: 'No follow-up scheduled', tone: 'muted' },
  };
}

/** "2 days since last contact" / "No contact yet". */
export function getLastContactLabel(
  lead: Pick<LeadWithFollowUp, 'last_contact_at'>,
  now: Date,
): string {
  if (!lead.last_contact_at) return 'No contact yet';
  const diff = now.getTime() - toDate(lead.last_contact_at).getTime();
  if (diff < 60_000) return 'Contacted just now';
  return `${formatDuration(diff)} since last contact`;
}
