import {
  countInto,
  formatHours,
  formatShare,
  makeBuckets,
  median,
  sourceCounts,
  stageCounts,
  startOfWeek,
  summarize,
  type InsightEvent,
} from '../compute';

const NOW = new Date('2026-10-14T12:00:00'); // a Wednesday

const lead = (id: string, created: string, status = 'waiting', changed = created, source: string | null = null) => ({
  id,
  created_at: created,
  status: status as 'new' | 'waiting' | 'replied' | 'converted' | 'closed',
  status_changed_at: changed,
  last_contact_at: null,
  source,
});

describe('buckets', () => {
  it('weeks start on Monday', () => {
    expect(startOfWeek(NOW).toDateString()).toBe(new Date('2026-10-12T00:00:00').toDateString());
  });

  it('30 days are 5 weeks, the current one last', () => {
    const buckets = makeBuckets(NOW, '30d');
    expect(buckets).toHaveLength(5);
    expect(buckets.at(-1)?.current).toBe(true);
    expect(buckets.filter((bucket) => bucket.current)).toHaveLength(1);
  });

  it('12 months are monthly', () => {
    const buckets = makeBuckets(NOW, '12m');
    expect(buckets).toHaveLength(12);
    expect(buckets.at(-1)?.start.getMonth()).toBe(9);
  });

  it('counts dates into their week and ignores older ones', () => {
    const counted = countInto(makeBuckets(NOW, '30d'), [
      '2026-10-13T09:00:00',
      '2026-10-14T08:00:00',
      '2026-10-06T10:00:00',
      '2025-01-01T10:00:00',
    ]);
    expect(counted.at(-1)?.value).toBe(2);
    expect(counted.at(-2)?.value).toBe(1);
    expect(counted.reduce((sum, bucket) => sum + bucket.value, 0)).toBe(3);
  });

  it('counts dates into months', () => {
    const counted = countInto(makeBuckets(NOW, '12m'), ['2026-10-01T09:00:00', '2026-09-30T09:00:00']);
    expect(counted.at(-1)?.value).toBe(1);
    expect(counted.at(-2)?.value).toBe(1);
  });
});

describe('summarize', () => {
  const since = new Date('2026-09-15T00:00:00');
  const leads = [
    lead('a', '2026-10-01T09:00:00', 'replied'),
    lead('b', '2026-10-02T09:00:00', 'converted', '2026-10-10T09:00:00'),
    lead('c', '2026-10-03T09:00:00', 'waiting'),
    lead('d', '2026-10-04T09:00:00', 'closed', '2026-10-09T09:00:00'),
    lead('old', '2026-08-01T09:00:00', 'converted', '2026-08-10T09:00:00'),
  ];
  const events: InsightEvent[] = [
    { type: 'follow_up_sent', created_at: '2026-10-01T15:00:00', lead_id: 'a' }, // 6 h
    { type: 'contact_logged', created_at: '2026-10-03T09:00:00', lead_id: 'b' }, // 24 h
    { type: 'follow_up_sent', created_at: '2026-10-05T09:00:00', lead_id: 'b' }, // later, ignored
    { type: 'follow_up_sent', created_at: '2026-10-07T09:00:00', lead_id: 'c' }, // 96 h
    { type: 'lead_created', created_at: '2026-10-04T09:00:00', lead_id: 'd' }, // not contact
  ];

  it('counts what happened in the range', () => {
    const summary = summarize(leads, events, since);
    expect(summary.added).toBe(4);
    expect(summary.answeredShare).toBe(0.5);
    expect(summary.won).toBe(1);
    expect(summary.lost).toBe(1);
    expect(summary.active).toBe(2);
  });

  it('measures time to first contact from the earliest contact', () => {
    const summary = summarize(leads, events, since);
    expect(summary.medianHoursToFirstContact).toBe(24);
    expect(summary.contactedWithinDayShare).toBe(0.5);
  });

  it('has nothing to say about an empty range', () => {
    const summary = summarize([], [], since);
    expect(summary.answeredShare).toBeNull();
    expect(summary.medianHoursToFirstContact).toBeNull();
  });
});

describe('helpers', () => {
  it('median', () => {
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it('stages in lifecycle order', () => {
    expect(stageCounts([lead('a', NOW.toISOString(), 'closed'), lead('b', NOW.toISOString(), 'new')]).map((s) => s.count)).toEqual([
      1, 0, 0, 0, 1,
    ]);
  });

  it('folds small sources into Other', () => {
    const leads = ['Web', 'Web', 'Web', 'Phone', 'Phone', 'A', 'B', null].map((source, index) =>
      lead(String(index), NOW.toISOString(), 'new', NOW.toISOString(), source),
    );
    expect(sourceCounts(leads, 2)).toEqual([
      { label: 'Web', count: 3 },
      { label: 'Phone', count: 2 },
      { label: 'Other', count: 3 },
    ]);
  });

  it('formats', () => {
    expect(formatHours(0.5)).toBe('30 min');
    expect(formatHours(6.4)).toBe('6 h');
    expect(formatHours(60)).toBe('2.5 days');
    expect(formatHours(null)).toBe('–');
    expect(formatShare(0.834)).toBe('83%');
  });
});
