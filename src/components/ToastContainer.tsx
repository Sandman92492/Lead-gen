import React from 'react';
import { useToast } from '../context/ToastContext';

const TONE: Record<'success' | 'error' | 'info', { label: string; colorVar: string }> = {
  success: { label: 'Success', colorVar: '--success' },
  error: { label: 'Error', colorVar: '--danger' },
  info: { label: 'Info', colorVar: '--info' },
};

const actionClass = (variant: 'primary' | 'secondary' | undefined): string => {
  if (variant === 'primary') return 'bg-action-primary text-white hover:bg-primary-pressed';
  return 'bg-transparent border border-border-subtle text-text-primary hover:bg-bg-primary/70';
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-[calc(var(--bottom-ui-offset)+4.5rem)] sm:bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const hasActions = Boolean(toast.actions?.length);
        return (
          <div
            key={toast.id}
            className="lw-toast pointer-events-auto w-full lw-glass-card px-4 py-3"
            role="status"
            aria-label={`${TONE[toast.type].label}: ${toast.message}`}
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: `var(${TONE[toast.type].colorVar})` }}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-5 font-medium text-text-primary">{toast.message}</div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="h-8 w-8 -mr-1 inline-flex items-center justify-center rounded-[12px] text-text-secondary hover:text-text-primary hover:bg-bg-primary/60 transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                aria-label="Dismiss"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {!hasActions && (
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="mt-2 w-full text-left text-[12px] leading-4 font-medium text-text-secondary hover:text-text-primary"
              >
                Tap to dismiss
              </button>
            )}

            {hasActions && (
              <div className="mt-3 flex items-center justify-end gap-2">
                {toast.actions!.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className={`h-10 px-4 rounded-[14px] text-[13px] font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--ring)] ${actionClass(
                      action.variant
                    )}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
