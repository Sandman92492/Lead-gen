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
            className={`pointer-events-auto w-full md:w-[420px] md:max-w-[92vw] lw-card bg-bg-card border-none rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px] shadow-2xl
               ${visible ? 'translate-y-0 md:translate-x-0' : 'translate-y-6 md:translate-x-6'}
               transition-transform`}
            style={{ maxHeight: '86vh', transitionDuration: `${EXIT_MS}ms` }}
          >
            <div className="px-6 pt-4 pb-3 border-b-2 border-slate-900/10">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-900/10 md:hidden" />
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {title && <div className="text-xl font-black text-text-primary uppercase tracking-tighter italic px-1">{title}</div>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 w-10 grid place-items-center rounded-full border border-border-subtle bg-bg-primary/50 text-text-secondary hover:text-text-primary hover:bg-bg-primary focus:outline-none focus:ring-4 focus:ring-action-primary/10 transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
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
