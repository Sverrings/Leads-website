import type { LeadWithFollowUp, OpenFollowUp } from '@/lib/models';

export const NOW = new Date('2026-10-05T12:00:00');

export function hoursFromNow(hours: number): string {
  return new Date(NOW.getTime() + hours * 3_600_000).toISOString();
}

export function makeFollowUp(overrides: Partial<OpenFollowUp> = {}): OpenFollowUp {
  return {
    id: 'fu-1',
    status: 'pending',
    step_id: 'step-1',
    step_position: 1,
    scheduled_for: hoursFromNow(24),
    ready_reason: null,
    draft_subject: null,
    draft_body: null,
    last_error: null,
    ...overrides,
  };
}

export function makeLead(overrides: Partial<LeadWithFollowUp> = {}): LeadWithFollowUp {
  return {
    id: 'lead-1',
    workspace_id: 'ws-1',
    name: 'John Hansen',
    email: 'john@example.com',
    phone: '+47 922 41 870',
    company: null,
    inquiry: 'Kitchen renovation',
    source: 'Website',
    status: 'waiting',
    sequence_id: 'seq-1',
    sequence_position: 1,
    follow_ups_paused: false,
    last_contact_at: hoursFromNow(-48),
    next_follow_up_at: null,
    status_changed_at: hoursFromNow(-48),
    created_by: null,
    created_at: hoursFromNow(-72),
    updated_at: hoursFromNow(-48),
    followUp: null,
    ...overrides,
  };
}
