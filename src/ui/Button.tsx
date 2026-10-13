import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** Icon after the label, e.g. an arrow. */
  trailingIcon?: IconName;
  fullWidth?: boolean;
  children?: ReactNode;
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: styles.primary!,
  secondary: styles.secondary!,
  ghost: styles.ghost!,
  danger: styles.danger!,
  accent: styles.accentButton!,
};

function classes({
  variant = 'secondary',
  size = 'md',
  fullWidth,
  iconOnly,
  className,
}: CommonProps & { iconOnly?: boolean; className?: string }) {
  return [
    styles.button,
    VARIANT[variant],
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '',
    fullWidth ? styles.full : '',
    iconOnly ? styles.iconOnly : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

const iconSize = (size: ButtonSize | undefined) => (size === 'sm' ? 14 : 16);

export function Button({
  variant,
  size,
  icon,
  trailingIcon,
  fullWidth,
  loading = false,
  children,
  className,
  type = 'button',
  disabled,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  const content = (
    <>
      {icon ? <Icon name={icon} size={iconSize(size)} /> : null}
      {children}
      {trailingIcon ? <Icon name={trailingIcon} size={iconSize(size)} /> : null}
    </>
  );
  return (
    <button
      type={type}
      className={classes({ variant, size, fullWidth, iconOnly: !children, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}>
      {loading ? (
        <>
          <span className={styles.loadingLabel}>{content}</span>
          <span className={styles.loadingSpinner}>
            <span className={styles.spinner} />
          </span>
        </>
      ) : (
        content
      )}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  trailingIcon,
  fullWidth,
  children,
  className,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={classes({ variant, size, fullWidth, iconOnly: !children, className })} {...rest}>
      {icon ? <Icon name={icon} size={iconSize(size)} /> : null}
      {children}
      {trailingIcon ? <Icon name={trailingIcon} size={iconSize(size)} /> : null}
    </Link>
  );
}

export function Spinner() {
  return <span className={styles.spinner} role="status" aria-label="Loading" />;
}
