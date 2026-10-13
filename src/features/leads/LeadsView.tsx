'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { formatRelative, formatShortDate } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { pluralize } from '@/lib/strings';
import { ButtonLink } from '@/ui/Button';
import { Avatar, Card, EmptyState, ErrorState, Segmented, SkeletonRows } from '@/ui/Display';
import { Icon } from '@/ui/Icon';

import { PageHeader } from '../panel/Page';
import { NextActionText, StatusBadge } from './components/LeadBits';
import styles from './components/leads.module.css';
import {
  countByStage,
  filterLeads,
  LEAD_FILTERS,
  LEAD_SORTS,
  selectNeedsAttention,
  sortLeads,
  type LeadFilter,
  type LeadSort,
} from './domain/collection';
import { useEnrichedLeads } from './hooks';

function isFilter(value: string | null): value is LeadFilter {
  return LEAD_FILTERS.some((filter) => filter.value === value);
}

function isSort(value: string | null): value is LeadSort {
  return LEAD_SORTS.some((sort) => sort.value === value);
}

/**
 * Every lead in one table: search by name, company, email, phone or what they
 * asked about; filter by where they are; sort by priority, newest, last
 * contact or name. Filters live in the address, so Back returns to the same view.
 */
export function LeadsView() {
  const now = useNow();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const leadsQuery = useEnrichedLeads();
  const { leads } = leadsQuery;

  const stageParam = params.get('stage');
  const sortParam = params.get('sort');
  const filter: LeadFilter = isFilter(stageParam) ? stageParam : 'all';
  const sort: LeadSort = isSort(sortParam) ? sortParam : 'priority';
  const [query, setQuery] = useState(params.get('q') ?? '');

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === 'all' || value === 'priority') next.delete(key);
      else next.set(key, value);
    }
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  const counts = useMemo(() => countByStage(leads), [leads]);
  const visible = useMemo(
    () => sortLeads(filterLeads(leads, { filter, query }), sort),
    [leads, filter, query, sort],
  );
  const attention = useMemo(() => selectNeedsAttention(leads).length, [leads]);

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle={
          leadsQuery.isPending
            ? ' '
            : `${pluralize(leads.length, 'lead')}${attention > 0 ? ` · ${attention} need${attention === 1 ? 's' : ''} you` : ''}`
        }
        actions={
          <ButtonLink href="/app/leads/new" variant="primary" icon="plus">
            New lead
          </ButtonLink>
        }
      />

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Icon name="search" size={15} />
          <span className="visually-hidden">Search leads</span>
          <input
            type="search"
            placeholder="Search name, phone, job…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              update({ q: event.target.value });
            }}
          />
        </label>
        <Segmented
          label="Filter by stage"
          value={filter}
          onChange={(value) => update({ stage: value })}
          segments={LEAD_FILTERS.map((option) => ({
            value: option.value,
            label: option.label,
            count: leadsQuery.isPending ? undefined : counts[option.value],
          }))}
        />
        <label style={{ marginLeft: 'auto' }}>
          <span className="visually-hidden">Sort by</span>
          <select className={styles.sort} value={sort} onChange={(event) => update({ sort: event.target.value })}>
            {LEAD_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Card padded={false}>
        {leadsQuery.isPending ? (
          <div style={{ padding: '12px 20px' }}>
            <SkeletonRows rows={6} />
          </div>
        ) : leadsQuery.isError ? (
          <ErrorState title="Unable to load leads" error={leadsQuery.error} onRetry={() => void leadsQuery.refetch()} />
        ) : leads.length === 0 ? (
          <EmptyState
            icon="user-plus"
            title="No leads yet"
            description="Add the people who asked about your work. Leads tells you when to follow up."
            action={
              <ButtonLink href="/app/leads/new" variant="primary" icon="plus">
                New lead
              </ButtonLink>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState icon="search" title="No leads match" description="Try another search or filter." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Lead</th>
                  <th scope="col">Status</th>
                  <th scope="col">Next step</th>
                  <th scope="col" className={styles.hideSmall}>
                    Last contact
                  </th>
                  <th scope="col" className={styles.hideSmall}>
                    Added
                  </th>
                  <th scope="col" className={styles.hideSmall}>
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((lead) => (
                  <tr key={lead.id} onClick={() => router.push(`/app/leads/${lead.id}`)}>
                    <td>
                      <div className={styles.cellLead}>
                        <Avatar name={lead.name} size={30} />
                        <span className={styles.who}>
                          <Link
                            href={`/app/leads/${lead.id}`}
                            className={styles.name}
                            onClick={(event) => event.stopPropagation()}>
                            {lead.name}
                          </Link>
                          <span className={styles.context}>
                            {lead.company || lead.inquiry || lead.email || lead.phone || ' '}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className={styles.nextCell}>
                      <NextActionText action={lead.insight.nextAction} />
                    </td>
                    <td className={`${styles.muted} ${styles.hideSmall}`}>
                      {lead.last_contact_at ? formatRelative(lead.last_contact_at, now) : 'Not yet'}
                    </td>
                    <td className={`${styles.muted} ${styles.hideSmall}`}>{formatShortDate(lead.created_at, now)}</td>
                    <td className={`${styles.muted} ${styles.hideSmall}`}>{lead.source ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
