'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Button } from './Button';
import { Icon } from './Icon';
import styles from './ui.module.css';

/**
 * A modal built on the native <dialog>: focus is trapped and restored by the
 * browser, Escape closes it, and the page behind is inert.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
  custom = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /**
   * The children lay out their own <DialogBody> and <DialogFooter>, so a
   * component that only exists while the dialog is open can own both (and
   * start with fresh state every time it opens).
   */
  custom?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${wide ? styles.dialogWide : ''}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === ref.current) onClose();
      }}>
      {open ? (
        <div className={styles.dialogInner}>
          <header className={styles.dialogHead}>
            <div>
              <h2 className={styles.dialogTitle}>{title}</h2>
              {description ? <p className={styles.dialogDescription}>{description}</p> : null}
            </div>
            <Button variant="ghost" size="sm" icon="x" aria-label="Close" onClick={onClose} />
          </header>
          {custom ? (
            children
          ) : (
            <>
              {children ? <div className={styles.dialogBody}>{children}</div> : null}
              {footer ? <footer className={styles.dialogFoot}>{footer}</footer> : null}
            </>
          )}
        </div>
      ) : null}
    </dialog>
  );
}

export function DialogBody({ children }: { children: ReactNode }) {
  return <div className={styles.dialogBody}>{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <footer className={styles.dialogFoot}>{children}</footer>;
}

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** `await confirm({...})`, like the app's confirm(), drawn as a dialog. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(
    null,
  );

  const confirm = useCallback<ConfirmFn>(
    (options) => new Promise<boolean>((resolve) => setRequest({ ...options, resolve })),
    [],
  );

  const settle = (ok: boolean) => {
    request?.resolve(ok);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={request !== null}
        onClose={() => settle(false)}
        title={
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {request?.destructive ? (
              <Icon name="alert-triangle" size={18} className="confirm-warning" />
            ) : null}
            {request?.title}
          </span>
        }
        description={request?.message}
        footer={
          <>
            <Button variant="ghost" onClick={() => settle(false)}>
              {request?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant={request?.destructive ? 'danger' : 'primary'}
              onClick={() => settle(true)}
              autoFocus>
              {request?.confirmLabel}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside ConfirmProvider');
  return confirm;
}
