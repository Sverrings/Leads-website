'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

export type MenuEntry =
  | {
      label: string;
      icon?: IconName;
      onSelect: () => void;
      destructive?: boolean;
      disabled?: boolean;
    }
  | 'divider'
  | { heading: string };

/**
 * A small dropdown: opens from its trigger, closes on Escape, on an outside
 * click or after a choice.
 */
export function Menu({
  trigger,
  entries,
  align = 'right',
  direction = 'down',
  label,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  entries: readonly MenuEntry[];
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.menuWrap} ref={ref}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open ? (
        <div
          className={`${styles.menu} ${align === 'left' ? styles.menuLeft : ''} ${
            direction === 'up' ? styles.menuUp : ''
          }`}
          role="menu"
          aria-label={label}>
          {entries.map((entry, index) => {
            if (entry === 'divider') return <div key={index} className={styles.menuDivider} />;
            if ('heading' in entry) {
              return (
                <p key={index} className={styles.menuLabel}>
                  {entry.heading}
                </p>
              );
            }
            return (
              <button
                key={index}
                type="button"
                role="menuitem"
                disabled={entry.disabled}
                className={`${styles.menuItem} ${entry.destructive ? styles.menuDanger : ''}`}
                onClick={() => {
                  setOpen(false);
                  entry.onSelect();
                }}>
                {entry.icon ? <Icon name={entry.icon} size={15} /> : null}
                {entry.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
