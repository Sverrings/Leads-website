'use client';

import { useMemo, useState } from 'react';

import { formatDateTime } from '@/lib/dates';
import { TextField } from '@/ui/Field';

import styles from '../leads/components/form.module.css';
import { defaultCustomTime, getSchedulePresets } from './schedule-presets';

function toLocalInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * When to follow up: automatic (the follow-up rules), one of the app's quick
 * choices, or a date and time. `null` means automatic.
 */
export function FollowUpTimePicker({
  value,
  onChange,
  now,
  automatic,
}: {
  value: Date | null;
  onChange: (value: Date | null) => void;
  now: Date;
  /** Offer "Automatic" first, with this description. Omit to require a time. */
  automatic?: { label: string; description: string };
}) {
  const presets = useMemo(() => getSchedulePresets(now), [now]);
  const [custom, setCustom] = useState(false);
  const matchesPreset = (date: Date) => presets.some((preset) => preset.at.getTime() === date.getTime());
  const showCustom = custom || (value !== null && !matchesPreset(value));

  return (
    <div className={styles.section}>
      <div className={styles.choices}>
        {automatic ? (
          <button
            type="button"
            className={styles.choice}
            aria-pressed={value === null && !showCustom}
            onClick={() => {
              setCustom(false);
              onChange(null);
            }}>
            <span className={styles.choiceLabel}>{automatic.label}</span>
            <span className={styles.choiceDetail}>{automatic.description}</span>
          </button>
        ) : null}
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={styles.choice}
            aria-pressed={!showCustom && value?.getTime() === preset.at.getTime()}
            onClick={() => {
              setCustom(false);
              onChange(preset.at);
            }}>
            <span className={styles.choiceLabel}>{preset.label}</span>
            <span className={styles.choiceDetail}>{formatDateTime(preset.at, now)}</span>
          </button>
        ))}
        <button
          type="button"
          className={styles.choice}
          aria-pressed={showCustom}
          onClick={() => {
            setCustom(true);
            if (!value || matchesPreset(value)) onChange(defaultCustomTime(now));
          }}>
          <span className={styles.choiceLabel}>Pick a time</span>
          <span className={styles.choiceDetail}>Any day and time</span>
        </button>
      </div>
      {showCustom && value ? (
        <div style={{ maxWidth: 280 }}>
          <TextField
            label="Date and time"
            type="datetime-local"
            value={toLocalInput(value)}
            min={toLocalInput(now)}
            onChange={(event) => {
              const next = new Date(event.target.value);
              if (!Number.isNaN(next.getTime())) onChange(next);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
