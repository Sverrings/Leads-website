// Shared with the iPhone app: Leads/src/features/leads/domain/collection.ts. Change both together (see README).
import type { LeadWithFollowUp } from '@/lib/models';
import { toDate } from '@/lib/dates';
import { normalizeForSearch } from '@/lib/strings';

import { getLeadInsight, type InsightContext, type LeadInsight, type LeadStage } from './insight';

export type EnrichedLead = LeadWithFollowUp & { insight: LeadInsight };

export type LeadFilter = 'all' | LeadStage;

export const LEAD_FILTERS: readonly { value: LeadFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'needs_follow_up', label: 'To do' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'replied', label: 'Replied' },
  { value: 'converted', label: 'Won' },
  { value: 'closed', label: 'Lost' },
];

export type LeadSort = 'priority' | 'recent' | 'name' | 'last_contact';

export const LEAD_SORTS: readonly { value: LeadSort; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'recent', label: 'Newest' },
  { value: 'last_contact', label: 'Last contact' },
  { value: 'name', label: 'Name' },
];

export function enrichLeads(
  leads: readonly LeadWithFollowUp[],
  context: InsightContext,
): EnrichedLead[] {
  return leads.map((lead) => ({ ...lead, insight: getLeadInsight(lead, context) }));
}

const SEARCH_FIELDS = ['name', 'company', 'email', 'phone', 'inquiry', 'source'] as const;

export function matchesQuery(lead: LeadWithFollowUp, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const haystack = SEARCH_FIELDS.map((field) => lead[field] ?? '')
    .map((value) => normalizeForSearch(value))
    .join(' ');
  const digits = (lead.phone ?? '').replace(/\D/g, '');
  return terms.every((term) => {
    if (haystack.includes(term)) return true;
    const termDigits = term.replace(/\D/g, '');
    return termDigits.length >= 3 && digits.includes(termDigits);
  });
}

export function filterLeads(
  leads: readonly EnrichedLead[],
  { filter, query }: { filter: LeadFilter; query: string },
): EnrichedLead[] {
  const normalized = normalizeForSearch(query);
  return leads.filter(
    (lead) => (filter === 'all' || lead.insight.stage === filter) && matchesQuery(lead, normalized),
  );
}

const STAGE_ORDER: Record<LeadStage, number> = {
  needs_follow_up: 0,
  replied: 0,
  waiting: 1,
  converted: 2,
  closed: 3,
};

function time(value: string | null): number {
  return value ? toDate(value).getTime() : 0;
}

export function sortLeads(leads: readonly EnrichedLead[], sort: LeadSort): EnrichedLead[] {
  const sorted = [...leads];
  switch (sort) {
    case 'recent':
      return sorted.sort((a, b) => time(b.created_at) - time(a.created_at));
    case 'name':
      return sorted.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      );
    case 'last_contact':
      return sorted.sort((a, b) => time(b.last_contact_at) - time(a.last_contact_at));
    case 'priority':
    default:
      return sorted.sort((a, b) => {
        const stage = STAGE_ORDER[a.insight.stage] - STAGE_ORDER[b.insight.stage];
        if (stage !== 0) return stage;
        const urgency = a.insight.urgencyAt - b.insight.urgencyAt;
        if (urgency !== 0 && Number.isFinite(urgency)) return urgency;
        if (a.insight.urgencyAt !== b.insight.urgencyAt) {
          return Number.isFinite(a.insight.urgencyAt) ? -1 : 1;
        }
        return time(b.updated_at) - time(a.updated_at);
      });
  }
}

export function countByStage(leads: readonly EnrichedLead[]): Record<LeadFilter, number> {
  const counts: Record<LeadFilter, number> = {
    all: leads.length,
    needs_follow_up: 0,
    waiting: 0,
    replied: 0,
    converted: 0,
    closed: 0,
  };
  for (const lead of leads) counts[lead.insight.stage] += 1;
  return counts;
}

/** Leads someone should act on now, most urgent first. */
export function selectNeedsAttention(leads: readonly EnrichedLead[]): EnrichedLead[] {
  return leads
    .filter((lead) => lead.insight.attention !== null)
    .sort((a, b) => a.insight.urgencyAt - b.insight.urgencyAt);
}

/** Follow-ups scheduled within the next `days`, soonest first. Excludes leads needing attention. */
export function selectUpcoming(
  leads: readonly EnrichedLead[],
  now: Date,
  days = 7,
): EnrichedLead[] {
  const horizon = now.getTime() + days * 24 * 60 * 60 * 1000;
  return leads
    .filter((lead) => {
      if (lead.insight.attention !== null || lead.follow_ups_paused) return false;
      if (lead.followUp?.status !== 'pending') return false;
      const at = time(lead.followUp.scheduled_for);
      return at > now.getTime() && at <= horizon;
    })
    .sort(
      (a, b) => time(a.followUp?.scheduled_for ?? null) - time(b.followUp?.scheduled_for ?? null),
    );
}
