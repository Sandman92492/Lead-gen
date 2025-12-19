import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type BottomSheetProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

const EXIT_MS = 180;

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, title, onClose, children }) => {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setVisible(false);
      const id = window.setTimeout(() => setVisible(true), 10);
      return () => window.clearTimeout(id);
    }

    setVisible(false);
    const id = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted]);

  const sheet = useMemo(() => {
    if (!mounted) return null;
    return (
      <div
        className={`fixed inset-0 z-50 ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        style={{ transitionDuration: `${EXIT_MS}ms` }}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/55"
          aria-label="Close"
          onClick={onClose}
        />

        <div className="absolute inset-0 flex items-end md:items-stretch md:justify-end pointer-events-none">
          <div
            className={`pointer-events-auto w-full md:w-[420px] md:max-w-[92vw] lw-card bg-bg-card border-t border-border-subtle md:border-l md:border-t-0 rounded-t-[28px] md:rounded-t-none md:rounded-l-[28px] shadow-[var(--shadow-float)]
              ${visible ? 'translate-y-0 md:translate-x-0' : 'translate-y-6 md:translate-x-6'}
              transition-transform`}
            style={{ maxHeight: '86vh', transitionDuration: `${EXIT_MS}ms` }}
          >
            <div className="px-5 pt-3 pb-2 md:pt-5 md:pb-3 border-b border-border-subtle">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-border-subtle md:hidden opacity-70" />
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {title && <div className="text-[18px] leading-6 font-semibold text-text-primary truncate">{title}</div>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 w-10 grid place-items-center rounded-[14px] border border-border-subtle bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-primary focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: 'calc(86vh - 64px)' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }, [children, mounted, onClose, title, visible]);

  return sheet ? createPortal(sheet, document.body) : null;
};

export default BottomSheet;
