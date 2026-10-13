// Shared with the iPhone app: Leads/src/features/timeline/domain/describe-event.ts. Change both together (see README).
import type { IconName } from '@/ui/Icon';
import type { Json } from '@/lib/database.types';
import type { LeadEvent, LeadStatus } from '@/lib/models';
import { formatDateTime } from '@/lib/dates';
import { capitalize } from '@/lib/strings';

export type EventTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export type EventDescription = {
  icon: IconName;
  tone: EventTone;
  title: string;
  description?: string;
  /** Quoted content: a note, a message subject. */
  quote?: string;
};

export type DescribeOptions = {
  now: Date;
  /** Workspace feeds name the lead ("John replied"); a lead's own timeline doesn't. */
  leadName?: string;
  locale?: string;
};

type Metadata = Record<string, Json | undefined>;

function meta(event: Pick<LeadEvent, 'metadata'>): Metadata {
  const value = event.metadata;
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Metadata) : {};
}

function str(value: Json | undefined): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function num(value: Json | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function stepName(position: number | undefined, fallback = 'Follow-up'): string {
  return position ? `Follow-up #${position}` : fallback;
}

const CANCEL_REASONS: Record<string, string> = {
  replied: 'Customer replied',
  converted: 'Marked as won',
  closed: 'Marked as lost',
  paused: 'Follow-ups paused',
  sequence_disabled: 'Automatic follow-ups turned off',
};

const CONTACT_LABELS: Record<string, { title: string; icon: IconName }> = {
  call: { title: 'Call logged', icon: 'phone' },
  meeting: { title: 'Meeting logged', icon: 'users' },
  email: { title: 'Email logged', icon: 'mail' },
  sms: { title: 'Text message logged', icon: 'message-circle' },
  other: { title: 'Contact logged', icon: 'message-square' },
};

const FIELD_LABELS: Record<string, string> = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  company: 'company',
  inquiry: 'inquiry',
  source: 'source',
};

/**
 * Cancellations caused by a status change or a pause are already explained by
 * that event; showing both would be noise.
 */
export function isRedundantEvent(event: Pick<LeadEvent, 'type' | 'metadata'>): boolean {
  if (event.type !== 'follow_up_cancelled') return false;
  const reason = str(meta(event).reason);
  return (
    reason === 'replied' || reason === 'converted' || reason === 'closed' || reason === 'paused'
  );
}

export function describeEvent(
  event: Pick<LeadEvent, 'type' | 'metadata' | 'actor_id'>,
  { now, leadName, locale }: DescribeOptions,
): EventDescription {
  const m = meta(event);
  const who = leadName ?? 'Customer';
  const position = num(m.step_position);

  switch (event.type) {
    case 'lead_created':
      return {
        icon: 'plus',
        tone: 'default',
        title: leadName ? `New lead: ${leadName}` : 'Lead created',
        description: str(m.source) ? `Source: ${str(m.source)}` : undefined,
      };

    case 'status_changed': {
      const to = str(m.to) as LeadStatus | undefined;
      switch (to) {
        case 'replied':
          return {
            icon: 'corner-up-left',
            tone: 'accent',
            title: `${who} replied`,
            description: 'Follow-ups stopped',
          };
        case 'converted':
          return {
            icon: 'award',
            tone: 'success',
            title: leadName ? `${leadName}: won` : 'Marked as won',
            description: 'Follow-ups stopped',
          };
        case 'closed':
          return {
            icon: 'archive',
            tone: 'default',
            title: leadName ? `${leadName}: lost` : 'Marked as lost',
            description: 'Follow-ups stopped',
          };
        case 'new':
          return {
            icon: 'rotate-ccw',
            tone: 'default',
            title: leadName ? `${leadName} reopened` : 'Reopened',
          };
        case 'waiting':
        default:
          return {
            icon: 'clock',
            tone: 'default',
            title: leadName ? `Waiting on ${leadName}` : 'Waiting for reply',
          };
      }
    }

    case 'follow_up_sent': {
      const automated = m.automated === true;
      const base = position ? stepName(position) : 'Follow-up';
      return {
        icon: 'send',
        tone: 'accent',
        title: leadName ? `${base} sent to ${leadName}` : `${base} sent`,
        description: automated
          ? 'Sent automatically'
          : m.ai_generated === true
            ? 'Drafted with assistance'
            : undefined,
        quote: str(m.subject),
      };
    }

    case 'follow_up_scheduled': {
      const at = str(m.scheduled_for);
      const isReminder = m.kind === 'reminder';
      const title =
        m.rescheduled === true
          ? isReminder
            ? 'Reminder moved'
            : `${stepName(position)} rescheduled`
          : isReminder
            ? 'Reminder set'
            : `${stepName(position)} scheduled`;
      return {
        icon: 'calendar',
        tone: 'default',
        title: leadName ? `${title} · ${leadName}` : title,
        description: at ? formatDateTime(at, now, locale) : undefined,
      };
    }

    case 'follow_up_ready': {
      const reason = str(m.reason);
      if (reason === 'missing_contact') {
        return {
          icon: 'alert-circle',
          tone: 'warning',
          title: leadName ? `${stepName(position)} due · ${leadName}` : `${stepName(position)} due`,
          description: 'No email address. Follow up by phone.',
        };
      }
      if (reason === 'reminder') {
        return {
          icon: 'bell',
          tone: 'accent',
          title: leadName ? `Reminder: ${leadName}` : 'Reminder due',
        };
      }
      if (reason === 'send_failed') {
        return {
          icon: 'alert-triangle',
          tone: 'danger',
          title: leadName ? `Follow-up to ${leadName} needs attention` : 'Needs attention',
          description: 'Automatic send failed. Review and send manually.',
        };
      }
      return {
        icon: 'edit-3',
        tone: 'accent',
        title: leadName
          ? `${stepName(position)} ready for ${leadName}`
          : `${stepName(position)} ready`,
        description: 'Draft waiting for review',
      };
    }

    case 'follow_up_failed':
      return {
        icon: 'alert-triangle',
        tone: 'danger',
        title: leadName ? `Follow-up to ${leadName} failed` : 'Follow-up failed',
        description: 'The message could not be sent.',
      };

    case 'follow_up_skipped':
      return { icon: 'skip-forward', tone: 'default', title: `${stepName(position)} skipped` };

    case 'follow_up_cancelled':
      return {
        icon: 'slash',
        tone: 'default',
        title: 'Follow-ups stopped',
        description: CANCEL_REASONS[str(m.reason) ?? ''] ?? undefined,
      };

    case 'follow_ups_paused':
      return {
        icon: 'pause',
        tone: 'default',
        title: leadName ? `Follow-ups paused · ${leadName}` : 'Follow-ups paused',
      };

    case 'follow_ups_resumed':
      return {
        icon: 'play',
        tone: 'default',
        title: leadName ? `Follow-ups resumed · ${leadName}` : 'Follow-ups resumed',
      };

    case 'sequence_completed':
      return {
        icon: 'check',
        tone: 'default',
        title: 'Follow-up sequence finished',
        description: 'No more automatic follow-ups',
      };

    case 'note_added':
      return {
        icon: 'file-text',
        tone: 'default',
        title: leadName ? `Note on ${leadName}` : 'Note',
        quote: str(m.body),
      };

    case 'contact_logged': {
      const contact = CONTACT_LABELS[str(m.channel) ?? 'other'] ?? CONTACT_LABELS.other!;
      return {
        icon: contact.icon,
        tone: 'default',
        title: leadName ? `${contact.title} · ${leadName}` : contact.title,
        quote: str(m.note),
      };
    }

    case 'lead_updated': {
      const fields = Array.isArray(m.fields)
        ? m.fields.filter((f): f is string => typeof f === 'string')
        : [];
      const labels = fields.map((field) => FIELD_LABELS[field] ?? field);
      return {
        icon: 'edit-2',
        tone: 'default',
        title: leadName ? `${leadName} updated` : 'Details updated',
        description: labels.length > 0 ? capitalize(labels.join(', ')) : undefined,
      };
    }

    case 'message_received':
      return {
        icon: 'inbox',
        tone: 'accent',
        title: `${who} sent a message`,
        quote: str(m.subject),
      };

    default:
      return { icon: 'circle', tone: 'default', title: 'Activity' };
  }
}
