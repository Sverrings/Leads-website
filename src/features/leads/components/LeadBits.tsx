'use client';

import Link from 'next/link';

import type { LeadStatus } from '@/lib/models';
import { Badge, type Tone } from '@/ui/Display';
import { Icon } from '@/ui/Icon';

import type { EnrichedLead } from '../domain/collection';
import type { ActionTone, NextAction } from '../domain/insight';
import { getQuickAction, type QuickAction } from '../domain/quick-action';
import { STATUS_META } from '../domain/status';
import styles from './leads.module.css';

const ACTION_COLOR: Record<ActionTone, string> = {
  accent: 'var(--accent-strong)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  neutral: 'var(--text-2)',
  success: 'var(--success)',
  muted: 'var(--text-3)',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge tone={meta.tone as Tone} dot>
      {meta.label}
    </Badge>
  );
}

export function NextActionText({ action, compact = false }: { action: NextAction; compact?: boolean }) {
  return (
    <span className={styles.next}>
      <span className={styles.nextLabel} style={{ color: ACTION_COLOR[action.tone] }}>
        {action.label}
      </span>
      {action.detail && !compact ? <span className={styles.nextDetail}>{action.detail}</span> : null}
    </span>
  );
}

/** Where a quick action goes on the web: the lead page, with the right panel open. */
export function quickActionHref(lead: Pick<EnrichedLead, 'id' | 'phone'>, action: QuickAction): string {
  switch (action.kind) {
    case 'compose':
      return `/app/leads/${lead.id}?compose=1`;
    case 'edit':
      return `/app/leads/${lead.id}?edit=1`;
    case 'call':
      return `tel:${(lead.phone ?? '').replace(/[^\d+]/g, '')}`;
    case 'open':
    default:
      return `/app/leads/${lead.id}`;
  }
}

export function QuickActionButton({ lead }: { lead: EnrichedLead }) {
  const action = getQuickAction(lead);
  if (!action) return null;
  const href = quickActionHref(lead, action);
  const icon = action.kind === 'call' ? 'phone' : action.kind === 'edit' ? 'edit-2' : action.kind === 'compose' ? 'mail' : 'arrow-right';
  return href.startsWith('tel:') ? (
    <a href={href} className={styles.quick}>
      <Icon name={icon} size={13} />
      {action.label}
    </a>
  ) : (
    <Link href={href} className={styles.quick}>
      <Icon name={icon} size={13} />
      {action.label}
    </Link>
  );
}
