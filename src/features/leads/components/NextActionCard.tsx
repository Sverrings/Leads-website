'use client';

import { formatDateTime } from '@/lib/dates';
import type { LeadStatus, LeadWithFollowUp } from '@/lib/models';
import { Button } from '@/ui/Button';

import type { LeadInsight } from '../domain/insight';
import styles from './detail.module.css';

const TONE_COLOR: Record<string, string> = {
  accent: 'var(--accent-strong)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  neutral: 'var(--text-2)',
  success: 'var(--success)',
  muted: 'var(--text-3)',
};

/**
 * "What do I do now?" One instruction, one main button, and the outcomes
 * people report in their words: they replied, later, won, lost. Same card as
 * the app (Leads/src/features/leads/components/detail/NextActionCard.tsx).
 */
export function NextActionCard({
  lead,
  insight,
  now,
  onFollowUpNow,
  onSchedule,
  onSetStatus,
  busy,
}: {
  lead: LeadWithFollowUp;
  insight: LeadInsight;
  now: Date;
  onFollowUpNow: () => void;
  onSchedule: () => void;
  onSetStatus: (status: LeadStatus) => void;
  busy: boolean;
}) {
  const { nextAction } = insight;
  const active = lead.status === 'new' || lead.status === 'waiting';
  const finished = lead.status === 'converted' || lead.status === 'closed';
  const scheduledFor = lead.followUp?.scheduled_for;
  const primaryLabel = !lead.email
    ? 'Log a call or message'
    : lead.status === 'replied'
      ? 'Write a reply'
      : lead.followUp?.status === 'ready' && lead.followUp.draft_body
        ? 'Review & send'
        : lead.status === 'new' && !lead.last_contact_at
          ? 'Send first reply'
          : 'Follow up now';

  return (
    <section className={`${styles.nextCard} ${insight.attention ? styles.nextCardActive : ''}`}>
      <div className={styles.nextHead}>
        <p className={styles.eyebrow}>What to do now</p>
        <p className={styles.nextTitle}>
          <span className={styles.nextDot} style={{ background: TONE_COLOR[nextAction.tone] }} />
          {nextAction.label}
        </p>
        {nextAction.detail || scheduledFor ? (
          <p className={styles.nextDetail}>
            {[nextAction.detail, scheduledFor && !finished ? formatDateTime(scheduledFor, now) : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
        {lead.followUp?.status === 'ready' && lead.followUp.ready_reason === 'send_failed' ? (
          <p className={styles.danger}>Automatic sending failed. Check the address and try again.</p>
        ) : null}
      </div>

      <div className={styles.nextActions}>
        {!finished ? (
          <Button variant="primary" size="lg" icon={lead.email ? 'send' : 'phone'} onClick={onFollowUpNow}>
            {primaryLabel}
          </Button>
        ) : null}
        {active ? (
          <>
            <Button icon="corner-up-left" onClick={() => onSetStatus('replied')} disabled={busy}>
              They replied
            </Button>
            <Button icon="clock" onClick={onSchedule}>
              Later
            </Button>
          </>
        ) : lead.status === 'replied' ? (
          <>
            <Button icon="award" onClick={() => onSetStatus('converted')} disabled={busy}>
              Won
            </Button>
            <Button icon="x" onClick={() => onSetStatus('closed')} disabled={busy}>
              Lost
            </Button>
          </>
        ) : (
          <Button icon="rotate-ccw" onClick={() => onSetStatus('waiting')} disabled={busy}>
            Reopen
          </Button>
        )}
      </div>
      {active || lead.status === 'replied' ? (
        <p className={styles.hint}>
          {active
            ? 'Click “They replied” when they answer. Follow-ups stop.'
            : 'Did they say yes? Mark it so your list stays clean.'}
        </p>
      ) : null}
    </section>
  );
}
