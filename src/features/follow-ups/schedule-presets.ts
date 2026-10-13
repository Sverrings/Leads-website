// Shared with the iPhone app: Leads/src/features/follow-ups/domain/schedule-presets.ts. Change both together (see README).
import { addDays } from '@/lib/dates';

export type SchedulePreset = {
  id: 'later_today' | 'tomorrow' | 'in_3_days' | 'next_week';
  label: string;
  at: Date;
};

function at(date: Date, hours: number, minutes = 0): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * One-tap times for "when should I follow up?". Business-hours friendly:
 * mornings at 09:00, "later today" only while there is a working day left.
 */
export function getSchedulePresets(now: Date): SchedulePreset[] {
  const presets: SchedulePreset[] = [];

  if (now.getHours() < 15) {
    presets.push({ id: 'later_today', label: 'Later today', at: at(now, 16) });
  }

  presets.push({ id: 'tomorrow', label: 'Tomorrow morning', at: at(addDays(now, 1), 9) });
  presets.push({ id: 'in_3_days', label: 'In 3 days', at: at(addDays(now, 3), 9) });

  // Next Monday (or the Monday after, if today is Monday).
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  presets.push({ id: 'next_week', label: 'Next week', at: at(addDays(now, daysUntilMonday), 9) });

  return presets;
}

/** Default selection for the custom picker: tomorrow at 10:00. */
export function defaultCustomTime(now: Date): Date {
  return at(addDays(now, 1), 10);
}
