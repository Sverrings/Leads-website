import { Skeleton } from '@/ui/Display';

import styles from './today.module.css';

const TONE: Record<string, string> = {
  accent: 'var(--accent-strong)',
  success: 'var(--success)',
  warning: 'var(--warning)',
};

/** One number with a label. `null` while loading. */
export function StatTile({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number | string | null;
  tone?: 'accent' | 'success' | 'warning';
  hint?: string;
}) {
  return (
    <div className={styles.stat}>
      <p className={styles.statLabel}>{label}</p>
      {value === null ? (
        <Skeleton width={48} height={28} style={{ marginTop: 6 }} />
      ) : (
        <p className={styles.statValue} style={tone ? { color: TONE[tone] } : undefined}>
          {value}
        </p>
      )}
      {hint ? <p className={styles.statHint}>{hint}</p> : null}
    </div>
  );
}
