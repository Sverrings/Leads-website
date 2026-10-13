'use client';

import Link from 'next/link';

import { dayKey, formatClock, formatDayLabel, formatRelative } from '@/lib/dates';
import { Icon } from '@/ui/Icon';

import type { ActivityEvent, TimelineEvent } from '../api';
import { describeEvent, isRedundantEvent, type EventTone } from '../describe-event';
import styles from './timeline.module.css';

const TONE_COLOR: Record<EventTone, string> = {
  default: 'var(--text-3)',
  accent: 'var(--accent-strong)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
};

/** The workspace feed: "10:42  Follow-up sent to John Hansen", grouped by day unless compact. */
export function ActivityList({
  events,
  now,
  compact = false,
}: {
  events: ActivityEvent[];
  now: Date;
  compact?: boolean;
}) {
  const visible = events.filter((event) => !isRedundantEvent(event));

  if (compact) {
    return (
      <ul className={styles.feed}>
        {visible.map((event) => (
          <ActivityItem key={event.id} event={event} now={now} timeLabel={formatRelative(event.created_at, now)} />
        ))}
      </ul>
    );
  }

  const groups: { key: string; label: string; items: ActivityEvent[] }[] = [];
  for (const event of visible) {
    const key = dayKey(event.created_at);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(event);
    else groups.push({ key, label: formatDayLabel(event.created_at, now), items: [event] });
  }

  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className={styles.day}>{group.label}</h3>
          <ul className={styles.feed}>
            {group.items.map((event) => (
              <ActivityItem key={event.id} event={event} now={now} timeLabel={formatClock(event.created_at)} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ActivityItem({ event, now, timeLabel }: { event: ActivityEvent; now: Date; timeLabel: string }) {
  const description = describeEvent(event, { now, leadName: event.lead?.name ?? 'A lead' });
  const body = (
    <>
      <span className={styles.icon} style={{ color: TONE_COLOR[description.tone] }}>
        <Icon name={description.icon} size={12} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{description.title}</span>
        {description.quote || description.description ? (
          <span className={styles.detail}>{description.quote ?? description.description}</span>
        ) : null}
      </span>
      <span className={styles.time}>{timeLabel}</span>
    </>
  );
  return (
    <li>
      {event.lead ? (
        <Link href={`/app/leads/${event.lead.id}`} className={styles.item}>
          {body}
        </Link>
      ) : (
        <div className={styles.item}>{body}</div>
      )}
    </li>
  );
}

/** One lead's history, newest first. */
export function LeadTimelineList({ events, now }: { events: TimelineEvent[]; now: Date }) {
  const visible = events.filter((event) => !isRedundantEvent(event));
  return (
    <ol className={styles.timeline}>
      {visible.map((event) => {
        const description = describeEvent(event, { now });
        return (
          <li key={event.id} className={styles.timelineItem}>
            <span className={styles.timelineIcon} style={{ color: TONE_COLOR[description.tone] }}>
              <Icon name={description.icon} size={12} />
            </span>
            <div className={styles.timelineBody}>
              <p className={styles.title}>
                {description.title}
                <span className={styles.timelineTime}>{formatRelative(event.created_at, now)}</span>
              </p>
              {description.description ? <p className={styles.detail}>{description.description}</p> : null}
              {description.quote ? <blockquote className={styles.quote}>{description.quote}</blockquote> : null}
              {event.actor?.display_name ? <p className={styles.actor}>by {event.actor.display_name}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
