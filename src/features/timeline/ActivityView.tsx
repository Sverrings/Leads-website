'use client';

import { useNow } from '@/lib/useNow';
import { Button } from '@/ui/Button';
import { Card, EmptyState, ErrorState, SkeletonRows } from '@/ui/Display';

import { PageHeader } from '../panel/Page';
import { ActivityList } from './components/ActivityList';
import { useActivity } from './hooks';

/** Everything that happened in the workspace, newest first, a page at a time. */
export function ActivityView() {
  const now = useNow();
  const activity = useActivity();
  const events = activity.data?.pages.flat() ?? [];

  return (
    <>
      <PageHeader title="Activity" subtitle="Follow-ups, replies, notes and changes from everyone in the workspace." />
      <div style={{ maxWidth: 820 }}>
        <Card padded={false}>
          {activity.isPending ? (
            <div style={{ padding: '12px 20px' }}>
              <SkeletonRows rows={6} />
            </div>
          ) : activity.isError ? (
            <ErrorState title="Unable to load activity" error={activity.error} onRetry={() => void activity.refetch()} />
          ) : events.length === 0 ? (
            <EmptyState icon="activity" title="Nothing yet" description="Follow-ups, replies and notes show up here." />
          ) : (
            <>
              <ActivityList events={events} now={now} />
              {activity.hasNextPage ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 20px 20px' }}>
                  <Button onClick={() => void activity.fetchNextPage()} loading={activity.isFetchingNextPage}>
                    Show older
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
