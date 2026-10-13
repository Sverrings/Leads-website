import {
  countByStage,
  enrichLeads,
  filterLeads,
  selectNeedsAttention,
  selectUpcoming,
  sortLeads,
} from '../collection';
import { hoursFromNow, makeFollowUp, makeLead, NOW } from './fixtures';

const context = { now: NOW, autoSendEnabled: false, locale: 'en-GB' };

const leads = enrichLeads(
  [
    makeLead({
      id: 'john',
      name: 'John Hansen',
      followUp: makeFollowUp({ scheduled_for: hoursFromNow(-5) }),
    }),
    makeLead({
      id: 'sarah',
      name: 'Sarah Olsen',
      email: 'sarah@example.com',
      inquiry: 'Bathroom remodel',
      status: 'replied',
      status_changed_at: hoursFromNow(-20),
    }),
    makeLead({
      id: 'ingrid',
      name: 'Ingrid Dahl',
      company: 'Nordic Homes AS',
      email: 'ingrid@nordichomes.no',
      inquiry: 'Oak parquet',
      followUp: makeFollowUp({ scheduled_for: hoursFromNow(18) }),
    }),
    makeLead({ id: 'emma', name: 'Emma Larsen', email: null, inquiry: null, status: 'converted' }),
    makeLead({
      id: 'søren',
      name: 'Søren Kristiansen',
      email: null,
      inquiry: null,
      phone: '+47 455 81 230',
      status: 'closed',
    }),
  ],
  context,
);

describe('lead collections', () => {
  it('counts every stage', () => {
    expect(countByStage(leads)).toEqual({
      all: 5,
      needs_follow_up: 1,
      waiting: 1,
      replied: 1,
      converted: 1,
      closed: 1,
    });
  });

  it('lists what needs attention, oldest first', () => {
    expect(selectNeedsAttention(leads).map((l) => l.id)).toEqual(['sarah', 'john']);
  });

  it('filters by stage', () => {
    expect(filterLeads(leads, { filter: 'waiting', query: '' }).map((l) => l.id)).toEqual([
      'ingrid',
    ]);
  });

  it('searches across name, company and phone, ignoring accents and case', () => {
    expect(filterLeads(leads, { filter: 'all', query: 'nordic' }).map((l) => l.id)).toEqual([
      'ingrid',
    ]);
    expect(filterLeads(leads, { filter: 'all', query: 'soren' }).map((l) => l.id)).toEqual([
      'søren',
    ]);
    expect(filterLeads(leads, { filter: 'all', query: '45581' }).map((l) => l.id)).toEqual([
      'søren',
    ]);
    expect(filterLeads(leads, { filter: 'all', query: 'john kitchen' }).map((l) => l.id)).toEqual([
      'john',
    ]);
  });

  it('sorts by priority: attention first, then upcoming, then finished', () => {
    expect(sortLeads(leads, 'priority').map((l) => l.id)).toEqual([
      'sarah',
      'john',
      'ingrid',
      'emma',
      'søren',
    ]);
  });

  it('sorts by name', () => {
    expect(sortLeads(leads, 'name').map((l) => l.id)).toEqual([
      'emma',
      'ingrid',
      'john',
      'sarah',
      'søren',
    ]);
  });

  it('lists upcoming follow-ups within the window, soonest first', () => {
    const later = enrichLeads(
      [
        makeLead({ id: 'week', followUp: makeFollowUp({ scheduled_for: hoursFromNow(24 * 6) }) }),
        makeLead({ id: 'soon', followUp: makeFollowUp({ scheduled_for: hoursFromNow(30) }) }),
        makeLead({ id: 'far', followUp: makeFollowUp({ scheduled_for: hoursFromNow(24 * 9) }) }),
        makeLead({
          id: 'paused',
          follow_ups_paused: true,
          followUp: makeFollowUp({ scheduled_for: hoursFromNow(3) }),
        }),
      ],
      context,
    );
    expect(selectUpcoming(later, NOW).map((l) => l.id)).toEqual(['soon', 'week']);
    expect(selectUpcoming(leads, NOW).map((l) => l.id)).toEqual(['ingrid']);
  });
});
