'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';

import styles from './ui.module.css';

type FieldChrome = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  /** Something on the right of the label row, e.g. "Forgot password?". */
  aside?: ReactNode;
};

function Frame({
  id,
  label,
  hint,
  error,
  optional,
  aside,
  children,
}: FieldChrome & { id: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      {label || aside ? (
        <div className={styles.label}>
          {label ? (
            <label htmlFor={id}>
              {label}
              {optional ? <span className={styles.optional}> · optional</span> : null}
            </label>
          ) : (
            <span />
          )}
          {aside}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string | null, hint?: ReactNode) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({
  label,
  hint,
  error,
  optional,
  aside,
  id: givenId,
  className,
  ...input
}: FieldChrome & ComponentProps<'input'>) {
  const generated = useId();
  const id = givenId ?? generated;
  return (
    <Frame id={id} label={label} hint={hint} error={error} optional={optional} aside={aside}>
      <input
        id={id}
        className={`${styles.input} ${error ? styles.invalid : ''} ${className ?? ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...input}
      />
    </Frame>
  );
}

export function TextArea({
  label,
  hint,
  error,
  optional,
  aside,
  id: givenId,
  className,
  ...input
}: FieldChrome & ComponentProps<'textarea'>) {
  const generated = useId();
  const id = givenId ?? generated;
  return (
    <Frame id={id} label={label} hint={hint} error={error} optional={optional} aside={aside}>
      <textarea
        id={id}
        className={`${styles.input} ${error ? styles.invalid : ''} ${className ?? ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...input}
      />
    </Frame>
  );
}

export type SelectOption = { value: string; label: string };

export function SelectField({
  label,
  hint,
  error,
  optional,
  aside,
  options,
  id: givenId,
  className,
  ...select
}: FieldChrome & ComponentProps<'select'> & { options: readonly SelectOption[] }) {
  const generated = useId();
  const id = givenId ?? generated;
  return (
    <Frame id={id} label={label} hint={hint} error={error} optional={optional} aside={aside}>
      <select
        id={id}
        className={`${styles.input} ${error ? styles.invalid : ''} ${className ?? ''}`}
        aria-describedby={describedBy(id, error, hint)}
        {...select}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Frame>
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className={styles.check}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={styles.switch}
      onClick={() => onChange(!checked)}
    />
  );
}
