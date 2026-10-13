import type { CSSProperties, ReactNode } from 'react';

import { AppError } from '@/lib/errors';
import { getInitials } from '@/lib/strings';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

export type Tone = 'accent' | 'neutral' | 'muted' | 'success' | 'warning' | 'danger';

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`${styles.badge} ${styles[`tone-${tone}`]}`}>
      {dot ? <span className={styles.badgeDot} /> : null}
      {children}
    </span>
  );
}

/** Initials on a tinted circle, tinted by the name so people are easy to tell apart. */
const HUES = ['#1e2633', '#262033', '#1f2b26', '#2e2620', '#2a1f2b', '#1f2a2e', '#2b2a1f'];

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return (
    <span
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: HUES[Math.abs(hash) % HUES.length],
      }}
      aria-hidden="true">
      {getInitials(name)}
    </span>
  );
}

export function Card({
  title,
  subtitle,
  actions,
  padded = true,
  children,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${styles.card} ${className ?? ''}`}>
      {title ? (
        <header className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>{title}</h2>
            {subtitle ? <p className={styles.cardSub}>{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className={padded ? styles.cardPadded : undefined}>{children}</div>
    </section>
  );
}

export function Skeleton({
  width = '100%',
  height = 12,
  radius,
  style,
}: {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className={styles.skeleton}
      style={{ display: 'block', width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: 'grid', gap: 18, padding: '8px 0' }} aria-label="Loading" role="status">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton width={32} height={32} radius={16} />
          <div style={{ flex: 1, display: 'grid', gap: 8 }}>
            <Skeleton width={`${50 - index * 6}%`} />
            <Skeleton width={`${30 + index * 4}%`} height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.state}>
      <span className={styles.stateIcon}>
        <Icon name={icon} size={18} />
      </span>
      <p className={styles.stateTitle}>{title}</p>
      {description ? <p className={styles.stateText}>{description}</p> : null}
      {action ? <div className={styles.stateAction}>{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  error,
  onRetry,
}: {
  title: string;
  error?: unknown;
  onRetry?: () => void;
}) {
  const description =
    error instanceof AppError ? error.description : 'Something went wrong. Please try again.';
  return (
    <div className={styles.state} role="alert">
      <span className={styles.stateIcon} style={{ color: 'var(--danger)' }}>
        <Icon name="alert-triangle" size={18} />
      </span>
      <p className={styles.stateTitle}>{title}</p>
      <p className={styles.stateText}>{description}</p>
      {onRetry ? (
        <div className={styles.stateAction}>
          <Button size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export type Segment<T extends string> = { value: T; label: string; count?: number };

export function Segmented<T extends string>({
  segments,
  value,
  onChange,
  label,
}: {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {segments.map((segment) => (
        <button
          key={segment.value}
          type="button"
          className={styles.segment}
          aria-pressed={segment.value === value}
          onClick={() => onChange(segment.value)}>
          {segment.label}
          {segment.count !== undefined ? (
            <span className={styles.segmentCount}>{segment.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
