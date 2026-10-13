'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { formatDateTime, startOfDay } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { getFirstName, pluralize } from '@/lib/strings';
import { ButtonLink } from '@/ui/Button';
import { Avatar, Card, EmptyState, ErrorState, SkeletonRows } from '@/ui/Display';

import { usePlan } from '../billing/hooks';
import { NextActionText, QuickActionButton } from '../leads/components/LeadBits';
import leadStyles from '../leads/components/leads.module.css';
import { selectNeedsAttention, selectUpcoming, type EnrichedLead } from '../leads/domain/collection';
import { useEnrichedLeads } from '../leads/hooks';
import { PageHeader, SectionTitle } from '../panel/Page';
import { ActivityList } from '../timeline/components/ActivityList';
import { useRecentActivity } from '../timeline/hooks';
import { useProfile } from '../workspace/hooks';
import { StatTile } from './StatTile';
import styles from './today.module.css';

/**
 * Today answers one question within seconds: who needs me right now? Then
 * what is coming up, and what happened lately. Same rules as the app's Today.
 */
export function TodayView() {
  const now = useNow();
  const leadsQuery = useEnrichedLeads();
  const profile = useProfile();
  const plan = usePlan();
  const recent = useRecentActivity(6);
  const { leads } = leadsQuery;

  const attention = useMemo(() => selectNeedsAttention(leads), [leads]);
  const upcoming = useMemo(() => selectUpcoming(leads, now), [leads, now]);
  const wonThisMonth = useMemo(() => {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return leads.filter(
      (lead) => lead.status === 'converted' && new Date(lead.status_changed_at).getTime() >= monthStart,
    ).length;
  }, [leads, now]);
  const addedThisWeek = useMemo(() => {
    const weekAgo = startOfDay(new Date(now.getTime() - 6 * 86_400_000)).getTime();
    return leads.filter((lead) => new Date(lead.created_at).getTime() >= weekAgo).length;
  }, [leads, now]);

  const firstName = getFirstName(profile.data?.display_name ?? '');
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const summary = leadsQuery.isPending
    ? ' '
    : leads.length === 0
      ? "Add a lead and you'll see exactly when to follow up."
      : attention.length > 0
        ? `${pluralize(attention.length, 'lead')} ${attention.length === 1 ? 'needs' : 'need'} you${
            upcoming.length > 0 ? `, ${upcoming.length} coming up this week` : ''
          }.`
        : upcoming.length > 0
          ? `You're caught up. ${pluralize(upcoming.length, 'follow-up')} this week.`
          : "You're caught up.";

  return (
    <>
      <PageHeader
        title={firstName ? `${greeting}, ${firstName}` : 'Today'}
        subtitle={summary}
        actions={
          <ButtonLink href="/app/leads/new" variant="primary" icon="plus">
            New lead
          </ButtonLink>
        }
      />

      {leadsQuery.isError ? (
        <Card>
          <ErrorState title="Unable to load leads" error={leadsQuery.error} onRetry={() => void leadsQuery.refetch()} />
        </Card>
      ) : (
        <>
          <div className={styles.stats}>
            <StatTile label="Need you now" value={leadsQuery.isPending ? null : attention.length} tone={attention.length > 0 ? 'accent' : undefined} />
            <StatTile label="Follow-ups this week" value={leadsQuery.isPending ? null : upcoming.length} />
            <StatTile label="Added in the last 7 days" value={leadsQuery.isPending ? null : addedThisWeek} />
            <StatTile
              label={plan.enabled && !plan.pro ? `Active leads (free plan: ${plan.freeLimit})` : 'Won this month'}
              value={leadsQuery.isPending ? null : plan.enabled && !plan.pro ? plan.activeLeads : wonThisMonth}
              tone={plan.enabled && !plan.pro ? (plan.atLimit ? 'warning' : undefined) : wonThisMonth > 0 ? 'success' : undefined}
            />
          </div>

          <div className={styles.columns}>
            <div className={styles.primary}>
              <SectionTitle>Needs you</SectionTitle>
              <Card padded={false}>
                {leadsQuery.isPending ? (
                  <div style={{ padding: '12px 20px' }}>
                    <SkeletonRows rows={4} />
                  </div>
                ) : leads.length === 0 ? (
                  <EmptyState
                    icon="user-plus"
                    title="Add your first lead"
                    description="Someone who called, emailed or messaged about a job. Their name is enough to start."
                    action={
                      <ButtonLink href="/app/leads/new" variant="primary" icon="plus">
                        New lead
                      </ButtonLink>
                    }
                  />
                ) : attention.length === 0 ? (
                  <EmptyState
                    icon="check-circle"
                    title="Nobody is waiting on you"
                    description={
                      upcoming[0]
                        ? `Next: ${upcoming[0].name}, ${formatDateTime(upcoming[0].followUp!.scheduled_for, now).toLowerCase()}.`
                        : 'New follow-ups show up here on the day they are due.'
                    }
                  />
                ) : (
                  <ul className={leadStyles.rows}>
                    {attention.map((lead) => (
                      <AttentionRow key={lead.id} lead={lead} />
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className={styles.secondary}>
              <SectionTitle aside={<Link href="/app/leads" className={styles.more}>All leads</Link>}>
                Coming up
              </SectionTitle>
              <Card padded={false}>
                {leadsQuery.isPending ? (
                  <div style={{ padding: '12px 20px' }}>
                    <SkeletonRows rows={3} />
                  </div>
                ) : upcoming.length === 0 ? (
                  <p className={styles.quiet}>No follow-ups in the next 7 days.</p>
                ) : (
                  <ul className={leadStyles.rows}>
                    {upcoming.slice(0, 6).map((lead) => (
                      <li key={lead.id}>
                        <Link href={`/app/leads/${lead.id}`} className={`${leadStyles.row} ${styles.compactRow}`}>
                          <Avatar name={lead.name} size={28} />
                          <span className={leadStyles.who} style={{ flex: 1 }}>
                            <span className={leadStyles.name}>{lead.name}</span>
                            <span className={leadStyles.context}>{lead.insight.nextAction.detail}</span>
                          </span>
                          <span className={leadStyles.when}>
                            {formatDateTime(lead.followUp!.scheduled_for, now)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <div className={styles.spacer} />
              <SectionTitle aside={<Link href="/app/activity" className={styles.more}>All activity</Link>}>
                Lately
              </SectionTitle>
              <Card padded={false}>
                {recent.isPending ? (
                  <div style={{ padding: '12px 20px' }}>
                    <SkeletonRows rows={3} />
                  </div>
                ) : recent.isError ? (
                  <ErrorState title="Unable to load activity" error={recent.error} onRetry={() => void recent.refetch()} />
                ) : recent.events.length === 0 ? (
                  <p className={styles.quiet}>Nothing has happened yet.</p>
                ) : (
                  <ActivityList events={recent.events} now={now} compact />
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function AttentionRow({ lead }: { lead: EnrichedLead }) {
  return (
    <li>
      <div className={leadStyles.row}>
        <Avatar name={lead.name} size={34} />
        <Link href={`/app/leads/${lead.id}`} className={leadStyles.rowMain}>
          <span className={leadStyles.who}>
            <span className={leadStyles.name}>{lead.name}</span>
            <span className={leadStyles.context}>
              {[lead.company, lead.inquiry].filter(Boolean).join(' · ') || lead.email || lead.phone || 'No details yet'}
            </span>
          </span>
          <NextActionText action={lead.insight.nextAction} />
        </Link>
        <QuickActionButton lead={lead} />
      </div>
    </li>
  );
}
