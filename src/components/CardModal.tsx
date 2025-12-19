import React, { ReactNode } from 'react';
import BaseModal from './BaseModal';

type CardModalVariant = 'member' | 'guest' | 'pass' | 'neutral';

type CardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: CardModalVariant;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  zIndex?: number;
};

const glowByVariant: Record<CardModalVariant, string> = {
  member: 'bg-action-primary/20',
  guest: 'bg-brand-yellow/22',
  pass: 'bg-brand-yellow/18',
  neutral: 'bg-action-primary/14',
};

const closeButtonByVariant: Record<CardModalVariant, string> = {
  member: 'bg-bg-card/80 text-text-primary hover:text-text-primary ring-1 ring-border-subtle/70 backdrop-blur',
  guest: 'bg-bg-card/80 text-text-primary hover:text-text-primary ring-1 ring-border-subtle/70 backdrop-blur',
  pass: 'bg-black/35 text-brand-white/85 hover:text-brand-white ring-1 ring-brand-yellow/30 backdrop-blur',
  neutral: 'bg-bg-card/80 text-text-primary hover:text-text-primary ring-1 ring-border-subtle/70 backdrop-blur',
};

const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  children,
  variant = 'neutral',
  maxWidth = 'sm',
  zIndex = 50,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      zIndex={zIndex}
      title={undefined}
      contentClassName="relative"
      panelClassName="bg-transparent border-0 shadow-none p-0"
      closeButtonClassName={`${closeButtonByVariant[variant]} rounded-[var(--r-lg)] px-2 py-2`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${glowByVariant[variant]}`} />
        <div className={`absolute -bottom-20 right-0 h-80 w-80 rounded-full blur-3xl ${glowByVariant[variant]}`} />
      </div>
      <div className="relative flex items-center justify-center">{children}</div>
    </BaseModal>
  );
};

export default CardModal;

