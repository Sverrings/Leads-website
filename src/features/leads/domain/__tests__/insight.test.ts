import { getLastContactLabel, getLeadInsight } from '../insight';
import { hoursFromNow, makeFollowUp, makeLead, NOW } from './fixtures';

const manual = { now: NOW, autoSendEnabled: false, locale: 'en-GB' };
const automatic = { now: NOW, autoSendEnabled: true, locale: 'en-GB' };

describe('getLeadInsight', () => {
  it('asks for a reply when the customer has replied', () => {
    const insight = getLeadInsight(
      makeLead({ status: 'replied', status_changed_at: hoursFromNow(-3) }),
      manual,
    );
    expect(insight.stage).toBe('replied');
    expect(insight.attention).toBe('customer_replied');
    expect(insight.nextAction.label).toBe('Reply to John');
    expect(insight.nextAction.detail).toBe('Replied 3h ago');
  });

  it('flags a new lead that was never contacted', () => {
    const insight = getLeadInsight(
      makeLead({
        status: 'new',
        last_contact_at: null,
        created_at: hoursFromNow(-2),
        followUp: makeFollowUp(),
      }),
      manual,
    );
    expect(insight.stage).toBe('needs_follow_up');
    expect(insight.attention).toBe('first_response');
    expect(insight.nextAction.label).toBe('Send first response');
  });

  it('shows a follow-up due later today', () => {
    const insight = getLeadInsight(
      makeLead({ followUp: makeFollowUp({ scheduled_for: hoursFromNow(3), step_position: 2 }) }),
      manual,
    );
    expect(insight.attention).toBe('follow_up_today');
    expect(insight.nextAction.label).toBe('Follow up today');
    expect(insight.nextAction.detail).toMatch(/^Follow-up #2 · 15:00$/);
  });

  it('escalates follow-ups that are more than a day overdue', () => {
    const insight = getLeadInsight(
      makeLead({ followUp: makeFollowUp({ scheduled_for: hoursFromNow(-50) }) }),
      manual,
    );
    expect(insight.attention).toBe('follow_up_overdue');
    expect(insight.nextAction.tone).toBe('warning');
    expect(insight.nextAction.detail).toBe('Follow-up #1 · 2 days overdue');
  });

  it('does not ask for attention when the backend will send automatically', () => {
    const insight = getLeadInsight(
      makeLead({ followUp: makeFollowUp({ scheduled_for: hoursFromNow(2) }) }),
      automatic,
    );
    expect(insight.stage).toBe('waiting');
    expect(insight.attention).toBeNull();
    expect(insight.nextAction.label).toBe('Sends today at 14:00');
  });

  it('still asks for attention when automatic sending is impossible (no email)', () => {
    const insight = getLeadInsight(
      makeLead({ email: null, followUp: makeFollowUp({ scheduled_for: hoursFromNow(-1) }) }),
      automatic,
    );
    expect(insight.stage).toBe('needs_follow_up');
  });

  it('describes drafts waiting for approval', () => {
    const insight = getLeadInsight(
      makeLead({
        followUp: makeFollowUp({
          status: 'ready',
          ready_reason: 'approval_required',
          step_position: 2,
        }),
      }),
      manual,
    );
    expect(insight.attention).toBe('draft_ready');
    expect(insight.nextAction).toMatchObject({
      label: 'Review follow-up',
      detail: 'Follow-up #2 is ready to send',
    });
  });

  it('suggests calling when there is no email address', () => {
    const insight = getLeadInsight(
      makeLead({
        email: null,
        followUp: makeFollowUp({ status: 'ready', ready_reason: 'missing_contact' }),
      }),
      manual,
    );
    expect(insight.nextAction.label).toBe('Call John');
  });

  it('highlights failed sends', () => {
    const insight = getLeadInsight(
      makeLead({ followUp: makeFollowUp({ status: 'ready', ready_reason: 'send_failed' }) }),
      manual,
    );
    expect(insight.attention).toBe('send_failed');
    expect(insight.nextAction.tone).toBe('danger');
  });

  it('shows the countdown for future follow-ups', () => {
    const insight = getLeadInsight(
      makeLead({ followUp: makeFollowUp({ scheduled_for: hoursFromNow(18), step_position: 2 }) }),
      manual,
    );
    expect(insight.stage).toBe('waiting');
    expect(insight.nextAction.label).toBe('Follow up in 18 hours');
  });

  it('knows when follow-ups are paused', () => {
    const insight = getLeadInsight(makeLead({ follow_ups_paused: true }), manual);
    expect(insight.nextAction.label).toBe('Follow-ups paused');
  });

  it('never asks for attention on converted or closed leads', () => {
    expect(getLeadInsight(makeLead({ status: 'converted' }), manual).attention).toBeNull();
    expect(getLeadInsight(makeLead({ status: 'closed' }), manual).stage).toBe('closed');
  });
});

describe('getLastContactLabel', () => {
  it('reads naturally', () => {
    expect(getLastContactLabel({ last_contact_at: hoursFromNow(-49) }, NOW)).toBe(
      '2 days since last contact',
    );
    expect(getLastContactLabel({ last_contact_at: null }, NOW)).toBe('No contact yet');
  });
});
