import { addDays, startOfDay } from '@/lib/dates';
import type { Lead, LeadEventType, LeadStatus } from '@/lib/models';

/**
 * Numbers for the Insights page, computed from the leads and their events.
 * Pure functions, so they are tested without a database.
 */

export type RangeId = '30d' | '90d' | '12m';

export const RANGES: { id: RangeId; label: string; days: number; bucket: 'week' | 'month' }[] = [
  { id: '30d', label: 'Last 30 days', days: 30, bucket: 'week' },
  { id: '90d', label: 'Last 90 days', days: 90, bucket: 'week' },
  { id: '12m', label: 'Last 12 months', days: 365, bucket: 'month' },
];

export type InsightEvent = { type: LeadEventType; created_at: string; lead_id: string };

/** Events that count as reaching out to someone. */
export const CONTACT_EVENTS: LeadEventType[] = ['follow_up_sent', 'contact_logged'];

export type Bucket = { start: Date; label: string; value: number; current: boolean };

/** Monday 00:00 of the week `date` falls in. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const offset = (day.getDay() + 6) % 7;
  return addDays(day, -offset);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Empty buckets covering the range, oldest first, the current one last. */
export function makeBuckets(now: Date, range: RangeId): Bucket[] {
  const spec = RANGES.find((item) => item.id === range)!;
  const buckets: Bucket[] = [];
  if (spec.bucket === 'month') {
    for (let index = 11; index >= 0; index -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - index, 1);
      buckets.push({
        start,
        label: start.toLocaleDateString('en-GB', { month: 'short' }),
        value: 0,
        current: index === 0,
      });
    }
    return buckets;
  }
  const weeks = Math.ceil(spec.days / 7);
  const thisWeek = startOfWeek(now);
  for (let index = weeks - 1; index >= 0; index -= 1) {
    const start = addDays(thisWeek, -7 * index);
    buckets.push({
      start,
      label: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: 0,
      current: index === 0,
    });
  }
  return buckets;
}

/** Counts dates into buckets; dates before the first bucket are ignored. */
export function countInto(buckets: Bucket[], dates: readonly (string | Date)[]): Bucket[] {
  const result = buckets.map((bucket) => ({ ...bucket }));
  const monthly = result.length > 1 && result[1]!.start.getDate() === 1 && result[0]!.start.getDate() === 1;
  for (const value of dates) {
    const date = typeof value === 'string' ? new Date(value) : value;
    const key = monthly ? startOfMonth(date).getTime() : startOfWeek(date).getTime();
    const bucket = result.find((item) => item.start.getTime() === key);
    if (bucket) bucket.value += 1;
  }
  return result;
}

export function rangeStart(now: Date, range: RangeId): Date {
  const spec = RANGES.find((item) => item.id === range)!;
  return startOfDay(addDays(now, -(spec.days - 1)));
}

export type StageCount = { status: LeadStatus; count: number };

const ACTIVE: LeadStatus[] = ['new', 'waiting', 'replied'];

export type Summary = {
  added: number;
  /** Leads added in the range that replied or were won, as a share of those added. */
  answeredShare: number | null;
  won: number;
  lost: number;
  /** Median hours from being added to the first follow-up or logged contact. */
  medianHoursToFirstContact: number | null;
  /** Share of leads added in the range that were contacted within 24 hours. */
  contactedWithinDayShare: number | null;
  active: number;
};

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

export function summarize(
  leads: readonly Pick<Lead, 'id' | 'created_at' | 'status' | 'status_changed_at' | 'last_contact_at'>[],
  events: readonly InsightEvent[],
  since: Date,
): Summary {
  const inRange = leads.filter((lead) => new Date(lead.created_at) >= since);

  const firstContact = new Map<string, number>();
  for (const event of events) {
    if (!CONTACT_EVENTS.includes(event.type)) continue;
    const at = new Date(event.created_at).getTime();
    const current = firstContact.get(event.lead_id);
    if (current === undefined || at < current) firstContact.set(event.lead_id, at);
  }

  const hours: number[] = [];
  let withinDay = 0;
  for (const lead of inRange) {
    const contact = firstContact.get(lead.id);
    if (contact === undefined) continue;
    const delta = Math.max(0, contact - new Date(lead.created_at).getTime()) / 3_600_000;
    hours.push(delta);
    if (delta <= 24) withinDay += 1;
  }

  const answered = inRange.filter((lead) => lead.status === 'replied' || lead.status === 'converted').length;
  const changedInRange = (status: LeadStatus) =>
    leads.filter((lead) => lead.status === status && new Date(lead.status_changed_at) >= since).length;

  return {
    added: inRange.length,
    answeredShare: inRange.length ? answered / inRange.length : null,
    won: changedInRange('converted'),
    lost: changedInRange('closed'),
    medianHoursToFirstContact: median(hours),
    contactedWithinDayShare: inRange.length ? withinDay / inRange.length : null,
    active: leads.filter((lead) => ACTIVE.includes(lead.status)).length,
  };
}

/** Where every lead is now, in lifecycle order. */
export function stageCounts(leads: readonly Pick<Lead, 'status'>[]): StageCount[] {
  const order: LeadStatus[] = ['new', 'waiting', 'replied', 'converted', 'closed'];
  return order.map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length }));
}

/** Top sources by count, the rest folded into "Other". Missing sources are "Not recorded". */
export function sourceCounts(
  leads: readonly Pick<Lead, 'source'>[],
  limit = 6,
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const key = lead.source?.trim() || 'Not recorded';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = sorted.slice(0, limit).map(([label, count]) => ({ label, count }));
  const rest = sorted.slice(limit).reduce((sum, [, count]) => sum + count, 0);
  return rest > 0 ? [...top, { label: 'Other', count: rest }] : top;
}

/** "45 min", "6 h", "2.5 days". */
export function formatHours(hours: number | null): string {
  if (hours === null) return '–';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${Math.round(hours)} h`;
  const days = hours / 24;
  return `${days < 10 ? days.toFixed(1).replace(/\.0$/, '') : Math.round(days)} days`;
}

export function formatShare(share: number | null): string {
  return share === null ? '–' : `${Math.round(share * 100)}%`;
}
