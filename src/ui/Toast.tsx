'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { AppError } from '@/lib/errors';

import { Icon } from './Icon';
import styles from './ui.module.css';

type ToastTone = 'success' | 'error' | 'info';

type ToastItem = { id: number; title: string; description?: string; tone: ToastTone };

type ToastApi = {
  show: (toast: { title: string; description?: string; tone?: ToastTone }) => void;
  success: (title: string, description?: string) => void;
  /** Shows what failed and what to do, from an AppError when there is one. */
  error: (error: unknown, fallbackTitle?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const DURATION = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback<ToastApi['show']>(
    ({ title, description, tone = 'info' }) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { id, title, description, tone }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, description) => show({ title, description, tone: 'success' }),
      error: (error, fallbackTitle = 'Something went wrong') => {
        if (error instanceof AppError) {
          show({ title: error.title, description: error.description, tone: 'error' });
        } else {
          show({ title: fallbackTitle, description: 'Please try again.', tone: 'error' });
        }
      },
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.toasts} aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${
              toast.tone === 'success'
                ? styles.toastSuccess
                : toast.tone === 'error'
                  ? styles.toastError
                  : styles.toastInfo
            }`}
            role={toast.tone === 'error' ? 'alert' : 'status'}>
            <span className={styles.toastIcon}>
              <Icon
                name={toast.tone === 'success' ? 'check-circle' : toast.tone === 'error' ? 'alert-circle' : 'info'}
                size={16}
              />
            </span>
            <div className={styles.toastText}>
              <p className={styles.toastTitle}>{toast.title}</p>
              {toast.description ? <p className={styles.toastDescription}>{toast.description}</p> : null}
            </div>
            <button
              type="button"
              className={styles.toastClose}
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}>
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used inside ToastProvider');
  return toast;
}
