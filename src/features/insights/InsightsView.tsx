'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { db } from '@/lib/db';
import { unwrap } from '@/lib/errors';
import { useNow } from '@/lib/useNow';
import { Card, ErrorState, Segmented, SkeletonRows } from '@/ui/Display';

import { StatusBadge } from '../leads/components/LeadBits';
import { useLeads } from '../leads/hooks';
import { PageHeader } from '../panel/Page';
import { StatTile } from '../today/StatTile';
import { useCurrentWorkspace } from '../workspace/WorkspaceProvider';
import { BarList, ColumnChart } from './charts';
import {
  CONTACT_EVENTS,
  countInto,
  formatHours,
  formatShare,
  makeBuckets,
  RANGES,
  rangeStart,
  sourceCounts,
  stageCounts,
  summarize,
  type InsightEvent,
  type RangeId,
} from './compute';
import styles from './insights.module.css';

async function fetchEvents(workspaceId: string, since: Date): Promise<InsightEvent[]> {
  const result = await db()
    .from('lead_events')
    .select('type, created_at, lead_id')
    .eq('workspace_id', workspaceId)
    .in('type', [...CONTACT_EVENTS])
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })
    .limit(10000);
  return unwrap(result, { title: 'Unable to load insights' });
}

/**
 * How the follow-ups are going: new leads, how fast and how often you reach
 * out, and where leads end up. One date range scopes every number.
 */
export function InsightsView() {
  const now = useNow(5 * 60_000);
  const { workspace } = useCurrentWorkspace();
  const leadsQuery = useLeads();
  const [range, setRange] = useState<RangeId>('90d');
  const since = useMemo(() => rangeStart(now, range), [now, range]);
  const spec = RANGES.find((item) => item.id === range)!;

  const events = useQuery({
    queryKey: ['workspace', workspace.id, 'insight-events', range],
    queryFn: () => fetchEvents(workspace.id, since),
    placeholderData: keepPreviousData,
  });

  const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data]);
  const summary = useMemo(() => summarize(leads, events.data ?? [], since), [leads, events.data, since]);
  const newLeads = useMemo(
    () => countInto(makeBuckets(now, range), leads.map((lead) => lead.created_at)),
    [leads, now, range],
  );
  const followUps = useMemo(
    () => countInto(makeBuckets(now, range), (events.data ?? []).map((event) => event.created_at)),
    [events.data, now, range],
  );
  const stages = useMemo(() => stageCounts(leads), [leads]);
  const sources = useMemo(
    () => sourceCounts(leads.filter((lead) => new Date(lead.created_at) >= since)),
    [leads, since],
  );

  const loading = leadsQuery.isPending || events.isPending;
  const error = leadsQuery.error ?? events.error;
  const period = (bucket: { start: Date }) =>
    spec.bucket === 'month'
      ? bucket.start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      : `Week of ${bucket.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;

  return (
    <>
      <PageHeader title="Insights" subtitle="How your follow-ups are going." />

      <div className={styles.filters}>
        <Segmented
          label="Date range"
          value={range}
          onChange={setRange}
          segments={RANGES.map((item) => ({ value: item.id, label: item.label }))}
        />
      </div>

      {error && !loading ? (
        <Card>
          <ErrorState
            title="Unable to load insights"
            error={error}
            onRetry={() => {
              void leadsQuery.refetch();
              void events.refetch();
            }}
          />
        </Card>
      ) : (
        <div className={events.isPlaceholderData ? styles.refetching : undefined}>
          <div className={styles.stats}>
            <StatTile label="New leads" value={loading ? null : summary.added} hint={spec.label.toLowerCase()} />
            <StatTile
              label="Replied or said yes"
              value={loading ? null : formatShare(summary.answeredShare)}
              hint="of the leads added"
            />
            <StatTile
              label="First contact, typical"
              value={loading ? null : formatHours(summary.medianHoursToFirstContact)}
              hint={`${formatShare(summary.contactedWithinDayShare)} within a day`}
            />
            <StatTile
              label="Won"
              value={loading ? null : summary.won}
              tone={summary.won > 0 ? 'success' : undefined}
              hint={`${summary.lost} lost`}
            />
          </div>

          <div className={styles.grid}>
            <Card title="New leads" subtitle={spec.bucket === 'month' ? 'Per month' : 'Per week'}>
              {loading ? (
                <SkeletonRows rows={3} />
              ) : (
                <ColumnChart buckets={newLeads} unit="new leads" periodLabel={period} />
              )}
            </Card>
            <Card title="Follow-ups done" subtitle="Sent or logged, per period">
              {loading ? (
                <SkeletonRows rows={3} />
              ) : (
                <ColumnChart buckets={followUps} unit="follow-ups" periodLabel={period} />
              )}
            </Card>
            <Card title="Where your leads are now" subtitle={`All ${leads.length} leads`}>
              {loading ? (
                <SkeletonRows rows={3} />
              ) : (
                <BarList
                  items={stages.map((stage) => ({
                    key: stage.status,
                    label: <StatusBadge status={stage.status} />,
                    count: stage.count,
                  }))}
                />
              )}
            </Card>
            <Card title="Where they found you" subtitle={`Leads added, ${spec.label.toLowerCase()}`}>
              {loading ? (
                <SkeletonRows rows={3} />
              ) : sources.length === 0 ? (
                <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No leads in this period.</p>
              ) : (
                <BarList items={sources.map((source) => ({ key: source.label, label: source.label, count: source.count }))} />
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
