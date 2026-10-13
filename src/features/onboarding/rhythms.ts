// Shared with the iPhone app: Leads/src/features/onboarding/rhythms.ts. Change both together (see README).
const DAY = 24 * 60;

export type RhythmId = 'relaxed' | 'standard' | 'quick';

export type Rhythm = {
  id: RhythmId;
  label: string;
  /** Delay before each follow-up step, in minutes, measured from the previous contact. */
  delays: readonly [number, number, number];
  schedule: string;
  description: string;
};

/**
 * Follow-up rhythms offered during setup. Each maps onto the three steps every
 * new workspace starts with, so choosing one only changes their delays.
 * Delays count from the previous contact; `schedule` names the resulting day
 * after the lead was added. "Standard" matches the database defaults.
 */
export const RHYTHMS: readonly Rhythm[] = [
  {
    id: 'quick',
    label: 'Quick',
    delays: [1 * DAY, 1 * DAY, 2 * DAY],
    schedule: 'Day 1, 2 and 4',
    description: 'For urgent jobs where the first to answer wins.',
  },
  {
    id: 'standard',
    label: 'Standard',
    delays: [1 * DAY, 2 * DAY, 4 * DAY],
    schedule: 'Day 1, 3 and 7',
    description: 'Works for most service businesses.',
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    delays: [2 * DAY, 3 * DAY, 5 * DAY],
    schedule: 'Day 2, 5 and 10',
    description: 'For bigger decisions that take a while.',
  },
];

export const DEFAULT_RHYTHM: RhythmId = 'standard';

export function getRhythm(id: RhythmId): Rhythm {
  return RHYTHMS.find((rhythm) => rhythm.id === id) ?? (RHYTHMS[1] as Rhythm);
}
