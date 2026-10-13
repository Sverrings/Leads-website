'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { formatDateTime, formatShortDate } from '@/lib/dates';
import type { LeadStatus, LeadWithFollowUp } from '@/lib/models';
import { useNow } from '@/lib/useNow';
import { Button } from '@/ui/Button';
import { Avatar, Card, ErrorState, Skeleton, SkeletonRows } from '@/ui/Display';
import { useConfirm } from '@/ui/Dialog';
import { Icon } from '@/ui/Icon';
import { Menu } from '@/ui/Menu';
import { useToast } from '@/ui/Toast';

import { isLeadLimitError } from '../billing/plans';
import { ComposeDialog } from '../follow-ups/ComposeDialog';
import { LogContactDialog, ScheduleDialog } from '../follow-ups/FollowUpDialogs';
import { useSetFollowUpsPaused } from '../follow-ups/hooks';
import { PageHeader } from '../panel/Page';
import { LeadTimelineCard } from '../timeline/components/LeadTimelineCard';
import detail from './components/detail.module.css';
import { EditLeadDialog } from './components/EditLeadDialog';
import { StatusBadge } from './components/LeadBits';
import { NextActionCard } from './components/NextActionCard';
import { getLastContactLabel } from './domain/insight';
import { LEAD_STATUSES, STATUS_META } from './domain/status';
import { useDeleteLead, useLead, useLeadInsight, useUpdateLeadStatus } from './hooks';

const STATUS_TOAST: Record<LeadStatus, string> = {
  new: 'Marked as new',
  waiting: 'Marked as waiting',
  replied: 'Marked as replied. Follow-ups stopped.',
  converted: 'Marked as won',
  closed: 'Marked as lost',
};

type Panel = 'compose' | 'edit' | 'log' | 'schedule' | null;

export function LeadView({ id }: { id: string }) {
  const leadQuery = useLead(id);

  if (!leadQuery.data) {
    return (
      <>
        <PageHeader title={<Skeleton width={220} height={28} />} back={{ href: '/app/leads', label: 'Leads' }} />
        {leadQuery.isError ? (
          <Card>
            <ErrorState title="Unable to load lead" error={leadQuery.error} onRetry={() => void leadQuery.refetch()} />
          </Card>
        ) : (
          <Card>
            <SkeletonRows rows={4} />
          </Card>
        )}
      </>
    );
  }
  return <LeadDetail lead={leadQuery.data} />;
}

function LeadDetail({ lead }: { lead: LeadWithFollowUp }) {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const now = useNow();
  const insight = useLeadInsight(lead);
  const updateStatus = useUpdateLeadStatus(lead.id);
  const setPaused = useSetFollowUpsPaused(lead.id);
  const deleteLead = useDeleteLead(lead.id);
  const [panel, setPanel] = useState<Panel>(() =>
    params.get('compose') ? 'compose' : params.get('edit') ? 'edit' : null,
  );
  const [limitNotice, setLimitNotice] = useState(false);

  const closePanel = () => {
    setPanel(null);
    // Drop ?compose=1 / ?edit=1 so a reload doesn't reopen the dialog.
    if (params.get('compose') || params.get('edit')) router.replace(`/app/leads/${lead.id}`, { scroll: false });
  };

  const changeStatus = (status: LeadStatus) =>
    updateStatus.mutate(status, {
      onSuccess: () => toast.success(STATUS_TOAST[status]),
      onError: (error) => {
        if (isLeadLimitError(error)) setLimitNotice(true);
        else toast.error(error, 'Unable to change status');
      },
    });

  const followUpNow = () => setPanel(lead.email ? 'compose' : 'log');

  const togglePaused = () =>
    setPaused.mutate(!lead.follow_ups_paused, {
      onSuccess: () => toast.success(lead.follow_ups_paused ? 'Follow-ups resumed' : 'Follow-ups paused'),
      onError: (error) => toast.error(error),
    });

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${lead.name}?`,
      message: 'Their details, notes and history are removed. This cannot be undone.',
      confirmLabel: 'Delete lead',
      destructive: true,
    });
    if (!ok) return;
    deleteLead.mutate(undefined, {
      onSuccess: () => {
        toast.success('Lead deleted');
        router.push('/app/leads');
      },
      onError: (error) => toast.error(error, 'Unable to delete lead'),
    });
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      // Copying is a convenience; the value is on screen.
    }
  };

  const canSchedule = lead.status !== 'converted' && lead.status !== 'closed';

  return (
    <>
      <PageHeader
        back={{ href: '/app/leads', label: 'Leads' }}
        title={
          <span className={detail.titleRow}>
            <Avatar name={lead.name} size={40} />
            {lead.name}
          </span>
        }
        subtitle={
          <span className={detail.badges}>
            <Menu
              label="Status"
              align="left"
              entries={LEAD_STATUSES.map((status) => ({
                label: STATUS_META[status].label,
                icon: status === lead.status ? 'check' : 'circle',
                onSelect: () => status !== lead.status && changeStatus(status),
              }))}
              trigger={({ toggle }) => (
                <button type="button" className={detail.badgeButton} onClick={toggle} aria-label="Change status">
                  <StatusBadge status={lead.status} />
                  <Icon name="chevron-down" size={13} />
                </button>
              )}
            />
            {lead.company ? <span>{lead.company}</span> : null}
            {lead.follow_ups_paused ? <span style={{ color: 'var(--text-3)' }}>Follow-ups paused</span> : null}
          </span>
        }
        actions={
          <>
            <Button icon="edit-2" onClick={() => setPanel('edit')}>
              Edit
            </Button>
            <Menu
              label="More actions"
              entries={[
                { label: 'Log a call or message', icon: 'phone', onSelect: () => setPanel('log') },
                ...(canSchedule
                  ? [{ label: 'Schedule follow-up', icon: 'calendar' as const, onSelect: () => setPanel('schedule') }]
                  : []),
                {
                  label: lead.follow_ups_paused ? 'Resume follow-ups' : 'Pause follow-ups',
                  icon: lead.follow_ups_paused ? 'play' : 'pause',
                  onSelect: togglePaused,
                },
                'divider',
                { label: 'Delete lead', icon: 'trash-2', destructive: true, onSelect: () => void remove() },
              ]}
              trigger={({ toggle, open }) => (
                <Button icon="more-horizontal" aria-label="More actions" aria-expanded={open} onClick={toggle} />
              )}
            />
          </>
        }
      />

      {limitNotice ? (
        <Card className={detail.column}>
          <p style={{ fontSize: 14 }}>
            The free plan includes a few active leads at a time. Mark another lead Won or Lost to reopen this one, or get
            Leads Pro in the iPhone app (Settings → Leads Pro).
          </p>
        </Card>
      ) : null}

      <div className={detail.layout} style={limitNotice ? { marginTop: 20 } : undefined}>
        <div className={detail.column}>
          {insight ? (
            <NextActionCard
              lead={lead}
              insight={insight}
              now={now}
              onFollowUpNow={followUpNow}
              onSchedule={() => setPanel('schedule')}
              onSetStatus={changeStatus}
              busy={updateStatus.isPending}
            />
          ) : null}

          <Card title="Contact">
            <dl className={detail.facts}>
              <div className={detail.fact}>
                <dt>Email</dt>
                <dd>
                  {lead.email ? (
                    <>
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      <button type="button" className={detail.copy} aria-label="Copy email" onClick={() => void copy(lead.email!, 'Email')}>
                        <Icon name="copy" size={13} />
                      </button>
                    </>
                  ) : (
                    <span className={detail.placeholder}>Not added</span>
                  )}
                </dd>
              </div>
              <div className={detail.fact}>
                <dt>Phone</dt>
                <dd>
                  {lead.phone ? (
                    <>
                      <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}>{lead.phone}</a>
                      <button type="button" className={detail.copy} aria-label="Copy phone" onClick={() => void copy(lead.phone!, 'Phone')}>
                        <Icon name="copy" size={13} />
                      </button>
                    </>
                  ) : (
                    <span className={detail.placeholder}>Not added</span>
                  )}
                </dd>
              </div>
              <div className={detail.fact}>
                <dt>Company</dt>
                <dd>{lead.company ?? <span className={detail.placeholder}>Not added</span>}</dd>
              </div>
              <div className={detail.fact}>
                <dt>Found you through</dt>
                <dd>{lead.source ?? <span className={detail.placeholder}>Not added</span>}</dd>
              </div>
              <div className={detail.fact}>
                <dt>Last contact</dt>
                <dd>{getLastContactLabel(lead, now)}</dd>
              </div>
              <div className={detail.fact}>
                <dt>Added</dt>
                <dd>{formatShortDate(lead.created_at, now)}</dd>
              </div>
              {lead.followUp && canSchedule ? (
                <div className={detail.fact}>
                  <dt>Next follow-up</dt>
                  <dd>{formatDateTime(lead.followUp.scheduled_for, now)}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card title="What they asked about">
            {lead.inquiry ? (
              <p className={detail.inquiry}>{lead.inquiry}</p>
            ) : (
              <p className={detail.placeholder}>
                Nothing written down yet.{' '}
                <button type="button" className={detail.copy} style={{ color: 'var(--accent-strong)' }} onClick={() => setPanel('edit')}>
                  Add it
                </button>
              </p>
            )}
          </Card>
        </div>

        <div className={detail.column}>
          <LeadTimelineCard leadId={lead.id} now={now} />
        </div>
      </div>

      <ComposeDialog lead={lead} open={panel === 'compose'} onClose={closePanel} />
      <EditLeadDialog lead={lead} open={panel === 'edit'} onClose={closePanel} onLimit={() => setLimitNotice(true)} />
      <LogContactDialog lead={lead} open={panel === 'log'} onClose={closePanel} />
      <ScheduleDialog lead={lead} open={panel === 'schedule'} onClose={closePanel} />
    </>
  );
}
