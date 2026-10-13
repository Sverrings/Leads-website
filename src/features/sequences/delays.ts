// Shared with the iPhone app: Leads/src/features/sequences/domain/delays.ts. Change both together (see README).
const HOUR = 60;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** 1440 -> "1 day", 4320 -> "3 days", 90 -> "90 minutes", 10080 -> "1 week". */
export function formatDelay(minutes: number): string {
  if (minutes <= 0) return 'immediately';
  if (minutes % WEEK === 0) return plural(minutes / WEEK, 'week');
  if (minutes % DAY === 0) return plural(minutes / DAY, 'day');
  if (minutes % HOUR === 0) return plural(minutes / HOUR, 'hour');
  return plural(minutes, 'minute');
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/**
 * Each delay counts from the previous contact, so whole days add up to the day
 * a follow-up lands on: [1, 2, 4] days -> "On day 1, 3 and 7 after a lead is
 * added." Anything else is described step by step. Steps sorted by position.
 */
export function describeSchedule(delays: readonly number[]): string {
  if (delays.length === 0) return 'No follow-up steps.';
  if (delays.every((delay) => delay > 0 && delay % DAY === 0)) {
    let total = 0;
    const days = delays.map((delay) => (total += delay / DAY));
    const last = days.pop();
    const list = days.length ? `${days.join(', ')} and ${last}` : `${last}`;
    return `On day ${list} after a lead is added.`;
  }
  const [first, ...rest] = delays.map(formatDelay);
  return `After ${first}${rest.map((delay) => `, then ${delay}`).join('')}.`;
}

/** Delay choices offered in the step editor. */
export const DELAY_OPTIONS: readonly { minutes: number; label: string }[] = [
  { minutes: 4 * HOUR, label: '4 hours' },
  { minutes: DAY, label: '1 day' },
  { minutes: 2 * DAY, label: '2 days' },
  { minutes: 3 * DAY, label: '3 days' },
  { minutes: 5 * DAY, label: '5 days' },
  { minutes: WEEK, label: '1 week' },
  { minutes: 2 * WEEK, label: '2 weeks' },
  { minutes: 4 * WEEK, label: '4 weeks' },
];
