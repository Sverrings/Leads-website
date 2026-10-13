// Shared with the iPhone app: Leads/src/utils/dates.ts. Change both together (see README).
// One difference: the web app is in English, so dates default to English (24-hour) instead of
// the device language, which on a Norwegian computer would mix "ons. 14. okt." into English text.
/**
 * Date helpers. Every function takes `now` explicitly so screens can share one
 * ticking clock and tests stay deterministic. Locale defaults to the device.
 */
const DEFAULT_LOCALE = 'en-GB';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const durations = { MINUTE, HOUR, DAY } as const;

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Whole calendar days between two dates (b - a), ignoring time of day. */
export function calendarDaysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/** "45 minutes", "18 hours", "2 days", "3 weeks". Rounds down, minimum 1 minute. */
export function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  if (abs < HOUR) return plural(Math.max(1, Math.floor(abs / MINUTE)), 'minute');
  if (abs < DAY) return plural(Math.floor(abs / HOUR), 'hour');
  if (abs < 14 * DAY) return plural(Math.floor(abs / DAY), 'day');
  if (abs < 60 * DAY) return plural(Math.floor(abs / (7 * DAY)), 'week');
  return plural(Math.floor(abs / (30 * DAY)), 'month');
}

/** Compact form for dense rows: "now", "5m", "3h", "2d", "3w". */
export function formatDurationShort(ms: number): string {
  const abs = Math.abs(ms);
  if (abs < MINUTE) return 'now';
  if (abs < HOUR) return `${Math.floor(abs / MINUTE)}m`;
  if (abs < DAY) return `${Math.floor(abs / HOUR)}h`;
  if (abs < 14 * DAY) return `${Math.floor(abs / DAY)}d`;
  return `${Math.floor(abs / (7 * DAY))}w`;
}

/** "just now", "5m ago", "3h ago", "2d ago", then a date. */
export function formatRelative(value: string | Date, now: Date, locale?: string): string {
  const date = toDate(value);
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE) return 'just now';
  if (diff < 14 * DAY) return `${formatDurationShort(diff)} ago`;
  return formatShortDate(date, now, locale);
}

/**
 * "in 45 minutes", "in 18 hours", "in 3 days". Rounds to the nearest unit:
 * something due in 2 days 23 hours reads as "in 3 days", not "in 2 days".
 */
export function formatTimeUntil(value: string | Date, now: Date): string {
  const diff = toDate(value).getTime() - now.getTime();
  if (diff <= 0) return 'now';
  if (diff < HOUR) return `in ${plural(Math.max(1, Math.round(diff / MINUTE)), 'minute')}`;
  if (diff < DAY - HOUR / 2) return `in ${plural(Math.max(1, Math.round(diff / HOUR)), 'hour')}`;
  if (diff < 14 * DAY) return `in ${plural(Math.round(diff / DAY), 'day')}`;
  return `in ${formatDuration(diff)}`;
}

/** "10:42" in the device's 12/24h convention. */
export function formatClock(value: string | Date, locale?: string): string {
  return toDate(value).toLocaleTimeString(locale ?? DEFAULT_LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** "Sep 28" this year, "Sep 28, 2025" otherwise. */
export function formatShortDate(value: string | Date, now: Date, locale?: string): string {
  const date = toDate(value);
  return date.toLocaleDateString(locale ?? DEFAULT_LOCALE, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

/** Section headers for feeds: "Today", "Yesterday", "Monday", "Sep 28". */
export function formatDayLabel(value: string | Date, now: Date, locale?: string): string {
  const date = toDate(value);
  const days = calendarDaysBetween(date, now);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 1 && days < 7) return date.toLocaleDateString(locale ?? DEFAULT_LOCALE, { weekday: 'long' });
  return formatShortDate(date, now, locale);
}

/** "Today at 10:00", "Tomorrow at 10:00", "Thu 9 Oct at 10:00". */
export function formatDateTime(value: string | Date, now: Date, locale?: string): string {
  const date = toDate(value);
  const days = calendarDaysBetween(now, date);
  const time = formatClock(date, locale);
  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Tomorrow at ${time}`;
  if (days === -1) return `Yesterday at ${time}`;
  const day = date.toLocaleDateString(locale ?? DEFAULT_LOCALE, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
  return `${day} at ${time}`;
}

/** Local day key for grouping, e.g. "2026-10-05". */
export function dayKey(value: string | Date): string {
  const d = toDate(value);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
