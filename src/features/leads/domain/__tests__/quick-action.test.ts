import { getQuickAction } from '../quick-action';

const lead = (
  attention: Parameters<typeof getQuickAction>[0]['insight']['attention'],
  contact = {},
) => ({
  email: 'sarah@example.com' as string | null,
  phone: '+1 555 0100' as string | null,
  ...contact,
  insight: { attention },
});

describe('getQuickAction', () => {
  it('shows nothing when no action is due', () => {
    expect(getQuickAction(lead(null))).toBeNull();
  });

  it('replies to customers who wrote back or just asked', () => {
    expect(getQuickAction(lead('customer_replied'))).toEqual({ label: 'Reply', kind: 'compose' });
    expect(getQuickAction(lead('first_response'))).toEqual({ label: 'Reply', kind: 'compose' });
  });

  it('opens a ready draft for review', () => {
    expect(getQuickAction(lead('draft_ready'))).toEqual({ label: 'Review', kind: 'compose' });
  });

  it('follows up by email, by phone, or asks for contact details', () => {
    expect(getQuickAction(lead('follow_up_today'))).toEqual({
      label: 'Follow up',
      kind: 'compose',
    });
    expect(getQuickAction(lead('follow_up_overdue', { email: null }))).toEqual({
      label: 'Call',
      kind: 'call',
    });
    expect(getQuickAction(lead('reminder_due', { email: null, phone: null }))).toEqual({
      label: 'Add email',
      kind: 'edit',
    });
  });

  it('sends failed follow-ups to the lead to fix', () => {
    expect(getQuickAction(lead('send_failed'))).toEqual({ label: 'Fix', kind: 'open' });
  });
});
